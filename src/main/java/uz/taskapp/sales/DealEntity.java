package uz.taskapp.sales;

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
@Table(name = "deals")
public class DealEntity {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "workspace_id", nullable = false)
    private Long workspaceId;

    @Column(nullable = false, length = 300)
    private String title;

    @Column(nullable = false)
    private String client;

    @Column(nullable = false)
    private BigDecimal value;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 24)
    private DealStage stage;

    @Column(nullable = false)
    private int probability;

    @Column(name = "owner_id", nullable = false)
    private Long ownerId;

    @Column(name = "expected_close_date")
    private LocalDate expectedCloseDate;

    @Column
    private String description;

    @Column(name = "contact_person")
    private String contactPerson;

    @Column(name = "contact_phone")
    private String contactPhone;

    @Column(name = "contact_email")
    private String contactEmail;

    @Column(name = "created_at", nullable = false, updatable = false)
    private Instant createdAt;

    @Column(name = "updated_at", nullable = false)
    private Instant updatedAt;

    protected DealEntity() {
    }

    public DealEntity(Long workspaceId, String title, String client, BigDecimal value, int probability,
                       Long ownerId, LocalDate expectedCloseDate, String description, String contactPerson,
                       String contactPhone, String contactEmail) {
        this.workspaceId = workspaceId;
        this.title = title;
        this.client = client;
        this.value = value;
        this.stage = DealStage.LEAD;
        this.probability = probability;
        this.ownerId = ownerId;
        this.expectedCloseDate = expectedCloseDate;
        this.description = description;
        this.contactPerson = contactPerson;
        this.contactPhone = contactPhone;
        this.contactEmail = contactEmail;
        this.createdAt = Instant.now();
        this.updatedAt = this.createdAt;
    }

    public void update(String title, String client, BigDecimal value, int probability, Long ownerId,
                        LocalDate expectedCloseDate, String description, String contactPerson,
                        String contactPhone, String contactEmail) {
        this.title = title;
        this.client = client;
        this.value = value;
        this.probability = probability;
        this.ownerId = ownerId;
        this.expectedCloseDate = expectedCloseDate;
        this.description = description;
        this.contactPerson = contactPerson;
        this.contactPhone = contactPhone;
        this.contactEmail = contactEmail;
        this.updatedAt = Instant.now();
    }

    public void changeStage(DealStage stage) {
        this.stage = stage;
        this.updatedAt = Instant.now();
    }

    public Long getId() { return id; }
    public Long getWorkspaceId() { return workspaceId; }
    public String getTitle() { return title; }
    public String getClient() { return client; }
    public BigDecimal getValue() { return value; }
    public DealStage getStage() { return stage; }
    public int getProbability() { return probability; }
    public Long getOwnerId() { return ownerId; }
    public LocalDate getExpectedCloseDate() { return expectedCloseDate; }
    public String getDescription() { return description; }
    public String getContactPerson() { return contactPerson; }
    public String getContactPhone() { return contactPhone; }
    public String getContactEmail() { return contactEmail; }
    public Instant getCreatedAt() { return createdAt; }
    public Instant getUpdatedAt() { return updatedAt; }
}
