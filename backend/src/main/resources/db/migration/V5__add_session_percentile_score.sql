ALTER TABLE sessions
    ADD COLUMN IF NOT EXISTS percentile_score NUMERIC(8,6)
        CHECK (percentile_score BETWEEN 0 AND 1);
