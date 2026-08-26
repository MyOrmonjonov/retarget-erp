CREATE TABLE employee_profiles (
    id           BIGSERIAL PRIMARY KEY,
    workspace_id BIGINT NOT NULL REFERENCES workspaces(id) ON DELETE CASCADE,
    user_id      BIGINT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    org_role     VARCHAR(32) NOT NULL DEFAULT 'HODIM',
    department   VARCHAR(120),
    position     VARCHAR(120),
    status       VARCHAR(24) NOT NULL DEFAULT 'ACTIVE',
    hire_date    DATE,
    email        VARCHAR(255),
    phone        VARCHAR(32),
    created_at   TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at   TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    UNIQUE (workspace_id, user_id)
);

CREATE INDEX ix_employee_profiles_workspace ON employee_profiles (workspace_id);
