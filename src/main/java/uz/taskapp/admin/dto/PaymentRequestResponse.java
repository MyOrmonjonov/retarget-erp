package uz.taskapp.admin.dto;

import uz.taskapp.admin.PaymentRequestEntity;

import java.math.BigDecimal;
import java.time.Instant;

public record PaymentRequestResponse(
        Long id,
        Long workspaceId,
        String workspaceName,
        String requestedByName,
        String planCode,
        int periodMonths,
        BigDecimal amount,
        String currency,
        String status,
        Instant createdAt,
        Instant decidedAt
) {
    public static PaymentRequestResponse from(PaymentRequestEntity entity, String workspaceName, String requestedByName) {
        return new PaymentRequestResponse(
                entity.getId(), entity.getWorkspaceId(), workspaceName, requestedByName,
                entity.getPlanCode(), entity.getPeriodMonths(), entity.getAmount(), entity.getCurrency(),
                entity.getStatus(), entity.getCreatedAt(), entity.getDecidedAt()
        );
    }
}
