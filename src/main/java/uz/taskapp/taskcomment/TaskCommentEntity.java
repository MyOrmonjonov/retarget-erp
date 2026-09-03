package uz.taskapp.taskcomment;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Table;

import java.time.Instant;

@Entity
@Table(name = "task_comments")
public class TaskCommentEntity {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "task_id", nullable = false)
    private Long taskId;

    @Column(name = "author_id", nullable = false)
    private Long authorId;

    @Column(name = "parent_id")
    private Long parentId;

    @Column(nullable = false, columnDefinition = "text")
    private String body;

    @Column(name = "created_at", nullable = false, updatable = false)
    private Instant createdAt;

    protected TaskCommentEntity() {
    }

    public TaskCommentEntity(Long taskId, Long authorId, Long parentId, String body) {
        this.taskId = taskId;
        this.authorId = authorId;
        this.parentId = parentId;
        this.body = body;
        this.createdAt = Instant.now();
    }

    public Long getId() { return id; }
    public Long getTaskId() { return taskId; }
    public Long getAuthorId() { return authorId; }
    public Long getParentId() { return parentId; }
    public String getBody() { return body; }
    public Instant getCreatedAt() { return createdAt; }
}
