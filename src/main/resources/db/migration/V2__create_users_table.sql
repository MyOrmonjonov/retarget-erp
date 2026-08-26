CREATE TABLE users (
    id          BIGSERIAL PRIMARY KEY,
    username    VARCHAR(100)       NOT NULL UNIQUE,
    password    VARCHAR(255)       NOT NULL,
    full_name   VARCHAR(255)       NOT NULL,
    phone       VARCHAR(32),
    email       VARCHAR(255),
    avatar_url  VARCHAR(500),
    role        VARCHAR(32)        NOT NULL,
    is_active   BOOLEAN            NOT NULL DEFAULT true,
    created_at  TIMESTAMP          NOT NULL DEFAULT now(),
    updated_at  TIMESTAMP          NOT NULL DEFAULT now()
);

CREATE INDEX ix_users_username ON users (username);