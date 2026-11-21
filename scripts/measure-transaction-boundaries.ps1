param(
    [string]$SourceRoot = (Split-Path -Parent $PSScriptRoot),
    [string]$BaselineRef = '9f9305e0d3c298f872c4881b58215dc541165298',
    [string]$WorkRoot = (Join-Path ([IO.Path]::GetTempPath()) ('tracelog-boundary-' + [Guid]::NewGuid().ToString('N'))),
    [string]$PgBin = 'C:\Program Files\PostgreSQL\17\bin',
    [ValidateRange(1024, 65535)][int]$Port = 55439,
    [ValidateRange(1, 1000)][int]$Samples = 30,
    [ValidateRange(1, 2000)][int]$DelayMs = 400,
    [switch]$Offline
)

$ErrorActionPreference = 'Stop'

function Invoke-Checked([string]$Program, [string[]]$Arguments) {
    & $Program @Arguments
    if ($LASTEXITCODE -ne 0) {
        throw "$Program exited with code $LASTEXITCODE"
    }
}

$SourceRoot = (Resolve-Path -LiteralPath $SourceRoot).Path
$WorkRoot = [IO.Path]::GetFullPath($WorkRoot)
if (Test-Path -LiteralPath $WorkRoot) { throw "Choose a new work directory: $WorkRoot" }

$initdb = Join-Path $PgBin 'initdb.exe'
$pgCtl = Join-Path $PgBin 'pg_ctl.exe'
$createdb = Join-Path $PgBin 'createdb.exe'
$psql = Join-Path $PgBin 'psql.exe'
foreach ($program in @($initdb, $pgCtl, $createdb, $psql)) {
    if (-not (Test-Path -LiteralPath $program)) { throw "PostgreSQL binary is missing: $program" }
}

$git = Get-Command git -CommandType Application | Select-Object -First 1 -ExpandProperty Source
$benchmarkTest = 'src/test/java/com/kumohcse/tracelog/service/ExternalCallBenchmarkTest.java'
$sourceBackend = Join-Path $SourceRoot 'backend'
if (-not (Test-Path -LiteralPath (Join-Path $sourceBackend $benchmarkTest))) {
    throw "Benchmark test is missing from $sourceBackend"
}

New-Item -ItemType Directory -Path $WorkRoot | Out-Null
$archive = Join-Path $WorkRoot 'baseline.zip'
Invoke-Checked $git @('-C', $SourceRoot, 'archive', '--format=zip', "--output=$archive", $BaselineRef, 'backend')
Expand-Archive -LiteralPath $archive -DestinationPath (Join-Path $WorkRoot 'before')
$before = Join-Path $WorkRoot 'before/backend'
$after = Join-Path $WorkRoot 'after/backend'
New-Item -ItemType Directory -Path $after | Out-Null
foreach ($item in @('gradlew.bat', 'gradlew', 'gradle', 'build.gradle', 'settings.gradle', 'src')) {
    Copy-Item -LiteralPath (Join-Path $sourceBackend $item) -Destination $after -Recurse
}
$beforeTest = Join-Path $before $benchmarkTest
$beforeTestDir = Split-Path -Parent $beforeTest
if (-not (Test-Path -LiteralPath $beforeTestDir)) {
    New-Item -ItemType Directory -Path $beforeTestDir | Out-Null
}
Copy-Item -LiteralPath (Join-Path $after $benchmarkTest) -Destination $beforeTest

$environment = @{
    PGPASSWORD = [Guid]::NewGuid().ToString('N')
    TRACELOG_BOUNDARY_MODE = 'measure'
    TRACELOG_BOUNDARY_DB_USER = 'tracelog_boundary'
    TRACELOG_BOUNDARY_DB_URL = ''
    TRACELOG_BOUNDARY_SAMPLES = [string]$Samples
    TRACELOG_BOUNDARY_DELAY_MS = [string]$DelayMs
}
$environment.TRACELOG_BOUNDARY_DB_PASSWORD = $environment.PGPASSWORD
$savedEnvironment = @{}
foreach ($name in $environment.Keys) {
    $savedEnvironment[$name] = [Environment]::GetEnvironmentVariable($name, 'Process')
    [Environment]::SetEnvironmentVariable($name, $environment[$name], 'Process')
}

$databaseDirectory = Join-Path $WorkRoot 'postgres'
$databaseLog = Join-Path $WorkRoot 'postgres.log'
$passwordFile = Join-Path $WorkRoot 'initdb-password.txt'
$serverStarted = $false
$summary = Join-Path $WorkRoot 'results.txt'

try {
    Set-Content -LiteralPath $passwordFile -Value $environment.PGPASSWORD -Encoding ASCII
    Invoke-Checked $initdb @('-D', $databaseDirectory, '-U', $environment.TRACELOG_BOUNDARY_DB_USER,
        '-A', 'scram-sha-256', '--encoding=UTF8', '--no-locale', "--pwfile=$passwordFile")
    Remove-Item -LiteralPath $passwordFile
    Invoke-Checked $pgCtl @('-D', $databaseDirectory, '-l', $databaseLog, '-o', "-h 127.0.0.1 -p $Port", '-w', 'start')
    $serverStarted = $true
    $connectionArguments = @('-h', '127.0.0.1', '-p', [string]$Port, '-U', $environment.TRACELOG_BOUNDARY_DB_USER)
    $migrations = Join-Path $before 'src/main/resources/db/migration'

    foreach ($phase in @('before', 'after')) {
        $backend = if ($phase -eq 'before') { $before } else { $after }
        $database = "tracelog_$phase"
        Invoke-Checked $createdb ($connectionArguments + @($database))
        Invoke-Checked $psql ($connectionArguments + @('-d', $database, '-v', 'ON_ERROR_STOP=1',
            '-f', (Join-Path $migrations 'V1__create_table.sql'),
            '-f', (Join-Path $migrations 'V2__create_notifications_table.sql'),
            '-f', (Join-Path $migrations 'V3__add_danger_score_gap_to_detection_settings.sql')))
        $env:TRACELOG_BOUNDARY_DB_URL = "jdbc:postgresql://127.0.0.1:$Port/$database"

        Push-Location -LiteralPath $backend
        try {
            $arguments = @('test', '--tests', '*ExternalCallBenchmarkTest', '--no-daemon')
            if ($Offline) { $arguments += '--offline' }
            Invoke-Checked (Join-Path $backend 'gradlew.bat') $arguments
        } finally {
            Pop-Location
        }

        $resultPath = Join-Path $backend 'build/test-results/test/TEST-com.kumohcse.tracelog.service.ExternalCallBenchmarkTest.xml'
        [xml]$report = Get-Content -LiteralPath $resultPath -Raw -Encoding UTF8
        $output = $report.SelectSingleNode('/testsuite/system-out')
        $result = ($output.InnerText -split '\r?\n') | Where-Object { $_ -like 'TRACELOG_BOUNDARY *' }
        if (-not $result) { throw "Benchmark numbers are missing from $resultPath" }
        Add-Content -LiteralPath $summary -Value "$phase $result" -Encoding UTF8
    }

    Get-Content -LiteralPath $summary -Encoding UTF8
    Write-Output "Results: $summary"
} finally {
    if (Test-Path -LiteralPath $passwordFile) { Remove-Item -LiteralPath $passwordFile }
    if ($serverStarted) {
        & $pgCtl -D $databaseDirectory -m fast -w stop
    }
    foreach ($name in $savedEnvironment.Keys) {
        [Environment]::SetEnvironmentVariable($name, $savedEnvironment[$name], 'Process')
    }
}
