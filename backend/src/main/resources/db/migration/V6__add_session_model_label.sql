ALTER TABLE sessions
    ADD COLUMN IF NOT EXISTS model_label VARCHAR(16)
        CHECK (model_label IN ('Normal', 'Anomalous'));
