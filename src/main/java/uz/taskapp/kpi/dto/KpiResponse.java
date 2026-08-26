package uz.taskapp.kpi.dto;

import uz.taskapp.kpi.KpiRecordEntity;

import java.math.BigDecimal;
import java.time.Instant;

public record KpiResponse(
        Long id,
        Long workspaceId,
        Long employeeId,
        String period,
        BigDecimal target,
        BigDecimal actual,
        int score,
        Metrics metrics,
        Instant createdAt,
        Instant updatedAt
) {
    public record Metrics(int tasksCompleted, int tasksOnTime, int qualityScore, int collaborationScore) {}

    public static KpiResponse from(KpiRecordEntity kpi) {
        return new KpiResponse(
                kpi.getId(),
                kpi.getWorkspaceId(),
                kpi.getUserId(),
                kpi.getPeriod(),
                kpi.getTarget(),
                kpi.getActual(),
                kpi.getScore(),
                new Metrics(kpi.getTasksCompleted(), kpi.getTasksOnTime(), kpi.getQualityScore(), kpi.getCollaborationScore()),
                kpi.getCreatedAt(),
                kpi.getUpdatedAt()
        );
    }
}
