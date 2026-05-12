ALTER TABLE detection_settings
    ADD COLUMN IF NOT EXISTS danger_score_gap NUMERIC(8,6) NOT NULL DEFAULT 0.300000
        CHECK (danger_score_gap >= 0);
