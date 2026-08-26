package uz.taskapp.attendance.dto;

import uz.taskapp.attendance.AttendanceRecordEntity;
import uz.taskapp.attendance.AttendanceStatus;

import java.time.Instant;
import java.time.LocalDate;
import java.time.LocalTime;

public record AttendanceResponse(
        Long id,
        Long workspaceId,
        Long employeeId,
        LocalDate date,
        LocalTime checkIn,
        LocalTime checkOut,
        AttendanceStatus status,
        String notes,
        Instant createdAt,
        Instant updatedAt
) {
    public static AttendanceResponse from(AttendanceRecordEntity record) {
        return new AttendanceResponse(
                record.getId(),
                record.getWorkspaceId(),
                record.getUserId(),
                record.getDate(),
                record.getCheckIn(),
                record.getCheckOut(),
                record.getStatus(),
                record.getNotes(),
                record.getCreatedAt(),
                record.getUpdatedAt()
        );
    }
}
