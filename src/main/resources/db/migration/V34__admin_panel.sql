CREATE TABLE admin_users (
    id BIGSERIAL PRIMARY KEY,
    username VARCHAR(64) NOT NULL UNIQUE,
    password_hash VARCHAR(160) NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE workspace_subscriptions (
    workspace_id BIGINT PRIMARY KEY REFERENCES workspaces(id) ON DELETE CASCADE,
    plan_code VARCHAR(32) NOT NULL,
    current_period_end DATE NOT NULL,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE subscription_payments (
    id BIGSERIAL PRIMARY KEY,
    workspace_id BIGINT NOT NULL REFERENCES workspaces(id) ON DELETE CASCADE,
    amount NUMERIC(14, 2) NOT NULL,
    currency VARCHAR(8) NOT NULL DEFAULT 'UZS',
    plan_code VARCHAR(32) NOT NULL,
    period_months INT NOT NULL,
    note VARCHAR(500),
    recorded_by_admin_id BIGINT NOT NULL REFERENCES admin_users(id),
    paid_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_subscription_payments_workspace ON subscription_payments (workspace_id, paid_at DESC);
