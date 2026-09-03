-- Simplified port of the reference CRM's Content Plan grid: one row per content piece. Multi-value
-- fields (owners/platforms/statuses) are stored as comma-separated text rather than native arrays
-- or join tables, to keep this first pass small - fine for the handful of items a project has.
CREATE TABLE content_plan_items (
    id BIGSERIAL PRIMARY KEY,
    project_id BIGINT NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
    item_date DATE NOT NULL,
    topic VARCHAR(300),
    caption TEXT,
    note TEXT,
    format VARCHAR(64),
    platforms VARCHAR(255),
    statuses VARCHAR(255),
    owner_ids VARCHAR(255),
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_content_plan_items_project ON content_plan_items (project_id, item_date);
