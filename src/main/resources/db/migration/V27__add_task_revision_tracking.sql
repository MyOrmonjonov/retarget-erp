ALTER TABLE tasks
    ADD COLUMN revision_count INT NOT NULL DEFAULT 0,
    ADD COLUMN finished_at TIMESTAMPTZ,
    ADD COLUMN approved_by BIGINT REFERENCES users(id);
