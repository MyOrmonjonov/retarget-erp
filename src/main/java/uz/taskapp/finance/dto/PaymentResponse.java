package uz.taskapp.finance.dto;

import uz.taskapp.finance.PaymentEntity;
import uz.taskapp.finance.PaymentStatus;

import java.math.BigDecimal;
import java.time.Instant;
import java.time.LocalDate;

public record PaymentResponse(
        Long id,
        Long workspaceId,
        Long invoiceId,
        Long clientId,
        String clientName,
        BigDecimal amount,
        String currency,
        PaymentStatus status,
        LocalDate dueDate,
        LocalDate paidDate,
        String method,
        String description,
        Instant createdAt,
        Instant updatedAt
) {
    public static PaymentResponse from(PaymentEntity payment) {
        return new PaymentResponse(
                payment.getId(),
                payment.getWorkspaceId(),
                payment.getInvoiceId(),
                payment.getClientId(),
                payment.getClientName(),
                payment.getAmount(),
                payment.getCurrency(),
                payment.getStatus(),
                payment.getDueDate(),
                payment.getPaidDate(),
                payment.getMethod(),
                payment.getDescription(),
                payment.getCreatedAt(),
                payment.getUpdatedAt()
        );
    }
}
