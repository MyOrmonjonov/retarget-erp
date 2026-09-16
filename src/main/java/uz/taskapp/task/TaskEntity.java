package uz.taskapp.task;

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
@Table(name = "tasks")
public class TaskEntity {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "workspace_id", nullable = false)
    private Long workspaceId;

    @Column(name = "sequence_number", nullable = false)
    private Long sequenceNumber;

    @Column(name = "group_id")
    private Long groupId;

    @Column(name = "topic_id")
    private Long topicId;

    @Column(name = "author_id", nullable = false)
    private Long authorId;

    @Column(nullable = false, length = 300)
    private String title;

    @Column(columnDefinition = "text")
    private String description;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 24)
    private TaskStatus status;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 16)
    private TaskPriority priority;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 20)
    private TaskVisibility visibility;

    @Column(name = "due_at")
    private Instant dueAt;

    @Column(name = "completed_at")
    private Instant completedAt;

    @Column(name = "deleted_at")
    private Instant deletedAt;

    @Column(name = "deleted_by")
    private Long deletedBy;

    @Column(name = "telegram_message_id")
    private Long telegramMessageId;

    /** Optional design-task metadata (Dizayn bo'limi only in the UI) - ported from the reference
     *  CRM's Design page. Not part of the constructor since every other caller has no use for it. */
    @Column
    private String format;

    @Column
    private String platform;

    /** Montaj bo'limi only - ported from the reference CRM's Montaj page ("Qayta ishlash" /
     *  "Bajarildi" actions on a review-stage card). finishedAt/approvedBy are set together by
     *  {@link #approve}; revisionCount increments each time {@link #requestRevision} is called. */
    @Column(name = "revision_count", nullable = false)
    private int revisionCount;

    @Column(name = "finished_at")
    private Instant finishedAt;

    @Column(name = "approved_by")
    private Long approvedBy;

    /** Optional - tasks are workspace-wide in this app, not owned by a project the way the
     *  reference CRM's task model is. Lets a task show up on a project's detail page when set. */
    @Column(name = "project_id")
    private Long projectId;

    /** Optional - set when this task is a subtask of another task (e.g. a Dizayn bo'limi "TZ"
     *  containing several independent sub-tasks). Never more than one level deep - see
     *  TaskService#create validation. */
    @Column(name = "parent_task_id")
    private Long parentTaskId;

    @Column(name = "created_at", nullable = false, updatable = false)
    private Instant createdAt;

    @Column(name = "updated_at", nullable = false)
    private Instant updatedAt;

    protected TaskEntity() {
    }

    public TaskEntity(Long workspaceId, Long groupId, Long topicId, Long authorId, String title,
                      String description, TaskStatus status, TaskPriority priority,
                      TaskVisibility visibility, Instant dueAt) {
        this.workspaceId = workspaceId;
        this.groupId = groupId;
        this.topicId = topicId;
        this.authorId = authorId;
        this.title = title.trim();
        this.description = description;
        this.status = status;
        this.priority = priority;
        this.visibility = visibility;
        this.dueAt = dueAt;
        this.createdAt = Instant.now();
        this.updatedAt = this.createdAt;
    }

    public void assignSequence(long sequenceNumber) {
        this.sequenceNumber = sequenceNumber;
    }

    public void changeStatus(TaskStatus status) {
        this.status = status;
        this.completedAt = status == TaskStatus.COMPLETED ? Instant.now() : null;
        this.updatedAt = Instant.now();
    }

    public void linkProject(Long projectId) {
        this.projectId = projectId;
        this.updatedAt = Instant.now();
    }

    public void linkParent(Long parentTaskId) {
        this.parentTaskId = parentTaskId;
        this.updatedAt = Instant.now();
    }

    public void updateDesignMeta(String format, String platform) {
        this.format = format == null || format.isBlank() ? null : format.trim();
        this.platform = platform == null || platform.isBlank() ? null : platform.trim();
        this.updatedAt = Instant.now();
    }

    public void approve(Long approvedBy) {
        changeStatus(TaskStatus.COMPLETED);
        this.finishedAt = Instant.now();
        this.approvedBy = approvedBy;
    }

    public void requestRevision() {
        changeStatus(TaskStatus.BLOCKED);
        this.revisionCount += 1;
    }

    public void linkTelegramMessage(Long telegramMessageId) {
        this.telegramMessageId = telegramMessageId;
        this.updatedAt = Instant.now();
    }

    public void updateDetails(String title, String description, TaskStatus status,
                              TaskPriority priority, Instant dueAt, boolean dueAtProvided) {
        this.title = title.trim();
        this.description = description == null || description.isBlank() ? null : description.trim();
        if (priority != null) this.priority = priority;
        if (dueAtProvided) this.dueAt = dueAt;
        if (this.status != status) changeStatus(status);
        else this.updatedAt = Instant.now();
    }

    public void changePlacement(TaskVisibility visibility, Long groupId, Long topicId) {
        this.visibility = visibility;
        this.groupId = groupId;
        this.topicId = topicId;
        this.telegramMessageId = null;
        this.updatedAt = Instant.now();
    }

    public void changeAuthor(Long authorId) {
        this.authorId = authorId;
        this.updatedAt = Instant.now();
    }

    public void archive(Long byUserId) {
        this.deletedAt = Instant.now();
        this.deletedBy = byUserId;
        this.updatedAt = Instant.now();
    }

    public void restore() {
        this.deletedAt = null;
        this.deletedBy = null;
        this.updatedAt = Instant.now();
    }

    public Long getId() { return id; }
    public Long getWorkspaceId() { return workspaceId; }
    public Long getSequenceNumber() { return sequenceNumber; }
    public Long getGroupId() { return groupId; }
    public Long getTopicId() { return topicId; }
    public Long getAuthorId() { return authorId; }
    public String getTitle() { return title; }
    public String getDescription() { return description; }
    public TaskStatus getStatus() { return status; }
    public TaskPriority getPriority() { return priority; }
    public TaskVisibility getVisibility() { return visibility; }
    public Instant getDueAt() { return dueAt; }
    public Instant getCompletedAt() { return completedAt; }
    public Instant getDeletedAt() { return deletedAt; }
    public Long getDeletedBy() { return deletedBy; }
    public Long getTelegramMessageId() { return telegramMessageId; }
    public String getFormat() { return format; }
    public String getPlatform() { return platform; }
    public int getRevisionCount() { return revisionCount; }
    public Instant getFinishedAt() { return finishedAt; }
    public Long getApprovedBy() { return approvedBy; }
    public Long getProjectId() { return projectId; }
    public Long getParentTaskId() { return parentTaskId; }
    public Instant getCreatedAt() { return createdAt; }
    public Instant getUpdatedAt() { return updatedAt; }
}
