BEGIN;

DELETE FROM notifications
WHERE notification_type = 'ANOMALY_SESSION';

COMMIT;
