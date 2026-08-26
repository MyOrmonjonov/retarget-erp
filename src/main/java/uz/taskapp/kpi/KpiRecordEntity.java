package uz.taskapp.kpi;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Table;

import java.math.BigDecimal;
import java.time.Instant;

@Entity
@Table(name = "kpi_records")
public class KpiRecordEntity {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "workspace_id", nullable = false)
    private Long workspaceId;

    @Column(name = "user_id", nullable = false)
    private Long userId;

    @Column(nullable = false, length = 7)
    private String period;

    @Column(nullable = false)
    private BigDecimal target;

    @Column(nullable = false)
    private BigDecimal actual;

    @Column(nullable = false)
    private int score;

    @Column(name = "tasks_completed", nullable = false)
    private int tasksCompleted;

    @Column(name = "tasks_on_time", nullable = false)
    private int tasksOnTime;

    @Column(name = "quality_score", nullable = false)
    private int qualityScore;

    @Column(name = "collaboration_score", nullable = false)
    private int collaborationScore;

    @Column(name = "created_at", nullable = false, updatable = false)
    private Instant createdAt;

    @Column(name = "updated_at", nullable = false)
    private Instant updatedAt;

    protected KpiRecordEntity() {
    }

    public KpiRecordEntity(Long workspaceId, Long userId, String period, BigDecimal target, BigDecimal actual,
                            int score, int tasksCompleted, int tasksOnTime, int qualityScore, int collaborationScore) {
        this.workspaceId = workspaceId;
        this.userId = userId;
        this.period = period;
        this.target = target;
        this.actual = actual;
        this.score = score;
        this.tasksCompleted = tasksCompleted;
        this.tasksOnTime = tasksOnTime;
        this.qualityScore = qualityScore;
        this.collaborationScore = collaborationScore;
        this.createdAt = Instant.now();
        this.updatedAt = this.createdAt;
    }

    public void update(BigDecimal target, BigDecimal actual, int score, int tasksCompleted, int tasksOnTime,
                        int qualityScore, int collaborationScore) {
        this.target = target;
        this.actual = actual;
        this.score = score;
        this.tasksCompleted = tasksCompleted;
        this.tasksOnTime = tasksOnTime;
        this.qualityScore = qualityScore;
        this.collaborationScore = collaborationScore;
        this.updatedAt = Instant.now();
    }

    public Long getId() { return id; }
    public Long getWorkspaceId() { return workspaceId; }
    public Long getUserId() { return userId; }
    public String getPeriod() { return period; }
    public BigDecimal getTarget() { return target; }
    public BigDecimal getActual() { return actual; }
    public int getScore() { return score; }
    public int getTasksCompleted() { return tasksCompleted; }
    public int getTasksOnTime() { return tasksOnTime; }
    public int getQualityScore() { return qualityScore; }
    public int getCollaborationScore() { return collaborationScore; }
    public Instant getCreatedAt() { return createdAt; }
    public Instant getUpdatedAt() { return updatedAt; }
}
