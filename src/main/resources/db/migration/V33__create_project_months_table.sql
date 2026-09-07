-- Per-project month metadata (custom display name + active/archived state). Which month a task
-- or content-plan item belongs to is still derived from its own due date - this table only holds
-- the extra bookkeeping a user attaches to a month bucket (rename it, archive it, delete the
-- bookkeeping), not the task/content assignment itself.
CREATE TABLE project_months (
    id BIGSERIAL PRIMARY KEY,
    workspace_id BIGINT NOT NULL,
    project_id BIGINT NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
    month_key VARCHAR(7) NOT NULL,
    display_name VARCHAR(100),
    status VARCHAR(16) NOT NULL DEFAULT 'ACTIVE',
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    UNIQUE (project_id, month_key)
);

CREATE INDEX idx_project_months_project ON project_months (project_id);
