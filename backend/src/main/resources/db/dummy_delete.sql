BEGIN;

DELETE FROM detection_settings
WHERE setting_id = 900001;

DELETE FROM sessions
WHERE id BETWEEN 900001 AND 900008;

SELECT setval(pg_get_serial_sequence('sessions', 'id'), COALESCE((SELECT MAX(id) FROM sessions), 1), true);
SELECT setval(pg_get_serial_sequence('session_request_logs', 'request_log_id'), COALESCE((SELECT MAX(request_log_id) FROM session_request_logs), 1), true);
SELECT setval(pg_get_serial_sequence('detection_settings', 'setting_id'), COALESCE((SELECT MAX(setting_id) FROM detection_settings), 1), true);
SELECT setval(pg_get_serial_sequence('session_feature_contributions', 'contribution_id'), COALESCE((SELECT MAX(contribution_id) FROM session_feature_contributions), 1), true);

COMMIT;