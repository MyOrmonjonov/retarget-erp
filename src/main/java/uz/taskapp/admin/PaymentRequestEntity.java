package uz.taskapp.admin;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Table;

import java.math.BigDecimal;
import java.time.Instant;

/** A customer's "I've transferred the money" claim for a card-to-card payment - stays PENDING
 * until an admin confirms it (which extends the workspace's subscription, see
 * AdminPanelService#confirmPaymentRequest) or rejects it. There is no payment gateway behind
 * this: card transfers are verified by the admin checking their own bank statement. */
@Entity
@Table(name = "payment_requests")
public class PaymentRequestEntity {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "workspace_id", nullable = false)
    private Long workspaceId;

    @Column(name = "requested_by_user_id", nullable = false)
    private Long requestedByUserId;

    @Column(name = "plan_code", nullable = false, length = 32)
    private String planCode;

    @Column(name = "period_months", nullable = false)
    private int periodMonths;

    @Column(nullable = false, precision = 14, scale = 2)
    private BigDecimal amount;

    @Column(nullable = false, length = 8)
    private String currency;

    @Column(nullable = false, length = 16)
    private String status;

    @Column(name = "created_at", nullable = false, updatable = false)
    private Instant createdAt;

    @Column(name = "decided_at")
    private Instant decidedAt;

    @Column(name = "decided_by_admin_id")
    private Long decidedByAdminId;

    protected PaymentRequestEntity() {
    }

    public PaymentRequestEntity(Long workspaceId, Long requestedByUserId, String planCode, int periodMonths,
                                 BigDecimal amount, String currency) {
        this.workspaceId = workspaceId;
        this.requestedByUserId = requestedByUserId;
        this.planCode = planCode;
        this.periodMonths = periodMonths;
        this.amount = amount;
        this.currency = currency == null || currency.isBlank() ? "UZS" : currency;
        this.status = "PENDING";
        this.createdAt = Instant.now();
    }

    public void confirm(Long adminId) {
        this.status = "CONFIRMED";
        this.decidedAt = Instant.now();
        this.decidedByAdminId = adminId;
    }

    public void reject(Long adminId) {
        this.status = "REJECTED";
        this.decidedAt = Instant.now();
        this.decidedByAdminId = adminId;
    }

    public Long getId() { return id; }
    public Long getWorkspaceId() { return workspaceId; }
    public Long getRequestedByUserId() { return requestedByUserId; }
    public String getPlanCode() { return planCode; }
    public int getPeriodMonths() { return periodMonths; }
    public BigDecimal getAmount() { return amount; }
    public String getCurrency() { return currency; }
    public String getStatus() { return status; }
    public Instant getCreatedAt() { return createdAt; }
    public Instant getDecidedAt() { return decidedAt; }
}
