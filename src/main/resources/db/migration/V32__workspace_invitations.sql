CREATE TABLE workspace_invitations (
    id BIGSERIAL PRIMARY KEY,
    workspace_id BIGINT NOT NULL REFERENCES workspaces(id) ON DELETE CASCADE,
    telegram_id BIGINT NOT NULL,
    role_code VARCHAR(32) NOT NULL DEFAULT 'MEMBER',
    invited_by_user_id BIGINT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    status VARCHAR(16) NOT NULL DEFAULT 'PENDING',
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_workspace_invitations_telegram_status ON workspace_invitations (telegram_id, status);
CREATE INDEX idx_workspace_invitations_workspace_status ON workspace_invitations (workspace_id, status);
