CREATE TABLE customers (
    id               BIGSERIAL PRIMARY KEY,
    workspace_id     BIGINT NOT NULL REFERENCES workspaces(id) ON DELETE CASCADE,
    full_name        VARCHAR(255) NOT NULL,
    phone            VARCHAR(32) NOT NULL,
    email            VARCHAR(255),
    telegram_chat_id BIGINT,
    status           VARCHAR(32) NOT NULL DEFAULT 'LEAD',
    created_at       TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at       TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE UNIQUE INDEX ux_customers_workspace_phone ON customers (workspace_id, phone);
CREATE INDEX ix_customers_workspace ON customers (workspace_id);
CREATE INDEX ix_customers_telegram_chat_id ON customers (telegram_chat_id);
