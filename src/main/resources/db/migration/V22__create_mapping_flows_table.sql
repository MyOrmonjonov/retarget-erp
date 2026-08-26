CREATE TABLE mapping_flows (
    id           BIGSERIAL PRIMARY KEY,
    workspace_id BIGINT NOT NULL REFERENCES workspaces(id) ON DELETE CASCADE,
    name         VARCHAR(255) NOT NULL,
    description  TEXT,
    is_active    BOOLEAN NOT NULL DEFAULT TRUE,
    created_at   TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at   TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX ix_mapping_flows_workspace ON mapping_flows (workspace_id);

CREATE TABLE mapping_steps (
    id               BIGSERIAL PRIMARY KEY,
    flow_id          BIGINT NOT NULL REFERENCES mapping_flows(id) ON DELETE CASCADE,
    name             VARCHAR(255) NOT NULL,
    description      TEXT,
    position         INTEGER NOT NULL DEFAULT 0,
    department       VARCHAR(120),
    responsible_role VARCHAR(32),
    estimated_days   INTEGER NOT NULL DEFAULT 1,
    created_at       TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at       TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX ix_mapping_steps_flow ON mapping_steps (flow_id, position);

CREATE TABLE mapping_step_dependencies (
    step_id            BIGINT NOT NULL REFERENCES mapping_steps(id) ON DELETE CASCADE,
    depends_on_step_id BIGINT NOT NULL REFERENCES mapping_steps(id) ON DELETE CASCADE,
    PRIMARY KEY (step_id, depends_on_step_id)
);
