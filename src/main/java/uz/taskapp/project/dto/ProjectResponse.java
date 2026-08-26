package uz.taskapp.project.dto;

import uz.taskapp.project.ProjectEntity;
import uz.taskapp.project.ProjectStatus;

import java.math.BigDecimal;
import java.time.Instant;
import java.time.LocalDate;

public record ProjectResponse(
        Long id,
        Long workspaceId,
        String name,
        String client,
        Long clientId,
        String type,
        ProjectStatus status,
        int progress,
        Long managerId,
        String managerName,
        LocalDate deadline,
        LocalDate startDate,
        BigDecimal budget,
        String description,
        Instant createdAt,
        Instant updatedAt
) {
    public static ProjectResponse from(ProjectEntity project, String managerName) {
        return new ProjectResponse(
                project.getId(),
                project.getWorkspaceId(),
                project.getName(),
                project.getClientName(),
                project.getClientId(),
                project.getType(),
                project.getStatus(),
                project.getProgress(),
                project.getManagerId(),
                managerName,
                project.getDeadline(),
                project.getStartDate(),
                project.getBudget(),
                project.getDescription(),
                project.getCreatedAt(),
                project.getUpdatedAt()
        );
    }
}
