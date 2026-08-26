package uz.taskapp.employee;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Table;

import java.time.Instant;
import java.time.LocalDate;

@Entity
@Table(name = "employee_profiles")
public class EmployeeProfileEntity {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "workspace_id", nullable = false)
    private Long workspaceId;

    @Column(name = "user_id", nullable = false)
    private Long userId;

    @Enumerated(EnumType.STRING)
    @Column(name = "org_role", nullable = false, length = 32)
    private OrgRole orgRole;

    @Column
    private String department;

    @Column
    private String position;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 24)
    private EmployeeStatus status;

    @Column(name = "hire_date")
    private LocalDate hireDate;

    @Column
    private String email;

    @Column
    private String phone;

    @Column(name = "created_at", nullable = false, updatable = false)
    private Instant createdAt;

    @Column(name = "updated_at", nullable = false)
    private Instant updatedAt;

    protected EmployeeProfileEntity() {
    }

    public EmployeeProfileEntity(Long workspaceId, Long userId, OrgRole orgRole, String department,
                                  String position, LocalDate hireDate, String email, String phone) {
        this.workspaceId = workspaceId;
        this.userId = userId;
        this.orgRole = orgRole == null ? OrgRole.HODIM : orgRole;
        this.department = department;
        this.position = position;
        this.status = EmployeeStatus.ACTIVE;
        this.hireDate = hireDate;
        this.email = email;
        this.phone = phone;
        this.createdAt = Instant.now();
        this.updatedAt = this.createdAt;
    }

    public void update(OrgRole orgRole, String department, String position, LocalDate hireDate,
                        String email, String phone) {
        this.orgRole = orgRole;
        this.department = department;
        this.position = position;
        this.hireDate = hireDate;
        this.email = email;
        this.phone = phone;
        this.updatedAt = Instant.now();
    }

    public void changeStatus(EmployeeStatus status) {
        this.status = status;
        this.updatedAt = Instant.now();
    }

    public Long getId() { return id; }
    public Long getWorkspaceId() { return workspaceId; }
    public Long getUserId() { return userId; }
    public OrgRole getOrgRole() { return orgRole; }
    public String getDepartment() { return department; }
    public String getPosition() { return position; }
    public EmployeeStatus getStatus() { return status; }
    public LocalDate getHireDate() { return hireDate; }
    public String getEmail() { return email; }
    public String getPhone() { return phone; }
    public Instant getCreatedAt() { return createdAt; }
    public Instant getUpdatedAt() { return updatedAt; }
}
