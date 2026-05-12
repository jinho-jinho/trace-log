BEGIN;

-- Re-runnable seed: remove the same dummy rows first.
DELETE FROM detection_settings
WHERE setting_id = 900001;

DELETE FROM sessions
WHERE id BETWEEN 900001 AND 900012;

INSERT INTO detection_settings (setting_id, threshold_value, min_request_count, danger_score_gap, applied_at)
VALUES (900001, 0.400000, 5, 0.300000, TIMESTAMP '2026-04-26 08:30:00');

INSERT INTO sessions (
    id,
    ip,
    user_agent,
    session_start,
    session_end,
    duration_sec,
    request_count,
    anomaly_score,
    analyzed_at,
    created_at
)
VALUES
    (900001, '121.173.20.91', 'curl/8.7.1 anomaly-checker', TIMESTAMP '2026-04-26 08:10:00', TIMESTAMP '2026-04-26 08:17:00', 420.000, 36, 0.930000, TIMESTAMP '2026-04-26 08:20:00', TIMESTAMP '2026-04-26 08:17:00'),
    (900002, '14.37.201.41', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 Chrome/135.0.0.0 Safari/537.36', TIMESTAMP '2026-04-26 06:02:00', TIMESTAMP '2026-04-26 06:10:00', 480.000, 12, 0.780000, TIMESTAMP '2026-04-26 06:12:00', TIMESTAMP '2026-04-26 06:10:00'),
    (900003, '59.10.111.203', 'python-requests/2.32.0', TIMESTAMP '2026-04-26 01:20:00', TIMESTAMP '2026-04-26 01:32:00', 720.000, 11, 0.660000, TIMESTAMP '2026-04-26 01:35:00', TIMESTAMP '2026-04-26 01:32:00'),
    (900004, '203.251.18.90', 'Mozilla/5.0 (Macintosh; Intel Mac OS X 14_4_0) AppleWebKit/605.1.15 Version/17.4 Safari/605.1.15', TIMESTAMP '2026-04-25 18:45:00', TIMESTAMP '2026-04-25 19:05:00', 1200.000, 9, 0.580000, TIMESTAMP '2026-04-25 19:07:00', TIMESTAMP '2026-04-25 19:05:00'),
    (900005, '118.221.52.44', 'Mozilla/5.0 (X11; Linux x86_64) Gecko/20100101 Firefox/137.0', TIMESTAMP '2026-04-25 11:10:00', TIMESTAMP '2026-04-25 11:19:00', 540.000, 8, 0.470000, TIMESTAMP '2026-04-25 11:22:00', TIMESTAMP '2026-04-25 11:19:00'),
    (900006, '175.198.122.8', 'Mozilla/5.0 (iPhone; CPU iPhone OS 18_4 like Mac OS X) AppleWebKit/605.1.15 Version/18.4 Mobile/15E148 Safari/604.1', TIMESTAMP '2026-04-25 09:00:00', TIMESTAMP '2026-04-25 09:12:00', 720.000, 7, 0.220000, TIMESTAMP '2026-04-25 09:14:00', TIMESTAMP '2026-04-25 09:12:00'),
    (900007, '220.89.44.61', 'curl/8.7.1 scanner-bot', TIMESTAMP '2026-04-23 15:30:00', TIMESTAMP '2026-04-23 15:43:00', 780.000, 10, 0.710000, TIMESTAMP '2026-04-23 15:46:00', TIMESTAMP '2026-04-23 15:43:00'),
    (900008, '192.168.0.24', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 Chrome/135.0.0.0 Safari/537.36', TIMESTAMP '2026-04-21 13:05:00', TIMESTAMP '2026-04-21 13:14:00', 540.000, 6, NULL, NULL, TIMESTAMP '2026-04-21 13:14:00'),
    (900009, '106.255.91.14', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 Chrome/136.0.0.0 Safari/537.36', TIMESTAMP '2026-05-03 09:05:00', TIMESTAMP '2026-05-03 09:18:00', 780.000, 14, 0.840000, TIMESTAMP '2026-05-03 09:21:00', TIMESTAMP '2026-05-03 09:18:00'),
    (900010, '61.42.188.73', 'python-requests/2.32.3', TIMESTAMP '2026-05-02 16:40:00', TIMESTAMP '2026-05-02 16:52:00', 720.000, 9, 0.690000, TIMESTAMP '2026-05-02 16:55:00', TIMESTAMP '2026-05-02 16:52:00'),
    (900011, '211.234.112.5', 'Mozilla/5.0 (Macintosh; Intel Mac OS X 14_5) AppleWebKit/605.1.15 Version/17.5 Safari/605.1.15', TIMESTAMP '2026-05-01 14:12:00', TIMESTAMP '2026-05-01 14:29:00', 1020.000, 11, 0.510000, TIMESTAMP '2026-05-01 14:31:00', TIMESTAMP '2026-05-01 14:29:00'),
    (900012, '172.30.1.44', 'Mozilla/5.0 (Linux; Android 15; SM-S938N) AppleWebKit/537.36 Chrome/136.0.0.0 Mobile Safari/537.36', TIMESTAMP '2026-05-01 08:20:00', TIMESTAMP '2026-05-01 08:28:00', 480.000, 5, NULL, NULL, TIMESTAMP '2026-05-01 08:28:00');

INSERT INTO session_request_logs (
    session_id,
    sequence_no,
    request_time,
    method,
    uri,
    status_code,
    response_bytes,
    referer,
    source,
    label,
    endpoint,
    query_string,
    uri_length,
    query_length,
    special_char_count,
    special_char_ratio,
    suspicious_keyword_count,
    is_login_endpoint,
    is_admin_endpoint,
    is_login_attempt,
    raw_log,
    created_at
)
SELECT
    900001,
    gs,
    TIMESTAMP '2026-04-26 08:10:00' + ((gs - 1) * INTERVAL '11 seconds'),
    CASE
        WHEN gs <= 30 THEN 'POST'
        WHEN gs <= 33 THEN 'GET'
        ELSE 'POST'
        END,
    CASE
        WHEN gs <= 30 THEN '/login'
        WHEN gs <= 33 THEN '/admin'
        ELSE '/search'
        END,
    CASE
        WHEN gs <= 30 THEN 401
        WHEN gs <= 33 THEN 403
        ELSE 400
        END,
    CASE
        WHEN gs <= 30 THEN 8920
        WHEN gs <= 33 THEN 421
        ELSE 311
        END,
    CASE
        WHEN gs <= 30 THEN 'https://shop.local/login'
        ELSE '-'
        END,
    'dummy-seed',
    CASE
        WHEN gs <= 30 THEN 'login-burst'
        WHEN gs <= 33 THEN 'admin-probe'
        ELSE 'query-probe'
        END,
    CASE
        WHEN gs <= 30 THEN '/login'
        WHEN gs <= 33 THEN '/admin'
        ELSE '/search'
        END,
    CASE
        WHEN gs <= 33 THEN NULL
        ELSE 'q=%27+or+1%3D1'
        END,
    CASE
        WHEN gs <= 33 THEN 6
        ELSE 7
        END,
    CASE
        WHEN gs <= 33 THEN 0
        ELSE 13
        END,
    CASE
        WHEN gs <= 33 THEN 0
        ELSE 3
        END,
    CASE
        WHEN gs <= 33 THEN 0.000000
        ELSE 0.230000
        END,
    CASE
        WHEN gs <= 33 THEN 0
        ELSE 1
        END,
    CASE
        WHEN gs <= 30 THEN TRUE
        ELSE FALSE
        END,
    CASE
        WHEN gs BETWEEN 31 AND 33 THEN TRUE
        ELSE FALSE
        END,
    CASE
        WHEN gs <= 30 THEN TRUE
        ELSE FALSE
        END,
    CASE
        WHEN gs <= 30 THEN format('121.173.20.91 - - [26/Apr/2026:08:%s +0900] "POST /login HTTP/1.1" 401 8920 "https://shop.local/login" "curl/8.7.1 anomaly-checker"', to_char(TIMESTAMP '2026-04-26 08:10:00' + ((gs - 1) * INTERVAL '11 seconds'), 'MI:SS'))
        WHEN gs <= 33 THEN format('121.173.20.91 - - [26/Apr/2026:08:%s +0900] "GET /admin HTTP/1.1" 403 421 "-" "curl/8.7.1 anomaly-checker"', to_char(TIMESTAMP '2026-04-26 08:10:00' + ((gs - 1) * INTERVAL '11 seconds'), 'MI:SS'))
        ELSE format('121.173.20.91 - - [26/Apr/2026:08:%s +0900] "POST /search?q=%s HTTP/1.1" 400 311 "-" "curl/8.7.1 anomaly-checker"', to_char(TIMESTAMP '2026-04-26 08:10:00' + ((gs - 1) * INTERVAL '11 seconds'), 'MI:SS'), '%27or+1%3D1')
        END,
    TIMESTAMP '2026-04-26 08:17:00'
FROM generate_series(1, 36) AS gs;

INSERT INTO session_request_logs (
    session_id,
    sequence_no,
    request_time,
    method,
    uri,
    status_code,
    response_bytes,
    referer,
    source,
    label,
    endpoint,
    query_string,
    uri_length,
    query_length,
    special_char_count,
    special_char_ratio,
    suspicious_keyword_count,
    is_login_endpoint,
    is_admin_endpoint,
    is_login_attempt,
    raw_log,
    created_at
)
VALUES
    (900002, 1, TIMESTAMP '2026-04-26 06:02:05', 'GET', '/api/admin', 403, 421, '-', 'dummy-seed', 'admin-probe', '/api/admin', NULL, 10, 0, 0, 0.000000, 0, FALSE, TRUE, FALSE, '14.37.201.41 - - [26/Apr/2026:06:02:05 +0900] "GET /api/admin HTTP/1.1" 403 421 "-" "Chrome/135.0.0.0"', TIMESTAMP '2026-04-26 06:10:00'),
    (900002, 2, TIMESTAMP '2026-04-26 06:02:41', 'GET', '/config', 404, 210, '-', 'dummy-seed', 'scan', '/config', NULL, 7, 0, 0, 0.000000, 0, FALSE, FALSE, FALSE, '14.37.201.41 - - [26/Apr/2026:06:02:41 +0900] "GET /config HTTP/1.1" 404 210 "-" "Chrome/135.0.0.0"', TIMESTAMP '2026-04-26 06:10:00'),
    (900002, 3, TIMESTAMP '2026-04-26 06:03:10', 'GET', '/health', 200, 98, '-', 'dummy-seed', 'scan', '/health', NULL, 7, 0, 0, 0.000000, 0, FALSE, FALSE, FALSE, '14.37.201.41 - - [26/Apr/2026:06:03:10 +0900] "GET /health HTTP/1.1" 200 98 "-" "Chrome/135.0.0.0"', TIMESTAMP '2026-04-26 06:10:00'),
    (900002, 4, TIMESTAMP '2026-04-26 06:03:54', 'GET', '/admin', 302, 178, '-', 'dummy-seed', 'admin-probe', '/admin', NULL, 6, 0, 0, 0.000000, 0, FALSE, TRUE, FALSE, '14.37.201.41 - - [26/Apr/2026:06:03:54 +0900] "GET /admin HTTP/1.1" 302 178 "-" "Chrome/135.0.0.0"', TIMESTAMP '2026-04-26 06:10:00'),
    (900002, 5, TIMESTAMP '2026-04-26 06:04:25', 'GET', '/api/orders', 401, 188, '-', 'dummy-seed', 'scan', '/api/orders', NULL, 11, 0, 0, 0.000000, 0, FALSE, FALSE, FALSE, '14.37.201.41 - - [26/Apr/2026:06:04:25 +0900] "GET /api/orders HTTP/1.1" 401 188 "-" "Chrome/135.0.0.0"', TIMESTAMP '2026-04-26 06:10:00'),
    (900002, 6, TIMESTAMP '2026-04-26 06:05:08', 'GET', '/api/products', 200, 1240, '-', 'dummy-seed', 'scan', '/api/products', NULL, 13, 0, 0, 0.000000, 0, FALSE, FALSE, FALSE, '14.37.201.41 - - [26/Apr/2026:06:05:08 +0900] "GET /api/products HTTP/1.1" 200 1240 "-" "Chrome/135.0.0.0"', TIMESTAMP '2026-04-26 06:10:00'),
    (900003, 1, TIMESTAMP '2026-04-26 01:20:08', 'GET', '/backup', 404, 188, '-', 'dummy-seed', 'scan', '/backup', NULL, 7, 0, 0, 0.000000, 0, FALSE, FALSE, FALSE, '59.10.111.203 - - [26/Apr/2026:01:20:08 +0900] "GET /backup HTTP/1.1" 404 188 "-" "python-requests/2.32.0"', TIMESTAMP '2026-04-26 01:32:00'),
    (900003, 2, TIMESTAMP '2026-04-26 01:21:51', 'GET', '/config', 404, 210, '-', 'dummy-seed', 'scan', '/config', NULL, 7, 0, 0, 0.000000, 0, FALSE, FALSE, FALSE, '59.10.111.203 - - [26/Apr/2026:01:21:51 +0900] "GET /config HTTP/1.1" 404 210 "-" "python-requests/2.32.0"', TIMESTAMP '2026-04-26 01:32:00'),
    (900003, 3, TIMESTAMP '2026-04-26 01:23:12', 'GET', '/db', 404, 202, '-', 'dummy-seed', 'scan', '/db', NULL, 3, 0, 0, 0.000000, 0, FALSE, FALSE, FALSE, '59.10.111.203 - - [26/Apr/2026:01:23:12 +0900] "GET /db HTTP/1.1" 404 202 "-" "python-requests/2.32.0"', TIMESTAMP '2026-04-26 01:32:00'),
    (900003, 4, TIMESTAMP '2026-04-26 01:24:52', 'GET', '/.env', 404, 188, '-', 'dummy-seed', 'scan', '/.env', NULL, 5, 0, 0, 0.000000, 0, FALSE, FALSE, FALSE, '59.10.111.203 - - [26/Apr/2026:01:24:52 +0900] "GET /.env HTTP/1.1" 404 188 "-" "python-requests/2.32.0"', TIMESTAMP '2026-04-26 01:32:00'),
    (900004, 1, TIMESTAMP '2026-04-25 18:45:21', 'GET', '/products', 200, 4521, '-', 'dummy-seed', 'burst', '/products', NULL, 9, 0, 0, 0.000000, 0, FALSE, FALSE, FALSE, '203.251.18.90 - - [25/Apr/2026:18:45:21 +0900] "GET /products HTTP/1.1" 200 4521 "-" "Safari/605.1.15"', TIMESTAMP '2026-04-25 19:05:00'),
    (900004, 2, TIMESTAMP '2026-04-25 18:47:10', 'GET', '/products/1', 200, 6210, '/products', 'dummy-seed', 'burst', '/products/1', NULL, 11, 0, 0, 0.000000, 0, FALSE, FALSE, FALSE, '203.251.18.90 - - [25/Apr/2026:18:47:10 +0900] "GET /products/1 HTTP/1.1" 200 6210 "/products" "Safari/605.1.15"', TIMESTAMP '2026-04-25 19:05:00'),
    (900004, 3, TIMESTAMP '2026-04-25 18:48:56', 'GET', '/products/2', 200, 6310, '/products', 'dummy-seed', 'burst', '/products/2', NULL, 11, 0, 0, 0.000000, 0, FALSE, FALSE, FALSE, '203.251.18.90 - - [25/Apr/2026:18:48:56 +0900] "GET /products/2 HTTP/1.1" 200 6310 "/products" "Safari/605.1.15"', TIMESTAMP '2026-04-25 19:05:00'),
    (900005, 1, TIMESTAMP '2026-04-25 11:10:15', 'GET', '/.env', 404, 188, '-', 'dummy-seed', 'scan', '/.env', NULL, 5, 0, 0, 0.000000, 0, FALSE, FALSE, FALSE, '118.221.52.44 - - [25/Apr/2026:11:10:15 +0900] "GET /.env HTTP/1.1" 404 188 "-" "Firefox/137.0"', TIMESTAMP '2026-04-25 11:19:00'),
    (900005, 2, TIMESTAMP '2026-04-25 11:12:45', 'GET', '/robots.txt', 200, 92, '-', 'dummy-seed', 'scan', '/robots.txt', NULL, 11, 0, 0, 0.000000, 0, FALSE, FALSE, FALSE, '118.221.52.44 - - [25/Apr/2026:11:12:45 +0900] "GET /robots.txt HTTP/1.1" 200 92 "-" "Firefox/137.0"', TIMESTAMP '2026-04-25 11:19:00'),
    (900006, 1, TIMESTAMP '2026-04-25 09:00:30', 'GET', '/products', 200, 4310, '/', 'dummy-seed', 'browse', '/products', NULL, 9, 0, 0, 0.000000, 0, FALSE, FALSE, FALSE, '175.198.122.8 - - [25/Apr/2026:09:00:30 +0900] "GET /products HTTP/1.1" 200 4310 "/" "Mobile Safari/604.1"', TIMESTAMP '2026-04-25 09:12:00'),
    (900006, 2, TIMESTAMP '2026-04-25 09:03:10', 'GET', '/products/8', 200, 5980, '/products', 'dummy-seed', 'browse', '/products/8', NULL, 11, 0, 0, 0.000000, 0, FALSE, FALSE, FALSE, '175.198.122.8 - - [25/Apr/2026:09:03:10 +0900] "GET /products/8 HTTP/1.1" 200 5980 "/products" "Mobile Safari/604.1"', TIMESTAMP '2026-04-25 09:12:00'),
    (900007, 1, TIMESTAMP '2026-04-23 15:30:20', 'GET', '/api/admin', 403, 421, '-', 'dummy-seed', 'admin-probe', '/api/admin', NULL, 10, 0, 0, 0.000000, 0, FALSE, TRUE, FALSE, '220.89.44.61 - - [23/Apr/2026:15:30:20 +0900] "GET /api/admin HTTP/1.1" 403 421 "-" "curl/8.7.1 scanner-bot"', TIMESTAMP '2026-04-23 15:43:00'),
    (900007, 2, TIMESTAMP '2026-04-23 15:31:54', 'GET', '/admin', 302, 178, '-', 'dummy-seed', 'admin-probe', '/admin', NULL, 6, 0, 0, 0.000000, 0, FALSE, TRUE, FALSE, '220.89.44.61 - - [23/Apr/2026:15:31:54 +0900] "GET /admin HTTP/1.1" 302 178 "-" "curl/8.7.1 scanner-bot"', TIMESTAMP '2026-04-23 15:43:00'),
    (900008, 1, TIMESTAMP '2026-04-21 13:05:41', 'GET', '/products', 200, 4401, '/', 'dummy-seed', 'browse', '/products', NULL, 9, 0, 0, 0.000000, 0, FALSE, FALSE, FALSE, '192.168.0.24 - - [21/Apr/2026:13:05:41 +0900] "GET /products HTTP/1.1" 200 4401 "/" "Chrome/135.0.0.0"', TIMESTAMP '2026-04-21 13:14:00'),
    (900009, 1, TIMESTAMP '2026-05-03 09:05:22', 'POST', '/login', 401, 8920, 'https://shop.local/login', 'dummy-seed', 'login-burst', '/login', NULL, 6, 0, 0, 0.000000, 0, TRUE, FALSE, TRUE, '106.255.91.14 - - [03/May/2026:09:05:22 +0900] "POST /login HTTP/1.1" 401 8920 "https://shop.local/login" "Chrome/136.0.0.0"', TIMESTAMP '2026-05-03 09:18:00'),
    (900009, 2, TIMESTAMP '2026-05-03 09:05:49', 'POST', '/login', 401, 8920, 'https://shop.local/login', 'dummy-seed', 'login-burst', '/login', NULL, 6, 0, 0, 0.000000, 0, TRUE, FALSE, TRUE, '106.255.91.14 - - [03/May/2026:09:05:49 +0900] "POST /login HTTP/1.1" 401 8920 "https://shop.local/login" "Chrome/136.0.0.0"', TIMESTAMP '2026-05-03 09:18:00'),
    (900009, 3, TIMESTAMP '2026-05-03 09:06:18', 'POST', '/login', 401, 8920, 'https://shop.local/login', 'dummy-seed', 'login-burst', '/login', NULL, 6, 0, 0, 0.000000, 0, TRUE, FALSE, TRUE, '106.255.91.14 - - [03/May/2026:09:06:18 +0900] "POST /login HTTP/1.1" 401 8920 "https://shop.local/login" "Chrome/136.0.0.0"', TIMESTAMP '2026-05-03 09:18:00'),
    (900009, 4, TIMESTAMP '2026-05-03 09:08:11', 'GET', '/admin', 403, 421, '-', 'dummy-seed', 'admin-probe', '/admin', NULL, 6, 0, 0, 0.000000, 0, FALSE, TRUE, FALSE, '106.255.91.14 - - [03/May/2026:09:08:11 +0900] "GET /admin HTTP/1.1" 403 421 "-" "Chrome/136.0.0.0"', TIMESTAMP '2026-05-03 09:18:00'),
    (900010, 1, TIMESTAMP '2026-05-02 16:40:08', 'GET', '/backup', 404, 188, '-', 'dummy-seed', 'scan', '/backup', NULL, 7, 0, 0, 0.000000, 0, FALSE, FALSE, FALSE, '61.42.188.73 - - [02/May/2026:16:40:08 +0900] "GET /backup HTTP/1.1" 404 188 "-" "python-requests/2.32.3"', TIMESTAMP '2026-05-02 16:52:00'),
    (900010, 2, TIMESTAMP '2026-05-02 16:42:51', 'GET', '/config', 404, 210, '-', 'dummy-seed', 'scan', '/config', NULL, 7, 0, 0, 0.000000, 0, FALSE, FALSE, FALSE, '61.42.188.73 - - [02/May/2026:16:42:51 +0900] "GET /config HTTP/1.1" 404 210 "-" "python-requests/2.32.3"', TIMESTAMP '2026-05-02 16:52:00'),
    (900010, 3, TIMESTAMP '2026-05-02 16:47:32', 'GET', '/db', 404, 202, '-', 'dummy-seed', 'scan', '/db', NULL, 3, 0, 0, 0.000000, 0, FALSE, FALSE, FALSE, '61.42.188.73 - - [02/May/2026:16:47:32 +0900] "GET /db HTTP/1.1" 404 202 "-" "python-requests/2.32.3"', TIMESTAMP '2026-05-02 16:52:00'),
    (900011, 1, TIMESTAMP '2026-05-01 14:12:33', 'GET', '/products', 200, 4521, '/', 'dummy-seed', 'burst', '/products', NULL, 9, 0, 0, 0.000000, 0, FALSE, FALSE, FALSE, '211.234.112.5 - - [01/May/2026:14:12:33 +0900] "GET /products HTTP/1.1" 200 4521 "/" "Safari/605.1.15"', TIMESTAMP '2026-05-01 14:29:00'),
    (900011, 2, TIMESTAMP '2026-05-01 14:15:20', 'GET', '/products/3', 200, 6110, '/products', 'dummy-seed', 'burst', '/products/3', NULL, 11, 0, 0, 0.000000, 0, FALSE, FALSE, FALSE, '211.234.112.5 - - [01/May/2026:14:15:20 +0900] "GET /products/3 HTTP/1.1" 200 6110 "/products" "Safari/605.1.15"', TIMESTAMP '2026-05-01 14:29:00'),
    (900011, 3, TIMESTAMP '2026-05-01 14:18:52', 'GET', '/products/5', 200, 6218, '/products', 'dummy-seed', 'burst', '/products/5', NULL, 11, 0, 0, 0.000000, 0, FALSE, FALSE, FALSE, '211.234.112.5 - - [01/May/2026:14:18:52 +0900] "GET /products/5 HTTP/1.1" 200 6218 "/products" "Safari/605.1.15"', TIMESTAMP '2026-05-01 14:29:00'),
    (900012, 1, TIMESTAMP '2026-05-01 08:20:41', 'GET', '/products', 200, 4401, '/', 'dummy-seed', 'browse', '/products', NULL, 9, 0, 0, 0.000000, 0, FALSE, FALSE, FALSE, '172.30.1.44 - - [01/May/2026:08:20:41 +0900] "GET /products HTTP/1.1" 200 4401 "/" "Mobile Chrome/136.0.0.0"', TIMESTAMP '2026-05-01 08:28:00');

INSERT INTO session_features (
    session_id,
    unique_url_count,
    unique_method_count,
    avg_request_interval_sec,
    max_request_interval_sec,
    min_request_interval_sec,
    error_4xx_ratio,
    error_5xx_ratio,
    status_200_count,
    avg_bytes,
    max_bytes,
    std_bytes,
    url_sequence,
    status_sequence,
    method_sequence,
    login_count,
    admin_count,
    avg_uri_length,
    max_uri_length,
    avg_query_length,
    max_query_length,
    special_char_count_sum,
    special_char_ratio_avg,
    suspicious_keyword_count_sum,
    login_attempt_count,
    feature_calculated_at
)
VALUES
    (900001, 3, 2, 11.667, 11.000, 11.000, 0.916667, 0.000000, 0, 7307.611, 8920, 3154.8144, '/login>/admin>/search', '401>403>400', 'POST>GET>POST', 30, 3, 6.1111, 7, 1.4444, 13, 9, 0.025556, 3, 30, TIMESTAMP '2026-04-26 08:20:00'),
    (900002, 6, 1, 36.600, 44.000, 29.000, 0.666667, 0.000000, 2, 389.166, 1240, 433.2275, '/api/admin>/config>/health>/admin>/api/orders>/api/products', '403>404>200>302>401>200', 'GET', 0, 2, 9.0000, 13, 0.0000, 0, 0, 0.000000, 0, 0, TIMESTAMP '2026-04-26 06:12:00'),
    (900003, 4, 1, 94.667, 103.000, 81.000, 1.000000, 0.000000, 0, 197.000, 210, 9.7980, '/backup>/config>/db>/.env', '404', 'GET', 0, 0, 5.5000, 7, 0.0000, 0, 0, 0.000000, 0, 0, TIMESTAMP '2026-04-26 01:35:00'),
    (900004, 3, 1, 107.500, 109.000, 106.000, 0.000000, 0.000000, 3, 5680.333, 6310, 912.5812, '/products>/products/1>/products/2', '200', 'GET', 0, 0, 10.3333, 11, 0.0000, 0, 0, 0.000000, 0, 0, TIMESTAMP '2026-04-25 19:07:00'),
    (900005, 2, 1, 150.000, 150.000, 150.000, 0.500000, 0.000000, 1, 140.000, 188, 67.8823, '/.env>/robots.txt', '404>200', 'GET', 0, 0, 8.0000, 11, 0.0000, 0, 0, 0.000000, 0, 0, TIMESTAMP '2026-04-25 11:22:00'),
    (900006, 2, 1, 160.000, 160.000, 160.000, 0.000000, 0.000000, 2, 5145.000, 5980, 1180.8683, '/products>/products/8', '200', 'GET', 0, 0, 10.0000, 11, 0.0000, 0, 0, 0.000000, 0, 0, TIMESTAMP '2026-04-25 09:14:00'),
    (900007, 2, 1, 94.000, 94.000, 94.000, 0.500000, 0.000000, 0, 299.500, 421, 171.8267, '/api/admin>/admin', '403>302', 'GET', 0, 2, 8.0000, 10, 0.0000, 0, 0, 0.000000, 0, 0, TIMESTAMP '2026-04-23 15:46:00'),
    (900008, 1, 1, 0.000, 0.000, 0.000, 0.000000, 0.000000, 1, 4401.000, 4401, 0.0000, '/products', '200', 'GET', 0, 0, 9.0000, 9, 0.0000, 0, 0, 0.000000, 0, 0, TIMESTAMP '2026-04-21 13:14:00'),
    (900009, 2, 2, 54.250, 113.000, 27.000, 1.000000, 0.000000, 0, 6545.250, 8920, 3917.7812, '/login>/admin', '401>403', 'POST>GET', 3, 1, 6.0000, 6, 0.0000, 0, 0, 0.000000, 0, 3, TIMESTAMP '2026-05-03 09:21:00'),
    (900010, 3, 1, 292.000, 281.000, 163.000, 1.000000, 0.000000, 0, 200.000, 210, 11.0000, '/backup>/config>/db', '404', 'GET', 0, 0, 5.6667, 7, 0.0000, 0, 0, 0.000000, 0, 0, TIMESTAMP '2026-05-02 16:55:00'),
    (900011, 3, 1, 189.500, 212.000, 167.000, 0.000000, 0.000000, 3, 5616.333, 6218, 945.4135, '/products>/products/3>/products/5', '200', 'GET', 0, 0, 10.3333, 11, 0.0000, 0, 0, 0.000000, 0, 0, TIMESTAMP '2026-05-01 14:31:00'),
    (900012, 1, 1, 0.000, 0.000, 0.000, 0.000000, 0.000000, 1, 4401.000, 4401, 0.0000, '/products', '200', 'GET', 0, 0, 9.0000, 9, 0.0000, 0, 0, 0.000000, 0, 0, TIMESTAMP '2026-05-01 08:28:00');

INSERT INTO session_feature_contributions (
    session_id,
    feature_name,
    feature_value,
    shap_value,
    abs_shap_value,
    created_at
)
VALUES
    (900001, 'login_attempt_count', 30.00000000, 0.41200000, 0.41200000, TIMESTAMP '2026-04-26 08:20:00'),
    (900001, 'error_4xx_ratio', 0.91666700, 0.28900000, 0.28900000, TIMESTAMP '2026-04-26 08:20:00'),
    (900001, 'admin_count', 3.00000000, 0.16700000, 0.16700000, TIMESTAMP '2026-04-26 08:20:00'),
    (900002, 'admin_count', 2.00000000, 0.26400000, 0.26400000, TIMESTAMP '2026-04-26 06:12:00'),
    (900002, 'error_4xx_ratio', 0.66666700, 0.21400000, 0.21400000, TIMESTAMP '2026-04-26 06:12:00'),
    (900002, 'unique_url_count', 6.00000000, 0.10200000, 0.10200000, TIMESTAMP '2026-04-26 06:12:00'),
    (900003, 'unique_url_count', 4.00000000, 0.26100000, 0.26100000, TIMESTAMP '2026-04-26 01:35:00'),
    (900003, 'error_4xx_ratio', 1.00000000, 0.20800000, 0.20800000, TIMESTAMP '2026-04-26 01:35:00'),
    (900004, 'status_200_count', 3.00000000, 0.17100000, 0.17100000, TIMESTAMP '2026-04-25 19:07:00'),
    (900004, 'avg_bytes', 5680.33300000, 0.14300000, 0.14300000, TIMESTAMP '2026-04-25 19:07:00'),
    (900005, 'error_4xx_ratio', 0.50000000, 0.09400000, 0.09400000, TIMESTAMP '2026-04-25 11:22:00'),
    (900006, 'avg_request_interval_sec', 160.00000000, -0.08200000, 0.08200000, TIMESTAMP '2026-04-25 09:14:00'),
    (900007, 'admin_count', 2.00000000, 0.23600000, 0.23600000, TIMESTAMP '2026-04-23 15:46:00'),
    (900009, 'login_attempt_count', 3.00000000, 0.33100000, 0.33100000, TIMESTAMP '2026-05-03 09:21:00'),
    (900009, 'error_4xx_ratio', 1.00000000, 0.24800000, 0.24800000, TIMESTAMP '2026-05-03 09:21:00'),
    (900010, 'unique_url_count', 3.00000000, 0.22900000, 0.22900000, TIMESTAMP '2026-05-02 16:55:00'),
    (900011, 'avg_bytes', 5616.33300000, 0.11800000, 0.11800000, TIMESTAMP '2026-05-01 14:31:00');

SELECT setval(pg_get_serial_sequence('sessions', 'id'), COALESCE((SELECT MAX(id) FROM sessions), 1), true);
SELECT setval(pg_get_serial_sequence('session_request_logs', 'request_log_id'), COALESCE((SELECT MAX(request_log_id) FROM session_request_logs), 1), true);
SELECT setval(pg_get_serial_sequence('detection_settings', 'setting_id'), COALESCE((SELECT MAX(setting_id) FROM detection_settings), 1), true);
SELECT setval(pg_get_serial_sequence('session_feature_contributions', 'contribution_id'), COALESCE((SELECT MAX(contribution_id) FROM session_feature_contributions), 1), true);

COMMIT;
