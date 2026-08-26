CREATE TABLE shooting_events (
    id           BIGSERIAL PRIMARY KEY,
    workspace_id BIGINT NOT NULL REFERENCES workspaces(id) ON DELETE CASCADE,
    title        VARCHAR(300) NOT NULL,
    date         DATE NOT NULL,
    start_time   TIME NOT NULL,
    end_time     TIME NOT NULL,
    location     VARCHAR(300),
    type         VARCHAR(24) NOT NULL,
    status       VARCHAR(24) NOT NULL DEFAULT 'PLANNING',
    description  TEXT,
    created_at   TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at   TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX ix_shooting_events_workspace_date ON shooting_events (workspace_id, date);

CREATE TABLE shooting_event_team_members (
    event_id BIGINT NOT NULL REFERENCES shooting_events(id) ON DELETE CASCADE,
    user_id  BIGINT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    PRIMARY KEY (event_id, user_id)
);
