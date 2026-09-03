package uz.taskapp.shooting;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Table;

import java.time.Instant;
import java.time.LocalDate;
import java.time.LocalTime;

@Entity
@Table(name = "shooting_events")
public class ShootingEventEntity {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "workspace_id", nullable = false)
    private Long workspaceId;

    @Column(name = "project_id")
    private Long projectId;

    @Column(nullable = false, length = 300)
    private String title;

    @Column(nullable = false)
    private LocalDate date;

    @Column(name = "start_time", nullable = false)
    private LocalTime startTime;

    @Column(name = "end_time", nullable = false)
    private LocalTime endTime;

    @Column
    private String location;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 24)
    private ShootingEventType type;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 24)
    private ShootingEventStatus status;

    @Column
    private String description;

    @Column(name = "created_at", nullable = false, updatable = false)
    private Instant createdAt;

    @Column(name = "updated_at", nullable = false)
    private Instant updatedAt;

    protected ShootingEventEntity() {
    }

    public ShootingEventEntity(Long workspaceId, String title, LocalDate date, LocalTime startTime,
                                LocalTime endTime, String location, ShootingEventType type, String description) {
        this.workspaceId = workspaceId;
        this.title = title;
        this.date = date;
        this.startTime = startTime;
        this.endTime = endTime;
        this.location = location;
        this.type = type;
        this.status = ShootingEventStatus.PLANNING;
        this.description = description;
        this.createdAt = Instant.now();
        this.updatedAt = this.createdAt;
    }

    public void update(String title, LocalDate date, LocalTime startTime, LocalTime endTime, String location,
                        ShootingEventType type, String description) {
        this.title = title;
        this.date = date;
        this.startTime = startTime;
        this.endTime = endTime;
        this.location = location;
        this.type = type;
        this.description = description;
        this.updatedAt = Instant.now();
    }

    public void changeStatus(ShootingEventStatus status) {
        this.status = status;
        this.updatedAt = Instant.now();
    }

    public void linkProject(Long projectId) {
        this.projectId = projectId;
        this.updatedAt = Instant.now();
    }

    public Long getId() { return id; }
    public Long getWorkspaceId() { return workspaceId; }
    public Long getProjectId() { return projectId; }
    public String getTitle() { return title; }
    public LocalDate getDate() { return date; }
    public LocalTime getStartTime() { return startTime; }
    public LocalTime getEndTime() { return endTime; }
    public String getLocation() { return location; }
    public ShootingEventType getType() { return type; }
    public ShootingEventStatus getStatus() { return status; }
    public String getDescription() { return description; }
    public Instant getCreatedAt() { return createdAt; }
    public Instant getUpdatedAt() { return updatedAt; }
}
