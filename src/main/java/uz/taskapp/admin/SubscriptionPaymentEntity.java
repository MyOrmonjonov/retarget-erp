package uz.taskapp.admin;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Table;

import java.math.BigDecimal;
import java.time.Instant;

@Entity
@Table(name = "subscription_payments")
public class SubscriptionPaymentEntity {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "workspace_id", nullable = false)
    private Long workspaceId;

    @Column(nullable = false, precision = 14, scale = 2)
    private BigDecimal amount;

    @Column(nullable = false, length = 8)
    private String currency;

    @Column(name = "plan_code", nullable = false, length = 32)
    private String planCode;

    @Column(name = "period_months", nullable = false)
    private int periodMonths;

    @Column(length = 500)
    private String note;

    @Column(name = "recorded_by_admin_id", nullable = false)
    private Long recordedByAdminId;

    @Column(name = "paid_at", nullable = false)
    private Instant paidAt;

    protected SubscriptionPaymentEntity() {
    }

    public SubscriptionPaymentEntity(Long workspaceId, BigDecimal amount, String currency, String planCode,
                                      int periodMonths, String note, Long recordedByAdminId) {
        this.workspaceId = workspaceId;
        this.amount = amount;
        this.currency = currency;
        this.planCode = planCode;
        this.periodMonths = periodMonths;
        this.note = note;
        this.recordedByAdminId = recordedByAdminId;
        this.paidAt = Instant.now();
    }

    public Long getId() { return id; }
    public Long getWorkspaceId() { return workspaceId; }
    public BigDecimal getAmount() { return amount; }
    public String getCurrency() { return currency; }
    public String getPlanCode() { return planCode; }
    public int getPeriodMonths() { return periodMonths; }
    public String getNote() { return note; }
    public Instant getPaidAt() { return paidAt; }
}
