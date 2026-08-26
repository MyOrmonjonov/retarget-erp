package uz.taskapp.attendance.dto;

import jakarta.validation.constraints.NotNull;
import uz.taskapp.attendance.AttendanceStatus;

import java.time.LocalDate;
import java.time.LocalTime;

public record UpsertAttendanceRequest(
        @NotNull Long workspaceId,
        @NotNull Long userId,
        @NotNull LocalDate date,
        LocalTime checkIn,
        LocalTime checkOut,
        @NotNull AttendanceStatus status,
        String notes
) {
}
