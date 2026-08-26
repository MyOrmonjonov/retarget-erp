CREATE TABLE attendance_records (
    id           BIGSERIAL PRIMARY KEY,
    workspace_id BIGINT NOT NULL REFERENCES workspaces(id) ON DELETE CASCADE,
    user_id      BIGINT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    date         DATE NOT NULL,
    check_in     TIME,
    check_out    TIME,
    status       VARCHAR(24) NOT NULL,
    notes        VARCHAR(500),
    created_at   TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at   TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    UNIQUE (workspace_id, user_id, date)
);

CREATE INDEX ix_attendance_workspace_date ON attendance_records (workspace_id, date);
CREATE INDEX ix_attendance_user ON attendance_records (user_id, date);
