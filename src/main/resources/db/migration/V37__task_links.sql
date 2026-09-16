-- Reference URLs attached to a task (ported from the reference CRM's Dizayn bo'limi "Havolalar"
-- field on the Yangi TZ form) - same shape/pattern as the existing task_checklists table.
CREATE TABLE task_links (
    id BIGSERIAL PRIMARY KEY,
    task_id BIGINT NOT NULL REFERENCES tasks(id) ON DELETE CASCADE,
    url VARCHAR(2000) NOT NULL,
    position INTEGER NOT NULL DEFAULT 0,
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_task_links_task ON task_links (task_id);
