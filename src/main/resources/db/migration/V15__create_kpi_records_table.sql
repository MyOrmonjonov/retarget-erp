CREATE TABLE kpi_records (
    id                  BIGSERIAL PRIMARY KEY,
    workspace_id        BIGINT NOT NULL REFERENCES workspaces(id) ON DELETE CASCADE,
    user_id             BIGINT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    period              VARCHAR(7) NOT NULL,
    target              NUMERIC(14, 2) NOT NULL DEFAULT 0,
    actual              NUMERIC(14, 2) NOT NULL DEFAULT 0,
    score               INTEGER NOT NULL DEFAULT 0 CHECK (score BETWEEN 0 AND 100),
    tasks_completed     INTEGER NOT NULL DEFAULT 0,
    tasks_on_time       INTEGER NOT NULL DEFAULT 0,
    quality_score       INTEGER NOT NULL DEFAULT 0 CHECK (quality_score BETWEEN 0 AND 100),
    collaboration_score INTEGER NOT NULL DEFAULT 0 CHECK (collaboration_score BETWEEN 0 AND 100),
    created_at          TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at          TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    UNIQUE (workspace_id, user_id, period)
);

CREATE INDEX ix_kpi_workspace_period ON kpi_records (workspace_id, period);
CREATE INDEX ix_kpi_user ON kpi_records (user_id);
