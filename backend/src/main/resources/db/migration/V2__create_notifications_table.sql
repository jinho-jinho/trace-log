-- V2__create_notifications_table.sql
-- Admin/user notifications for TraceLog events.

CREATE TABLE notifications (
                               id BIGSERIAL PRIMARY KEY,
                               user_id BIGINT REFERENCES users(id) ON DELETE CASCADE,
                               session_id BIGINT REFERENCES sessions(id) ON DELETE CASCADE,
                               notification_type VARCHAR(50) NOT NULL,
                               severity VARCHAR(20) NOT NULL DEFAULT 'suspicious'
                                   CHECK (severity IN ('suspicious', 'danger')),
                               title VARCHAR(255) NOT NULL,
                               message TEXT NOT NULL,
                               score_gap NUMERIC(8,6),
                               is_read BOOLEAN NOT NULL DEFAULT FALSE,
                               read_at TIMESTAMP,
                               created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,

                               CHECK (read_at IS NULL OR is_read = TRUE)
);

CREATE INDEX idx_notifications_user_unread_created_at
    ON notifications(user_id, is_read, created_at DESC);

CREATE INDEX idx_notifications_session_id
    ON notifications(session_id);

CREATE INDEX idx_notifications_created_at
    ON notifications(created_at DESC);

CREATE UNIQUE INDEX uq_notifications_user_session_type
    ON notifications(user_id, session_id, notification_type)
    WHERE session_id IS NOT NULL;
