CREATE TABLE customers (
    id          BIGSERIAL PRIMARY KEY,
    full_name   VARCHAR(255)       NOT NULL,
    phone       VARCHAR(32)        NOT NULL,
    email       VARCHAR(255),
    telegram_chat_id BIGINT,
    status      VARCHAR(32)        NOT NULL DEFAULT 'LEAD',
    created_at  TIMESTAMP          NOT NULL DEFAULT now(),
    updated_at  TIMESTAMP          NOT NULL DEFAULT now()
);

CREATE UNIQUE INDEX ux_customers_phone ON customers (phone);
CREATE INDEX ix_customers_telegram_chat_id ON customers (telegram_chat_id);
