CREATE TABLE target_records (
    id              BIGSERIAL PRIMARY KEY,
    workspace_id    BIGINT NOT NULL REFERENCES workspaces(id) ON DELETE CASCADE,
    user_id         BIGINT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    period          VARCHAR(7) NOT NULL,
    target_amount   NUMERIC(14, 2) NOT NULL DEFAULT 0,
    actual_amount   NUMERIC(14, 2) NOT NULL DEFAULT 0,
    conversion_rate NUMERIC(5, 2) NOT NULL DEFAULT 0,
    calls_count     INTEGER NOT NULL DEFAULT 0,
    meetings_count  INTEGER NOT NULL DEFAULT 0,
    deals_closed    INTEGER NOT NULL DEFAULT 0,
    created_at      TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at      TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    UNIQUE (workspace_id, user_id, period)
);

CREATE INDEX ix_target_records_workspace_period ON target_records (workspace_id, period);
CREATE INDEX ix_target_records_user ON target_records (user_id);
