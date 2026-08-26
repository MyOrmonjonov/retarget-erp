package uz.taskapp.finance.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

import java.math.BigDecimal;
import java.time.LocalDate;

public record UpdatePaymentRequest(
        Long clientId,
        @NotBlank String clientName,
        @NotNull BigDecimal amount,
        String currency,
        @NotNull LocalDate dueDate,
        String method,
        String description
) {
}
