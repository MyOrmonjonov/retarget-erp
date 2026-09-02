package uz.taskapp.project;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Table;

import java.math.BigDecimal;
import java.time.Instant;
import java.time.LocalDate;

@Entity
@Table(name = "projects")
public class ProjectEntity {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "workspace_id", nullable = false)
    private Long workspaceId;

    @Column(nullable = false, length = 300)
    private String name;

    @Column(name = "client_id")
    private Long clientId;

    @Column(name = "client_name", nullable = false)
    private String clientName;

    @Column
    private String type;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 24)
    private ProjectStatus status;

    @Column(nullable = false)
    private int progress;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 16)
    private ProjectPriority priority;

    @Column(name = "manager_id", nullable = false)
    private Long managerId;

    @Column(name = "start_date")
    private LocalDate startDate;

    @Column
    private LocalDate deadline;

    @Column
    private BigDecimal budget;

    @Column
    private String description;

    @Column(name = "created_at", nullable = false, updatable = false)
    private Instant createdAt;

    @Column(name = "updated_at", nullable = false)
    private Instant updatedAt;

    protected ProjectEntity() {
    }

    public ProjectEntity(Long workspaceId, String name, Long clientId, String clientName, String type,
                          ProjectStatus status, int progress, ProjectPriority priority, Long managerId,
                          LocalDate startDate, LocalDate deadline, BigDecimal budget, String description) {
        this.workspaceId = workspaceId;
        this.name = name;
        this.clientId = clientId;
        this.clientName = clientName;
        this.type = type;
        this.status = status == null ? ProjectStatus.PLANNING : status;
        this.progress = progress;
        this.priority = priority == null ? ProjectPriority.MEDIUM : priority;
        this.managerId = managerId;
        this.startDate = startDate;
        this.deadline = deadline;
        this.budget = budget;
        this.description = description;
        this.createdAt = Instant.now();
        this.updatedAt = this.createdAt;
    }

    public void update(String name, Long clientId, String clientName, String type, ProjectPriority priority,
                        Long managerId, LocalDate startDate, LocalDate deadline, BigDecimal budget, String description) {
        this.name = name;
        this.clientId = clientId;
        this.clientName = clientName;
        this.type = type;
        this.priority = priority == null ? ProjectPriority.MEDIUM : priority;
        this.managerId = managerId;
        this.startDate = startDate;
        this.deadline = deadline;
        this.budget = budget;
        this.description = description;
        this.updatedAt = Instant.now();
    }

    public void changeStatus(ProjectStatus status) {
        this.status = status;
        this.updatedAt = Instant.now();
    }

    public void updateProgress(int progress) {
        this.progress = progress;
        this.updatedAt = Instant.now();
    }

    public Long getId() { return id; }
    public Long getWorkspaceId() { return workspaceId; }
    public String getName() { return name; }
    public Long getClientId() { return clientId; }
    public String getClientName() { return clientName; }
    public String getType() { return type; }
    public ProjectStatus getStatus() { return status; }
    public int getProgress() { return progress; }
    public ProjectPriority getPriority() { return priority; }
    public Long getManagerId() { return managerId; }
    public LocalDate getStartDate() { return startDate; }
    public LocalDate getDeadline() { return deadline; }
    public BigDecimal getBudget() { return budget; }
    public String getDescription() { return description; }
    public Instant getCreatedAt() { return createdAt; }
    public Instant getUpdatedAt() { return updatedAt; }
}
