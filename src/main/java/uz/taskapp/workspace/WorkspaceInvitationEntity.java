package uz.taskapp.workspace;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Table;

import java.time.Instant;

@Entity
@Table(name = "workspace_invitations")
public class WorkspaceInvitationEntity {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "workspace_id", nullable = false)
    private Long workspaceId;

    @Column(name = "telegram_id", nullable = false)
    private Long telegramId;

    @Column(name = "role_code", nullable = false, length = 32)
    private String roleCode;

    @Column(name = "invited_by_user_id", nullable = false)
    private Long invitedByUserId;

    @Column(nullable = false, length = 16)
    private String status;

    @Column(name = "created_at", nullable = false, updatable = false)
    private Instant createdAt;

    protected WorkspaceInvitationEntity() {
    }

    public WorkspaceInvitationEntity(Long workspaceId, Long telegramId, String roleCode, Long invitedByUserId) {
        this.workspaceId = workspaceId;
        this.telegramId = telegramId;
        this.roleCode = roleCode == null ? "MEMBER" : roleCode;
        this.invitedByUserId = invitedByUserId;
        this.status = "PENDING";
        this.createdAt = Instant.now();
    }

    public Long getId() { return id; }
    public Long getWorkspaceId() { return workspaceId; }
    public Long getTelegramId() { return telegramId; }
    public String getRoleCode() { return roleCode; }
    public Long getInvitedByUserId() { return invitedByUserId; }
    public String getStatus() { return status; }
    public Instant getCreatedAt() { return createdAt; }

    public void accept() {
        this.status = "ACCEPTED";
    }

    public void revoke() {
        this.status = "REVOKED";
    }
}
