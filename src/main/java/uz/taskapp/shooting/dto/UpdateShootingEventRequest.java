package uz.taskapp.shooting.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import uz.taskapp.shooting.ShootingEventType;

import java.time.LocalDate;
import java.time.LocalTime;
import java.util.List;

public record UpdateShootingEventRequest(
        Long projectId,
        @NotBlank String title,
        @NotNull LocalDate date,
        @NotNull LocalTime startTime,
        @NotNull LocalTime endTime,
        String location,
        @NotNull ShootingEventType type,
        String description,
        List<Long> team
) {
}
