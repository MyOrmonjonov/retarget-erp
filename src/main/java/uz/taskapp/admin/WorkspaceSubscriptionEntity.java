package uz.taskapp.admin;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import jakarta.persistence.Table;

import java.time.Instant;
import java.time.LocalDate;

@Entity
@Table(name = "workspace_subscriptions")
public class WorkspaceSubscriptionEntity {
    @Id
    @Column(name = "workspace_id")
    private Long workspaceId;

    @Column(name = "plan_code", nullable = false, length = 32)
    private String planCode;

    @Column(name = "current_period_end", nullable = false)
    private LocalDate currentPeriodEnd;

    @Column(name = "updated_at", nullable = false)
    private Instant updatedAt;

    protected WorkspaceSubscriptionEntity() {
    }

    public WorkspaceSubscriptionEntity(Long workspaceId, String planCode, LocalDate currentPeriodEnd) {
        this.workspaceId = workspaceId;
        this.planCode = planCode;
        this.currentPeriodEnd = currentPeriodEnd;
        this.updatedAt = Instant.now();
    }

    /** Extends (or starts, if the plan lapsed) the paid period by the given number of months and
     * records the plan the payment was made for. */
    public void extend(String planCode, int periodMonths, LocalDate today) {
        LocalDate base = currentPeriodEnd.isAfter(today) ? currentPeriodEnd : today;
        this.currentPeriodEnd = base.plusMonths(periodMonths);
        this.planCode = planCode;
        this.updatedAt = Instant.now();
    }

    public Long getWorkspaceId() { return workspaceId; }
    public String getPlanCode() { return planCode; }
    public LocalDate getCurrentPeriodEnd() { return currentPeriodEnd; }
}
