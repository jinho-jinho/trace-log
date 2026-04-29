export const threshold = 0.4;

export const rangeOptions = [
  { key: "1h", label: "1H" },
  { key: "24h", label: "24H" },
  { key: "7d", label: "7D" },
];

export const chartSeries = {
  "1h": {
    labels: ["00", "05", "10", "15", "20", "25", "30", "35", "40", "45", "50", "55"],
    values: [0.08, 0.12, 0.16, 0.2, 0.24, 0.31, 0.52, 0.48, 0.36, 0.22, 0.18, 0.14],
  },
  "24h": {
    labels: [
      "00:00",
      "01:00",
      "02:00",
      "03:00",
      "04:00",
      "05:00",
      "06:00",
      "07:00",
      "08:00",
      "09:00",
      "10:00",
      "11:00",
      "12:00",
      "13:00",
      "14:00",
      "15:00",
      "16:00",
      "17:00",
      "18:00",
      "19:00",
      "20:00",
      "21:00",
      "22:00",
      "23:00",
    ],
    values: [
      0.0, 0.15, 0.04, 0.09, 0.09, 0.14, 0.26, 0.17, 0.19, 0.14, 0.19, 0.04, 0.27, 0.3,
      0.42, 0.86, 0.3, 0.1, 0.14, 0.17, 0.26, 0.14, 0.14, 0.04,
    ],
  },
  "7d": {
    labels: ["04-02", "04-03", "04-04", "04-05", "04-06", "04-07", "04-08"],
    values: [0.21, 0.24, 0.18, 0.35, 0.31, 0.62, 0.28],
  },
};

export const summaryCards = [
  { label: "최근 24시간 평균 이상 점수", value: "0.28" },
  { label: "이상 세션 수", value: "8" },
  { label: "이상 세션 비율", value: "11.9%" },
  { label: "위험 IP 수", value: "8" },
  { label: "모델 상태", value: "운영 중" },
];

