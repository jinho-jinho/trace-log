ALTER TABLE sessions
    ADD COLUMN IF NOT EXISTS raw_score NUMERIC(24,18),
    ADD COLUMN IF NOT EXISTS exceeded_reference_percentile NUMERIC(8,6)
        CHECK (exceeded_reference_percentile BETWEEN 0 AND 1);
