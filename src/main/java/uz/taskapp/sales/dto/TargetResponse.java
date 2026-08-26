package uz.taskapp.sales.dto;

import uz.taskapp.sales.TargetRecordEntity;

import java.math.BigDecimal;
import java.time.Instant;

public record TargetResponse(
        Long id,
        Long workspaceId,
        Long employeeId,
        String employeeName,
        String period,
        BigDecimal targetAmount,
        BigDecimal actualAmount,
        BigDecimal conversionRate,
        int callsCount,
        int meetingsCount,
        int dealsClosed,
        Instant createdAt,
        Instant updatedAt
) {
    public static TargetResponse from(TargetRecordEntity target, String employeeName) {
        return new TargetResponse(
                target.getId(),
                target.getWorkspaceId(),
                target.getUserId(),
                employeeName,
                target.getPeriod(),
                target.getTargetAmount(),
                target.getActualAmount(),
                target.getConversionRate(),
                target.getCallsCount(),
                target.getMeetingsCount(),
                target.getDealsClosed(),
                target.getCreatedAt(),
                target.getUpdatedAt()
        );
    }
}
