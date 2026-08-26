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
@Table(name = "expenses")
public class ExpenseEntity {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "workspace_id", nullable = false)
    private Long workspaceId;

    @Column(nullable = false)
    private String title;

    @Column(nullable = false)
    private BigDecimal amount;

    @Column(nullable = false, length = 8)
    private String currency;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 24)
    private ExpenseCategory category;

    @Column(nullable = false)
    private LocalDate date;

    @Column
    private String description;

    @Column(name = "receipt_url")
    private String receiptUrl;

    @Column(name = "approved_by")
    private Long approvedBy;

    @Column(name = "approved_at")
    private Instant approvedAt;

    @Column(name = "created_at", nullable = false, updatable = false)
    private Instant createdAt;

    @Column(name = "updated_at", nullable = false)
    private Instant updatedAt;

    protected ExpenseEntity() {
    }

    public ExpenseEntity(Long workspaceId, String title, BigDecimal amount, String currency,
                          ExpenseCategory category, LocalDate date, String description, String receiptUrl) {
        this.workspaceId = workspaceId;
        this.title = title;
        this.amount = amount;
        this.currency = currency == null || currency.isBlank() ? "UZS" : currency;
        this.category = category;
        this.date = date;
        this.description = description;
        this.receiptUrl = receiptUrl;
        this.createdAt = Instant.now();
        this.updatedAt = this.createdAt;
    }

    public void update(String title, BigDecimal amount, String currency, ExpenseCategory category, LocalDate date,
                        String description, String receiptUrl) {
        this.title = title;
        this.amount = amount;
        this.currency = currency == null || currency.isBlank() ? "UZS" : currency;
        this.category = category;
        this.date = date;
        this.description = description;
        this.receiptUrl = receiptUrl;
        this.updatedAt = Instant.now();
    }

    public void approve(Long approvedBy) {
        this.approvedBy = approvedBy;
        this.approvedAt = Instant.now();
        this.updatedAt = Instant.now();
    }

    public Long getId() { return id; }
    public Long getWorkspaceId() { return workspaceId; }
    public String getTitle() { return title; }
    public BigDecimal getAmount() { return amount; }
    public String getCurrency() { return currency; }
    public ExpenseCategory getCategory() { return category; }
    public LocalDate getDate() { return date; }
    public String getDescription() { return description; }
    public String getReceiptUrl() { return receiptUrl; }
    public Long getApprovedBy() { return approvedBy; }
    public Instant getApprovedAt() { return approvedAt; }
    public Instant getCreatedAt() { return createdAt; }
    public Instant getUpdatedAt() { return updatedAt; }
}
