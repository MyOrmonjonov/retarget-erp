package uz.taskapp.project.dto;

import uz.taskapp.project.ProjectEntity;
import uz.taskapp.project.ProjectPriority;
import uz.taskapp.project.ProjectStatus;

import java.math.BigDecimal;
import java.time.Instant;
import java.time.LocalDate;
import java.util.List;

public record ProjectResponse(
        Long id,
        Long workspaceId,
        String name,
        String client,
        Long clientId,
        String type,
        ProjectStatus status,
        int progress,
        ProjectPriority priority,
        Long managerId,
        String managerName,
        String managerAvatar,
        List<TeamMemberDto> team,
        LocalDate deadline,
        LocalDate startDate,
        BigDecimal budget,
        String description,
        BigDecimal reportBudget,
        Integer reportLeads,
        BigDecimal reportCpl,
        Integer reportSales,
        BigDecimal reportRoi,
        Instant createdAt,
        Instant updatedAt
) {
    public static ProjectResponse from(ProjectEntity project, String managerName, String managerAvatar,
                                        List<TeamMemberDto> team) {
        return new ProjectResponse(
                project.getId(),
                project.getWorkspaceId(),
                project.getName(),
                project.getClientName(),
                project.getClientId(),
                project.getType(),
                project.getStatus(),
                project.getProgress(),
                project.getPriority(),
                project.getManagerId(),
                managerName,
                managerAvatar,
                team,
                project.getDeadline(),
                project.getStartDate(),
                project.getBudget(),
                project.getDescription(),
                project.getReportBudget(),
                project.getReportLeads(),
                project.getReportCpl(),
                project.getReportSales(),
                project.getReportRoi(),
                project.getCreatedAt(),
                project.getUpdatedAt()
        );
    }

    public record TeamMemberDto(Long userId, String name, String avatar) {
    }
}
