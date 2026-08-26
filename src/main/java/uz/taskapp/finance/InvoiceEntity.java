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
@Table(name = "invoices")
public class InvoiceEntity {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "workspace_id", nullable = false)
    private Long workspaceId;

    @Column(nullable = false, length = 40)
    private String number;

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
    private InvoiceStatus status;

    @Column(name = "issue_date", nullable = false)
    private LocalDate issueDate;

    @Column(name = "due_date", nullable = false)
    private LocalDate dueDate;

    @Column
    private String notes;

    @Column(name = "created_at", nullable = false, updatable = false)
    private Instant createdAt;

    @Column(name = "updated_at", nullable = false)
    private Instant updatedAt;

    protected InvoiceEntity() {
    }

    public InvoiceEntity(Long workspaceId, String number, Long clientId, String clientName, BigDecimal amount,
                          String currency, LocalDate issueDate, LocalDate dueDate, String notes) {
        this.workspaceId = workspaceId;
        this.number = number;
        this.clientId = clientId;
        this.clientName = clientName;
        this.amount = amount;
        this.currency = currency == null || currency.isBlank() ? "UZS" : currency;
        this.status = InvoiceStatus.DRAFT;
        this.issueDate = issueDate;
        this.dueDate = dueDate;
        this.notes = notes;
        this.createdAt = Instant.now();
        this.updatedAt = this.createdAt;
    }

    public void assignNumber(String number) {
        this.number = number;
    }

    public void update(Long clientId, String clientName, BigDecimal amount, String currency, LocalDate issueDate,
                        LocalDate dueDate, String notes) {
        this.clientId = clientId;
        this.clientName = clientName;
        this.amount = amount;
        this.currency = currency == null || currency.isBlank() ? "UZS" : currency;
        this.issueDate = issueDate;
        this.dueDate = dueDate;
        this.notes = notes;
        this.updatedAt = Instant.now();
    }

    public void changeStatus(InvoiceStatus status) {
        this.status = status;
        this.updatedAt = Instant.now();
    }

    public Long getId() { return id; }
    public Long getWorkspaceId() { return workspaceId; }
    public String getNumber() { return number; }
    public Long getClientId() { return clientId; }
    public String getClientName() { return clientName; }
    public BigDecimal getAmount() { return amount; }
    public String getCurrency() { return currency; }
    public InvoiceStatus getStatus() { return status; }
    public LocalDate getIssueDate() { return issueDate; }
    public LocalDate getDueDate() { return dueDate; }
    public String getNotes() { return notes; }
    public Instant getCreatedAt() { return createdAt; }
    public Instant getUpdatedAt() { return updatedAt; }
}
