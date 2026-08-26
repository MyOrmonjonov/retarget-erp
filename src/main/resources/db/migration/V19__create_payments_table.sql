CREATE TABLE payments (
    id           BIGSERIAL PRIMARY KEY,
    workspace_id BIGINT NOT NULL REFERENCES workspaces(id) ON DELETE CASCADE,
    invoice_id   BIGINT REFERENCES invoices(id) ON DELETE SET NULL,
    client_id    BIGINT REFERENCES customers(id) ON DELETE SET NULL,
    client_name  VARCHAR(255) NOT NULL,
    amount       NUMERIC(14, 2) NOT NULL DEFAULT 0,
    currency     VARCHAR(8) NOT NULL DEFAULT 'UZS',
    status       VARCHAR(24) NOT NULL DEFAULT 'PENDING',
    due_date     DATE NOT NULL,
    paid_date    DATE,
    method       VARCHAR(50),
    description  TEXT,
    created_at   TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at   TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX ix_payments_workspace ON payments (workspace_id);
CREATE INDEX ix_payments_workspace_status ON payments (workspace_id, status);
CREATE INDEX ix_payments_invoice ON payments (invoice_id);
