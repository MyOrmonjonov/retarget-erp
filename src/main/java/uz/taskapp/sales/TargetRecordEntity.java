package uz.taskapp.sales;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Table;

import java.math.BigDecimal;
import java.time.Instant;

@Entity
@Table(name = "target_records")
public class TargetRecordEntity {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "workspace_id", nullable = false)
    private Long workspaceId;

    @Column(name = "user_id", nullable = false)
    private Long userId;

    @Column(nullable = false, length = 7)
    private String period;

    @Column(name = "target_amount", nullable = false)
    private BigDecimal targetAmount;

    @Column(name = "actual_amount", nullable = false)
    private BigDecimal actualAmount;

    @Column(name = "conversion_rate", nullable = false)
    private BigDecimal conversionRate;

    @Column(name = "calls_count", nullable = false)
    private int callsCount;

    @Column(name = "meetings_count", nullable = false)
    private int meetingsCount;

    @Column(name = "deals_closed", nullable = false)
    private int dealsClosed;

    @Column(name = "created_at", nullable = false, updatable = false)
    private Instant createdAt;

    @Column(name = "updated_at", nullable = false)
    private Instant updatedAt;

    protected TargetRecordEntity() {
    }

    public TargetRecordEntity(Long workspaceId, Long userId, String period, BigDecimal targetAmount,
                               BigDecimal actualAmount, BigDecimal conversionRate, int callsCount,
                               int meetingsCount, int dealsClosed) {
        this.workspaceId = workspaceId;
        this.userId = userId;
        this.period = period;
        this.targetAmount = targetAmount;
        this.actualAmount = actualAmount;
        this.conversionRate = conversionRate;
        this.callsCount = callsCount;
        this.meetingsCount = meetingsCount;
        this.dealsClosed = dealsClosed;
        this.createdAt = Instant.now();
        this.updatedAt = this.createdAt;
    }

    public void update(BigDecimal targetAmount, BigDecimal actualAmount, BigDecimal conversionRate,
                        int callsCount, int meetingsCount, int dealsClosed) {
        this.targetAmount = targetAmount;
        this.actualAmount = actualAmount;
        this.conversionRate = conversionRate;
        this.callsCount = callsCount;
        this.meetingsCount = meetingsCount;
        this.dealsClosed = dealsClosed;
        this.updatedAt = Instant.now();
    }

    public Long getId() { return id; }
    public Long getWorkspaceId() { return workspaceId; }
    public Long getUserId() { return userId; }
    public String getPeriod() { return period; }
    public BigDecimal getTargetAmount() { return targetAmount; }
    public BigDecimal getActualAmount() { return actualAmount; }
    public BigDecimal getConversionRate() { return conversionRate; }
    public int getCallsCount() { return callsCount; }
    public int getMeetingsCount() { return meetingsCount; }
    public int getDealsClosed() { return dealsClosed; }
    public Instant getCreatedAt() { return createdAt; }
    public Instant getUpdatedAt() { return updatedAt; }
}
