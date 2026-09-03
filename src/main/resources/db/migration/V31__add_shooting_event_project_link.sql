ALTER TABLE shooting_events
    ADD COLUMN project_id BIGINT REFERENCES projects(id) ON DELETE CASCADE;

CREATE INDEX idx_shooting_events_project ON shooting_events (project_id);
