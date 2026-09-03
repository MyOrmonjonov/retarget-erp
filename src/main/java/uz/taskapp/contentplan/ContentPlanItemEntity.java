package uz.taskapp.contentplan;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Table;

import java.time.Instant;
import java.time.LocalDate;

@Entity
@Table(name = "content_plan_items")
public class ContentPlanItemEntity {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "project_id", nullable = false)
    private Long projectId;

    @Column(name = "item_date", nullable = false)
    private LocalDate date;

    @Column
    private String topic;

    @Column(columnDefinition = "text")
    private String caption;

    @Column(columnDefinition = "text")
    private String note;

    @Column
    private String format;

    /** Comma-separated - kept simple rather than a native array/join table for this first pass. */
    @Column
    private String platforms;

    @Column
    private String statuses;

    @Column(name = "owner_ids")
    private String ownerIds;

    @Column(name = "created_at", nullable = false, updatable = false)
    private Instant createdAt;

    @Column(name = "updated_at", nullable = false)
    private Instant updatedAt;

    protected ContentPlanItemEntity() {
    }

    public ContentPlanItemEntity(Long projectId, LocalDate date, String topic, String caption, String note,
                                  String format, String platforms, String statuses, String ownerIds) {
        this.projectId = projectId;
        this.date = date;
        this.topic = topic;
        this.caption = caption;
        this.note = note;
        this.format = format;
        this.platforms = platforms;
        this.statuses = statuses;
        this.ownerIds = ownerIds;
        this.createdAt = Instant.now();
        this.updatedAt = this.createdAt;
    }

    public void update(LocalDate date, String topic, String caption, String note, String format,
                        String platforms, String statuses, String ownerIds) {
        this.date = date;
        this.topic = topic;
        this.caption = caption;
        this.note = note;
        this.format = format;
        this.platforms = platforms;
        this.statuses = statuses;
        this.ownerIds = ownerIds;
        this.updatedAt = Instant.now();
    }

    public Long getId() { return id; }
    public Long getProjectId() { return projectId; }
    public LocalDate getDate() { return date; }
    public String getTopic() { return topic; }
    public String getCaption() { return caption; }
    public String getNote() { return note; }
    public String getFormat() { return format; }
    public String getPlatforms() { return platforms; }
    public String getStatuses() { return statuses; }
    public String getOwnerIds() { return ownerIds; }
    public Instant getCreatedAt() { return createdAt; }
    public Instant getUpdatedAt() { return updatedAt; }
}
