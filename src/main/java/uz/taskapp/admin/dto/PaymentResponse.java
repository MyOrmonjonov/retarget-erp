package uz.taskapp.admin.dto;

import uz.taskapp.admin.SubscriptionPaymentEntity;

import java.math.BigDecimal;
import java.time.Instant;

public record PaymentResponse(
        Long id,
        Long workspaceId,
        String workspaceName,
        BigDecimal amount,
        String currency,
        String planCode,
        int periodMonths,
        String note,
        Instant paidAt
) {
    public static PaymentResponse from(SubscriptionPaymentEntity payment, String workspaceName) {
        return new PaymentResponse(payment.getId(), payment.getWorkspaceId(), workspaceName, payment.getAmount(),
                payment.getCurrency(), payment.getPlanCode(), payment.getPeriodMonths(), payment.getNote(), payment.getPaidAt());
    }
}
