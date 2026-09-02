package uz.taskapp.project;

import jakarta.persistence.Column;
import jakarta.persistence.EmbeddedId;
import jakarta.persistence.Entity;
import jakarta.persistence.Table;

import java.time.Instant;

@Entity
@Table(name = "project_members")
public class ProjectMemberEntity {
    @EmbeddedId
    private ProjectMemberId id;

    @Column(name = "added_at", nullable = false, updatable = false)
    private Instant addedAt;

    protected ProjectMemberEntity() {
    }

    public ProjectMemberEntity(Long projectId, Long userId) {
        this.id = new ProjectMemberId(projectId, userId);
        this.addedAt = Instant.now();
    }

    public Long getProjectId() { return id.projectId(); }
    public Long getUserId() { return id.userId(); }
}
