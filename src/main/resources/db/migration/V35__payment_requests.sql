CREATE TABLE payment_requests (
    id BIGSERIAL PRIMARY KEY,
    workspace_id BIGINT NOT NULL REFERENCES workspaces(id) ON DELETE CASCADE,
    requested_by_user_id BIGINT NOT NULL REFERENCES users(id),
    plan_code VARCHAR(32) NOT NULL,
    period_months INT NOT NULL,
    amount NUMERIC(14, 2) NOT NULL,
    currency VARCHAR(8) NOT NULL DEFAULT 'UZS',
    status VARCHAR(16) NOT NULL DEFAULT 'PENDING',
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    decided_at TIMESTAMPTZ,
    decided_by_admin_id BIGINT REFERENCES admin_users(id)
);

CREATE INDEX idx_payment_requests_status ON payment_requests (status, created_at DESC);
CREATE INDEX idx_payment_requests_workspace ON payment_requests (workspace_id, created_at DESC);
