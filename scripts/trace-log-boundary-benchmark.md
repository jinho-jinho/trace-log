# TraceLog 외부 호출 전후 측정

Windows에서 Java 17, Git, PostgreSQL 17을 사용한다. Windows PowerShell에서 저장소 루트로 이동해 실행한다. `-ExecutionPolicy RemoteSigned`는 아래 명령으로 시작한 프로세스에만 적용된다.

```powershell
powershell.exe -NoProfile -ExecutionPolicy RemoteSigned -File .\scripts\measure-transaction-boundaries.ps1
```

기본값은 워밍업 3회, 측정 30회, 가짜 SMTP·Gemini 지연 각 400ms다. 개선 전 기준 커밋과 현재 백엔드 소스를 Windows 임시 폴더에 복사한다. 보통 `C:` 디스크다. 두 버전은 같은 PostgreSQL 인스턴스의 별도 DB를 사용하고, 작업이 끝나면 이 인스턴스를 종료한다. 실험 DB, JUnit 리포트, `results.txt`는 스크립트가 출력한 폴더에 남는다. 기존 DB와 실제 SMTP·Gemini 계정을 사용하지 않는다.

```powershell
# 내부 디스크에 새 작업 폴더를 지정하고 표본 수를 늘린다.
powershell.exe -NoProfile -ExecutionPolicy RemoteSigned -File .\scripts\measure-transaction-boundaries.ps1 `
    -WorkRoot "$env:LOCALAPPDATA\TraceLogBench\run-01" -Samples 100 -DelayMs 400
```

PostgreSQL 경로가 다르면 `-PgBin`에 `initdb.exe`, `pg_ctl.exe`, `createdb.exe`, `psql.exe`가 있는 폴더를 넣는다. 기본 포트 55439가 사용 중이면 `-Port`로 변경한다. Gradle 의존성이 이미 캐시돼 있으면 `-Offline`으로 실행할 수 있다.

| 출력 항목 | 읽는 방법 |
| --- | --- |
| `import_service_p95_ms` | 관리자 1명, 위험 세션이 처음 들어오는 조건에서 수신 서비스 반환까지의 p95. 커밋 시간을 포함한다. |
| `smtp_calls_in_import` | 측정한 수신 호출 경로에서 SMTP를 호출한 횟수. 뒷단 워커의 발송 완료 지연은 이 지표와 별개다. |
| `llm_wait_active_db_min`, `llm_wait_active_db_max` | 가짜 Gemini 응답을 기다리는 중에 본 Hikari 활성 연결 수. 다른 요청이 없는 조건이다. |
| `llm_calls_in_tx`, `llm_service_p95_ms` | 외부 호출 시 실제 트랜잭션 활성 여부와 LLM 서비스 전체 응답 p95. 응답 지연은 개선 후에도 포함된다. |

수신 지연 비교에는 순차로 호출한 **백엔드 서비스 p95**라고 명시한다. 멀티 유저 HTTP 부하와 SMTP 전달 시간은 이 실험의 범위 밖이다. 같은 환경에서 3회 정도 실행하고 표본 수, 삽입 지연, Java·PostgreSQL 버전, 전후 결과를 함께 기록한다.

`ExternalCallIsolationTest`는 같은 PostgreSQL 구성에서 롤백 시 발송 작업 미생성, 일시 SMTP 실패 후 재시도, 워커가 남긴 발송 작업의 임대 만료 후 재수거, Gemini 대기 중 연결 반환, 재수신으로 달라진 세션에 대한 이전 응답의 저장 거부를 검증한다. 별도 테스트 DB의 V1~V3 적용 후 `TRACELOG_BOUNDARY_MODE=verify`, `TRACELOG_BOUNDARY_DB_URL`, `TRACELOG_BOUNDARY_DB_USER`, `TRACELOG_BOUNDARY_DB_PASSWORD`를 설정하고 `backend`에서 `gradlew.bat test --tests '*ExternalCallIsolationTest'`를 실행한다.

기존 앱은 Hibernate `ddl-auto=update`로 새 컬럼과 Outbox 테이블을 생성한다. 자동 스키마 변경을 끄고 운영하는 환경은 `backend/src/main/resources/db/migration/V4__separate_external_calls.sql`을 적용한다. SMTP가 메일을 받은 뒤 `SENT` 기록 전에 프로세스가 종료되면 재시도에서 중복 발송될 수 있다.
