package uz.taskapp.projectmonth;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Table;

import java.time.Instant;

@Entity
@Table(name = "project_months")
public class ProjectMonthEntity {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "workspace_id", nullable = false)
    private Long workspaceId;

    @Column(name = "project_id", nullable = false)
    private Long projectId;

    @Column(name = "month_key", nullable = false, length = 7)
    private String monthKey;

    @Column(name = "display_name", length = 100)
    private String displayName;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 16)
    private ProjectMonthStatus status;

    @Column(name = "created_at", nullable = false, updatable = false)
    private Instant createdAt;

    @Column(name = "updated_at", nullable = false)
    private Instant updatedAt;

    protected ProjectMonthEntity() {
    }

    public ProjectMonthEntity(Long workspaceId, Long projectId, String monthKey) {
        this.workspaceId = workspaceId;
        this.projectId = projectId;
        this.monthKey = monthKey;
        this.status = ProjectMonthStatus.ACTIVE;
        this.createdAt = Instant.now();
        this.updatedAt = this.createdAt;
    }

    public void rename(String displayName) {
        this.displayName = displayName;
        this.updatedAt = Instant.now();
    }

    public void changeStatus(ProjectMonthStatus status) {
        this.status = status;
        this.updatedAt = Instant.now();
    }

    public Long getId() { return id; }
    public Long getWorkspaceId() { return workspaceId; }
    public Long getProjectId() { return projectId; }
    public String getMonthKey() { return monthKey; }
    public String getDisplayName() { return displayName; }
    public ProjectMonthStatus getStatus() { return status; }
    public Instant getCreatedAt() { return createdAt; }
    public Instant getUpdatedAt() { return updatedAt; }
}
