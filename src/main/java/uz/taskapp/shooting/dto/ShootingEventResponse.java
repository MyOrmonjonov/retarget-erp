package uz.taskapp.shooting.dto;

import uz.taskapp.shooting.ShootingEventEntity;
import uz.taskapp.shooting.ShootingEventStatus;
import uz.taskapp.shooting.ShootingEventType;

import java.time.Instant;
import java.time.LocalDate;
import java.time.LocalTime;
import java.util.List;

public record ShootingEventResponse(
        Long id,
        Long workspaceId,
        String title,
        LocalDate date,
        LocalTime startTime,
        LocalTime endTime,
        String location,
        ShootingEventType type,
        ShootingEventStatus status,
        List<Long> team,
        String description,
        Instant createdAt,
        Instant updatedAt
) {
    public static ShootingEventResponse from(ShootingEventEntity event, List<Long> team) {
        return new ShootingEventResponse(
                event.getId(),
                event.getWorkspaceId(),
                event.getTitle(),
                event.getDate(),
                event.getStartTime(),
                event.getEndTime(),
                event.getLocation(),
                event.getType(),
                event.getStatus(),
                team,
                event.getDescription(),
                event.getCreatedAt(),
                event.getUpdatedAt()
        );
    }
}
