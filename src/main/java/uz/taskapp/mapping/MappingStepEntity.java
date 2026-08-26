package uz.taskapp.mapping;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import uz.taskapp.employee.OrgRole;

import java.time.Instant;

@Entity
@Table(name = "mapping_steps")
public class MappingStepEntity {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "flow_id", nullable = false)
    private Long flowId;

    @Column(nullable = false)
    private String name;

    @Column
    private String description;

    @Column(nullable = false)
    private int position;

    @Column
    private String department;

    @Enumerated(EnumType.STRING)
    @Column(name = "responsible_role", length = 32)
    private OrgRole responsibleRole;

    @Column(name = "estimated_days", nullable = false)
    private int estimatedDays;

    @Column(name = "created_at", nullable = false, updatable = false)
    private Instant createdAt;

    @Column(name = "updated_at", nullable = false)
    private Instant updatedAt;

    protected MappingStepEntity() {
    }

    public MappingStepEntity(Long flowId, String name, String description, int position, String department,
                              OrgRole responsibleRole, int estimatedDays) {
        this.flowId = flowId;
        this.name = name;
        this.description = description;
        this.position = position;
        this.department = department;
        this.responsibleRole = responsibleRole;
        this.estimatedDays = estimatedDays;
        this.createdAt = Instant.now();
        this.updatedAt = this.createdAt;
    }

    public Long getId() { return id; }
    public Long getFlowId() { return flowId; }
    public String getName() { return name; }
    public String getDescription() { return description; }
    public int getPosition() { return position; }
    public String getDepartment() { return department; }
    public OrgRole getResponsibleRole() { return responsibleRole; }
    public int getEstimatedDays() { return estimatedDays; }
    public Instant getCreatedAt() { return createdAt; }
    public Instant getUpdatedAt() { return updatedAt; }
}
