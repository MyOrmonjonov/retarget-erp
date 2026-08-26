CREATE TABLE projects (
    id           BIGSERIAL PRIMARY KEY,
    workspace_id BIGINT NOT NULL REFERENCES workspaces(id) ON DELETE CASCADE,
    name         VARCHAR(300) NOT NULL,
    client_id    BIGINT REFERENCES customers(id) ON DELETE SET NULL,
    client_name  VARCHAR(255) NOT NULL,
    type         VARCHAR(100),
    status       VARCHAR(24) NOT NULL DEFAULT 'PLANNING',
    progress     INTEGER NOT NULL DEFAULT 0 CHECK (progress BETWEEN 0 AND 100),
    manager_id   BIGINT NOT NULL REFERENCES users(id),
    start_date   DATE,
    deadline     DATE,
    budget       NUMERIC(14, 2),
    description  TEXT,
    created_at   TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at   TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX ix_projects_workspace ON projects (workspace_id);
CREATE INDEX ix_projects_workspace_status ON projects (workspace_id, status);
CREATE INDEX ix_projects_manager ON projects (manager_id);
CREATE INDEX ix_projects_client ON projects (client_id);
