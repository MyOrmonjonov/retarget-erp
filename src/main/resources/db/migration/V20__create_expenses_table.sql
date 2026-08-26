CREATE TABLE expenses (
    id           BIGSERIAL PRIMARY KEY,
    workspace_id BIGINT NOT NULL REFERENCES workspaces(id) ON DELETE CASCADE,
    title        VARCHAR(255) NOT NULL,
    amount       NUMERIC(14, 2) NOT NULL DEFAULT 0,
    currency     VARCHAR(8) NOT NULL DEFAULT 'UZS',
    category     VARCHAR(24) NOT NULL,
    date         DATE NOT NULL,
    description  TEXT,
    receipt_url  TEXT,
    approved_by  BIGINT REFERENCES users(id),
    approved_at  TIMESTAMPTZ,
    created_at   TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at   TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX ix_expenses_workspace ON expenses (workspace_id);
CREATE INDEX ix_expenses_workspace_date ON expenses (workspace_id, date);
CREATE INDEX ix_expenses_category ON expenses (workspace_id, category);
