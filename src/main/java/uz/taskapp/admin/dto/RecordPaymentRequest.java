package uz.taskapp.admin.dto;

import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;

import java.math.BigDecimal;

public record RecordPaymentRequest(
        @NotNull @Positive BigDecimal amount,
        String currency,
        @NotBlank String planCode,
        @Min(1) int periodMonths,
        String note
) {
}
