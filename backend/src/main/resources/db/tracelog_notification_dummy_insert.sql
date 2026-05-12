BEGIN;

WITH latest_setting AS (
    SELECT
        COALESCE(
            (
                SELECT threshold_value
                FROM detection_settings
                ORDER BY applied_at DESC
                LIMIT 1
            ),
            0.400000
        ) AS threshold_value,
        COALESCE(
            (
                SELECT danger_score_gap
                FROM detection_settings
                ORDER BY applied_at DESC
                LIMIT 1
            ),
            0.300000
        ) AS danger_score_gap
),
target_notifications AS (
    SELECT
        u.id AS user_id,
        s.id AS session_id,
        'ANOMALY_SESSION' AS notification_type,
        CASE
            WHEN s.anomaly_score - latest_setting.threshold_value >= latest_setting.danger_score_gap THEN 'danger'
            ELSE 'suspicious'
        END AS severity,
        '이상 세션 감지' AS title,
        CONCAT('세션 ', s.id, '의 이상 점수가 설정 임계치를 초과했습니다.') AS message,
        s.anomaly_score - latest_setting.threshold_value AS score_gap
    FROM users u
    CROSS JOIN latest_setting
    JOIN sessions s
        ON s.anomaly_score >= latest_setting.threshold_value
    WHERE u.role = 'admin'
)
INSERT INTO notifications (
    user_id,
    session_id,
    notification_type,
    severity,
    title,
    message,
    score_gap,
    is_read,
    created_at
)
SELECT
    user_id,
    session_id,
    notification_type,
    severity,
    title,
    message,
    score_gap,
    FALSE,
    CURRENT_TIMESTAMP
FROM target_notifications
ON CONFLICT DO NOTHING;

COMMIT;