export const anomalySessions = [
  {
    startedAt: "2026-02-28T15:11:43",
    endedAt: "2026-02-28T15:13:28",
    sessionId: "S-20260228-0048",
    ip: "192.168.1.10",
    score: 0.85,
    pattern: "인증 시도 집중 의심",
    totalRequests: 37,
    primaryPaths: [
      { path: "/login", count: 31 },
      { path: "/account", count: 3 },
      { path: "/(기타)", count: 3 },
    ],
    analysisMetrics: {
      requestRate: "37 / 105초 (≈ 0.35 req/sec)",
      failureRate: "84% (31 / 37)",
      averageInterval: "2.8초",
      repeatedEndpointRatio: "83% (/login 집중)",
      uniqueEndpointCount: "3",
    },
    behaviorSummary: "로그인 endpoint 반복 접근",
    evidence: [
      "로그인 endpoint 반복 접근 (31회)",
      "평균 요청 간격 2.8초",
      "4xx 실패율 84%",
      "이상 점수 0.90 (임계치 초과)",
    ],
    requestLogs: [
      { occurredAt: "2026-02-28T15:11:58", method: "POST", uri: "/login", status: 401, feature: "실패" },
      { occurredAt: "2026-02-28T15:12:01", method: "POST", uri: "/login", status: 401, feature: "반복" },
      { occurredAt: "2026-02-28T15:12:04", method: "POST", uri: "/login", status: 401, feature: "반복" },
      { occurredAt: "2026-02-28T15:12:07", method: "POST", uri: "/login", status: 401, feature: "반복" },
      { occurredAt: "2026-02-28T15:12:10", method: "POST", uri: "/login", status: 401, feature: "반복" },
    ],
    rawLogs: [
      '192.****** - - [28/Feb/2026:15:11:58 +0900] "POST /login HTTP/1.1" 401 8920 "https://shop.local/" "Mozilla/5.0 (Windows NT 10.0; Win64; x64)"',
      '192.****** - - [28/Feb/2026:15:12:01 +0900] "POST /login HTTP/1.1" 401 8920 "https://shop.local/" "Mozilla/5.0 (Windows NT 10.0; Win64; x64)"',
      '192.****** - - [28/Feb/2026:15:12:04 +0900] "POST /login HTTP/1.1" 401 8920 "https://shop.local/" "Mozilla/5.0 (Windows NT 10.0; Win64; x64)"',
      '192.****** - - [28/Feb/2026:15:12:29 +0900] "GET /account HTTP/1.1" 200 6210 "https://shop.local/account" "Mozilla/5.0 (Windows NT 10.0; Win64; x64)"',
      '192.****** - - [28/Feb/2026:15:13:10 +0900] "GET /order/history HTTP/1.1" 200 6210 "https://shop.local/account" "Mozilla/5.0 (Windows NT 10.0; Win64; x64)"',
    ],
  },
  {
    startedAt: "2026-02-28T14:40:08",
    endedAt: "2026-02-28T14:47:22",
    sessionId: "S-20260319-0047",
    ip: "121.173.20.91",
    score: 0.72,
    pattern: "Endpoint Scanning 의심",
    totalRequests: 22,
    primaryPaths: [
      { path: "/api/admin", count: 9 },
      { path: "/config", count: 7 },
      { path: "/health", count: 6 },
    ],
    analysisMetrics: {
      requestRate: "22 / 434초 (≈ 0.05 req/sec)",
      failureRate: "59% (13 / 22)",
      averageInterval: "19.7초",
      repeatedEndpointRatio: "41% (/api/admin 집중)",
      uniqueEndpointCount: "11",
    },
    behaviorSummary: "관리자 관련 endpoint 폭넓은 탐색",
    evidence: ["관리자 경로 순차 접근", "짧은 시간 내 다수 URI 시도", "4xx 응답 비중 높음"],
    requestLogs: [
      { occurredAt: "2026-02-28T14:40:08", method: "GET", uri: "/api/admin", status: 403, feature: "실패" },
      { occurredAt: "2026-02-28T14:41:14", method: "GET", uri: "/config", status: 404, feature: "탐색" },
    ],
    rawLogs: [
      '121.173.20.91 - - [28/Feb/2026:14:40:08 +0900] "GET /api/admin HTTP/1.1" 403 421 "-" "curl/8.0"',
      '121.173.20.91 - - [28/Feb/2026:14:41:14 +0900] "GET /config HTTP/1.1" 404 210 "-" "curl/8.0"',
    ],
  },
  {
    startedAt: "2026-02-28T14:10:51",
    endedAt: "2026-02-28T14:18:01",
    sessionId: "S-20260319-0046",
    ip: "121.173.20.91",
    score: 0.56,
    pattern: "Endpoint Scanning 의심",
    totalRequests: 15,
    primaryPaths: [
      { path: "/api", count: 6 },
      { path: "/api/orders", count: 4 },
      { path: "/api/products", count: 5 },
    ],
    analysisMetrics: {
      requestRate: "15 / 430초 (≈ 0.03 req/sec)",
      failureRate: "46% (7 / 15)",
      averageInterval: "28.6초",
      repeatedEndpointRatio: "40% (/api 집중)",
      uniqueEndpointCount: "6",
    },
    behaviorSummary: "상품/주문 API 반복 탐색",
    evidence: ["비인가 API 접근", "짧은 시간 내 연속 탐색"],
    requestLogs: [
      { occurredAt: "2026-02-28T14:10:51", method: "GET", uri: "/api", status: 404, feature: "탐색" },
    ],
    rawLogs: ['121.173.20.91 - - [28/Feb/2026:14:10:51 +0900] "GET /api HTTP/1.1" 404 210 "-" "curl/8.0"'],
  },
  {
    startedAt: "2026-02-28T13:42:39",
    endedAt: "2026-02-28T13:49:04",
    sessionId: "S-20260319-0045",
    ip: "118.221.52.44",
    score: 0.47,
    pattern: "Endpoint Scanning 의심",
    totalRequests: 12,
    primaryPaths: [
      { path: "/.env", count: 4 },
      { path: "/robots.txt", count: 3 },
      { path: "/favicon.ico", count: 5 },
    ],
    analysisMetrics: {
      requestRate: "12 / 385초 (≈ 0.03 req/sec)",
      failureRate: "42% (5 / 12)",
      averageInterval: "32.1초",
      repeatedEndpointRatio: "33% (/.env 집중)",
      uniqueEndpointCount: "5",
    },
    behaviorSummary: "민감 파일/기본 리소스 탐색",
    evidence: ["민감 파일 직접 요청", "탐색형 반복 패턴"],
    requestLogs: [
      { occurredAt: "2026-02-28T13:42:39", method: "GET", uri: "/.env", status: 404, feature: "탐색" },
    ],
    rawLogs: ['118.221.52.44 - - [28/Feb/2026:13:42:39 +0900] "GET /.env HTTP/1.1" 404 188 "-" "curl/8.0"'],
  },
  {
    startedAt: "2026-02-23T10:08:14",
    endedAt: "2026-02-23T10:14:55",
    sessionId: "S-20260223-0017",
    ip: "203.251.18.90",
    score: 0.81,
    pattern: "입력 공격 의심",
    totalRequests: 28,
    primaryPaths: [
      { path: "/search", count: 15 },
      { path: "/login", count: 8 },
      { path: "/contact", count: 5 },
    ],
    analysisMetrics: {
      requestRate: "28 / 401초 (≈ 0.07 req/sec)",
      failureRate: "61% (17 / 28)",
      averageInterval: "14.3초",
      repeatedEndpointRatio: "54% (/search 집중)",
      uniqueEndpointCount: "4",
    },
    behaviorSummary: "입력 파라미터 기반 공격 시도",
    evidence: ["동일 쿼리 반복", "비정상 문자열 패턴"],
    requestLogs: [
      { occurredAt: "2026-02-23T10:08:14", method: "GET", uri: "/search?q='or+1=1", status: 400, feature: "입력 공격" },
    ],
    rawLogs: ['203.251.18.90 - - [23/Feb/2026:10:08:14 +0900] "GET /search?q=%27or+1%3D1 HTTP/1.1" 400 311 "-" "Mozilla/5.0"'],
  },
  {
    startedAt: "2026-02-24T18:24:30",
    endedAt: "2026-02-24T18:33:12",
    sessionId: "S-20260224-0033",
    ip: "175.198.122.8",
    score: 0.78,
    pattern: "Resource Abuse 의심",
    totalRequests: 64,
    primaryPaths: [
      { path: "/products", count: 33 },
      { path: "/products/1", count: 16 },
      { path: "/assets", count: 15 },
    ],
    analysisMetrics: {
      requestRate: "64 / 522초 (≈ 0.12 req/sec)",
      failureRate: "14% (9 / 64)",
      averageInterval: "8.1초",
      repeatedEndpointRatio: "52% (/products 집중)",
      uniqueEndpointCount: "9",
    },
    behaviorSummary: "리소스 과다 요청",
    evidence: ["짧은 간격 대량 조회", "유사 페이지 반복 접근"],
    requestLogs: [
      { occurredAt: "2026-02-24T18:24:30", method: "GET", uri: "/products", status: 200, feature: "집중" },
    ],
    rawLogs: ['175.198.122.8 - - [24/Feb/2026:18:24:30 +0900] "GET /products HTTP/1.1" 200 4521 "-" "Mozilla/5.0"'],
  },
  {
    startedAt: "2026-02-20T08:15:42",
    endedAt: "2026-02-20T08:28:40",
    sessionId: "S-20260220-0009",
    ip: "14.37.201.41",
    score: 0.75,
    pattern: "Endpoint Scanning 의심",
    totalRequests: 19,
    primaryPaths: [
      { path: "/admin", count: 8 },
      { path: "/admin/products", count: 6 },
      { path: "/api/admin", count: 5 },
    ],
    analysisMetrics: {
      requestRate: "19 / 778초 (≈ 0.02 req/sec)",
      failureRate: "68% (13 / 19)",
      averageInterval: "40.9초",
      repeatedEndpointRatio: "42% (/admin 집중)",
      uniqueEndpointCount: "7",
    },
    behaviorSummary: "관리자 라우트 반복 스캔",
    evidence: ["관리자 path 반복", "권한 없는 접근 빈도 높음"],
    requestLogs: [
      { occurredAt: "2026-02-20T08:15:42", method: "GET", uri: "/admin", status: 302, feature: "탐색" },
    ],
    rawLogs: ['14.37.201.41 - - [20/Feb/2026:08:15:42 +0900] "GET /admin HTTP/1.1" 302 178 "-" "curl/8.0"'],
  },
  {
    startedAt: "2026-02-21T21:17:05",
    endedAt: "2026-02-21T21:24:18",
    sessionId: "S-20260221-0028",
    ip: "59.10.111.203",
    score: 0.73,
    pattern: "민감 경로 탐색 의심",
    totalRequests: 17,
    primaryPaths: [
      { path: "/backup", count: 7 },
      { path: "/config", count: 5 },
      { path: "/db", count: 5 },
    ],
    analysisMetrics: {
      requestRate: "17 / 433초 (≈ 0.04 req/sec)",
      failureRate: "71% (12 / 17)",
      averageInterval: "25.4초",
      repeatedEndpointRatio: "41% (/backup 집중)",
      uniqueEndpointCount: "5",
    },
    behaviorSummary: "민감 경로 중심 탐색",
    evidence: ["백업/설정 경로 접근", "비정상 탐색 pattern"],
    requestLogs: [
      { occurredAt: "2026-02-21T21:17:05", method: "GET", uri: "/backup", status: 404, feature: "탐색" },
    ],
    rawLogs: ['59.10.111.203 - - [21/Feb/2026:21:17:05 +0900] "GET /backup HTTP/1.1" 404 188 "-" "curl/8.0"'],
  },
];

