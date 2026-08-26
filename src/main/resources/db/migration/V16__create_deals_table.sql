CREATE TABLE deals (
    id                  BIGSERIAL PRIMARY KEY,
    workspace_id        BIGINT NOT NULL REFERENCES workspaces(id) ON DELETE CASCADE,
    title               VARCHAR(300) NOT NULL,
    client              VARCHAR(255) NOT NULL,
    value               NUMERIC(14, 2) NOT NULL DEFAULT 0,
    stage               VARCHAR(24) NOT NULL DEFAULT 'LEAD',
    probability         INTEGER NOT NULL DEFAULT 0 CHECK (probability BETWEEN 0 AND 100),
    owner_id            BIGINT NOT NULL REFERENCES users(id),
    expected_close_date DATE,
    description         TEXT,
    contact_person      VARCHAR(255),
    contact_phone       VARCHAR(32),
    contact_email       VARCHAR(255),
    created_at          TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at          TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX ix_deals_workspace ON deals (workspace_id);
CREATE INDEX ix_deals_workspace_stage ON deals (workspace_id, stage);
CREATE INDEX ix_deals_owner ON deals (owner_id);
