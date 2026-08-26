package uz.taskapp.attendance;

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
import java.time.LocalTime;

@Entity
@Table(name = "attendance_records")
public class AttendanceRecordEntity {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "workspace_id", nullable = false)
    private Long workspaceId;

    @Column(name = "user_id", nullable = false)
    private Long userId;

    @Column(nullable = false)
    private LocalDate date;

    @Column(name = "check_in")
    private LocalTime checkIn;

    @Column(name = "check_out")
    private LocalTime checkOut;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 24)
    private AttendanceStatus status;

    @Column
    private String notes;

    @Column(name = "created_at", nullable = false, updatable = false)
    private Instant createdAt;

    @Column(name = "updated_at", nullable = false)
    private Instant updatedAt;

    protected AttendanceRecordEntity() {
    }

    public AttendanceRecordEntity(Long workspaceId, Long userId, LocalDate date, LocalTime checkIn,
                                   LocalTime checkOut, AttendanceStatus status, String notes) {
        this.workspaceId = workspaceId;
        this.userId = userId;
        this.date = date;
        this.checkIn = checkIn;
        this.checkOut = checkOut;
        this.status = status;
        this.notes = notes;
        this.createdAt = Instant.now();
        this.updatedAt = this.createdAt;
    }

    public void update(LocalTime checkIn, LocalTime checkOut, AttendanceStatus status, String notes) {
        this.checkIn = checkIn;
        this.checkOut = checkOut;
        this.status = status;
        this.notes = notes;
        this.updatedAt = Instant.now();
    }

    public Long getId() { return id; }
    public Long getWorkspaceId() { return workspaceId; }
    public Long getUserId() { return userId; }
    public LocalDate getDate() { return date; }
    public LocalTime getCheckIn() { return checkIn; }
    public LocalTime getCheckOut() { return checkOut; }
    public AttendanceStatus getStatus() { return status; }
    public String getNotes() { return notes; }
    public Instant getCreatedAt() { return createdAt; }
    public Instant getUpdatedAt() { return updatedAt; }
}