export function getSessionById(sessionId) {
  return anomalySessions.find((session) => session.sessionId === sessionId) || null;
}

export function formatDateTime(value) {
  const date = new Date(value);
  const mm = String(date.getMonth() + 1).padStart(2, "0");
  const dd = String(date.getDate()).padStart(2, "0");
  const hh = String(date.getHours()).padStart(2, "0");
  const mi = String(date.getMinutes()).padStart(2, "0");
  const ss = String(date.getSeconds()).padStart(2, "0");
  return `${mm}-${dd} ${hh}:${mi}:${ss}`;
}

export function formatDateTimeMultiline(value) {
  const date = new Date(value);
  const mm = String(date.getMonth() + 1).padStart(2, "0");
  const dd = String(date.getDate()).padStart(2, "0");
  const hh = String(date.getHours()).padStart(2, "0");
  const mi = String(date.getMinutes()).padStart(2, "0");
  const ss = String(date.getSeconds()).padStart(2, "0");
  return `${mm}-${dd}\n${hh}:${mi}:${ss}`;
}

export function toDateTimeLocalValue(value) {
  const date = new Date(value);
  const yyyy = date.getFullYear();
  const mm = String(date.getMonth() + 1).padStart(2, "0");
  const dd = String(date.getDate()).padStart(2, "0");
  const hh = String(date.getHours()).padStart(2, "0");
  const mi = String(date.getMinutes()).padStart(2, "0");
  return `${yyyy}-${mm}-${dd}T${hh}:${mi}`;
}

export function formatTimeOnly(value) {
  const date = new Date(value);
  const hh = String(date.getHours()).padStart(2, "0");
  const mi = String(date.getMinutes()).padStart(2, "0");
  const ss = String(date.getSeconds()).padStart(2, "0");
  return `${hh}:${mi}:${ss}`;
}

export function formatDuration(startedAt, endedAt) {
  const diffSeconds = Math.max(0, Math.floor((new Date(endedAt) - new Date(startedAt)) / 1000));
  const minutes = Math.floor(diffSeconds / 60);
  const seconds = diffSeconds % 60;
  return `약 ${minutes}분 ${seconds}초`;
}
