CREATE TABLE invoices (
    id           BIGSERIAL PRIMARY KEY,
    workspace_id BIGINT NOT NULL REFERENCES workspaces(id) ON DELETE CASCADE,
    number       VARCHAR(40) NOT NULL,
    client_id    BIGINT REFERENCES customers(id) ON DELETE SET NULL,
    client_name  VARCHAR(255) NOT NULL,
    amount       NUMERIC(14, 2) NOT NULL DEFAULT 0,
    currency     VARCHAR(8) NOT NULL DEFAULT 'UZS',
    status       VARCHAR(24) NOT NULL DEFAULT 'DRAFT',
    issue_date   DATE NOT NULL,
    due_date     DATE NOT NULL,
    notes        TEXT,
    created_at   TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at   TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    UNIQUE (workspace_id, number)
);

CREATE INDEX ix_invoices_workspace ON invoices (workspace_id);
CREATE INDEX ix_invoices_workspace_status ON invoices (workspace_id, status);
CREATE INDEX ix_invoices_client ON invoices (client_id);

CREATE TABLE invoice_items (
    id          BIGSERIAL PRIMARY KEY,
    invoice_id  BIGINT NOT NULL REFERENCES invoices(id) ON DELETE CASCADE,
    description VARCHAR(500) NOT NULL,
    quantity    NUMERIC(12, 2) NOT NULL DEFAULT 1,
    unit_price  NUMERIC(14, 2) NOT NULL DEFAULT 0,
    total       NUMERIC(14, 2) NOT NULL DEFAULT 0,
    position    INTEGER NOT NULL DEFAULT 0
);

CREATE INDEX ix_invoice_items_invoice ON invoice_items (invoice_id, position);
