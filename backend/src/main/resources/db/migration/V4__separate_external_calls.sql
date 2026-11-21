ALTER TABLE sessions ADD COLUMN IF NOT EXISTS analysis_revision UUID;

CREATE TABLE IF NOT EXISTS danger_email_outbox (
    notification_id BIGINT PRIMARY KEY,
    recipient VARCHAR(255) NOT NULL,
    subject VARCHAR(255) NOT NULL,
    plain_text TEXT NOT NULL,
    html TEXT NOT NULL,
    status VARCHAR(10) NOT NULL,
    attempt_count INTEGER NOT NULL,
    next_attempt_at TIMESTAMP WITH TIME ZONE NOT NULL,
    lease_until TIMESTAMP WITH TIME ZONE,
    claim_token VARCHAR(36),
    sent_at TIMESTAMP WITH TIME ZONE,
    last_error VARCHAR(120)
);

CREATE INDEX IF NOT EXISTS idx_danger_email_outbox_pending ON danger_email_outbox (status, next_attempt_at);
CREATE INDEX IF NOT EXISTS idx_danger_email_outbox_lease ON danger_email_outbox (status, lease_until);
