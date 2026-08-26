package uz.taskapp.finance;

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
@Table(name = "payments")
public class PaymentEntity {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "workspace_id", nullable = false)
    private Long workspaceId;

    @Column(name = "invoice_id")
    private Long invoiceId;

    @Column(name = "client_id")
    private Long clientId;

    @Column(name = "client_name", nullable = false)
    private String clientName;

    @Column(nullable = false)
    private BigDecimal amount;

    @Column(nullable = false, length = 8)
    private String currency;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 24)
    private PaymentStatus status;

    @Column(name = "due_date", nullable = false)
    private LocalDate dueDate;

    @Column(name = "paid_date")
    private LocalDate paidDate;

    @Column
    private String method;

    @Column
    private String description;

    @Column(name = "created_at", nullable = false, updatable = false)
    private Instant createdAt;

    @Column(name = "updated_at", nullable = false)
    private Instant updatedAt;

    protected PaymentEntity() {
    }

    public PaymentEntity(Long workspaceId, Long invoiceId, Long clientId, String clientName, BigDecimal amount,
                          String currency, LocalDate dueDate, String method, String description) {
        this.workspaceId = workspaceId;
        this.invoiceId = invoiceId;
        this.clientId = clientId;
        this.clientName = clientName;
        this.amount = amount;
        this.currency = currency == null || currency.isBlank() ? "UZS" : currency;
        this.status = PaymentStatus.PENDING;
        this.dueDate = dueDate;
        this.method = method;
        this.description = description;
        this.createdAt = Instant.now();
        this.updatedAt = this.createdAt;
    }

    public void update(Long clientId, String clientName, BigDecimal amount, String currency, LocalDate dueDate,
                        String method, String description) {
        this.clientId = clientId;
        this.clientName = clientName;
        this.amount = amount;
        this.currency = currency == null || currency.isBlank() ? "UZS" : currency;
        this.dueDate = dueDate;
        this.method = method;
        this.description = description;
        this.updatedAt = Instant.now();
    }

    public void changeStatus(PaymentStatus status, LocalDate paidDate) {
        this.status = status;
        this.paidDate = paidDate;
        this.updatedAt = Instant.now();
    }

    public Long getId() { return id; }
    public Long getWorkspaceId() { return workspaceId; }
    public Long getInvoiceId() { return invoiceId; }
    public Long getClientId() { return clientId; }
    public String getClientName() { return clientName; }
    public BigDecimal getAmount() { return amount; }
    public String getCurrency() { return currency; }
    public PaymentStatus getStatus() { return status; }
    public LocalDate getDueDate() { return dueDate; }
    public LocalDate getPaidDate() { return paidDate; }
    public String getMethod() { return method; }
    public String getDescription() { return description; }
    public Instant getCreatedAt() { return createdAt; }
    public Instant getUpdatedAt() { return updatedAt; }
}
