package uz.taskapp.finance.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import uz.taskapp.finance.ExpenseCategory;

import java.math.BigDecimal;
import java.time.LocalDate;

public record UpdateExpenseRequest(
        @NotBlank String title,
        @NotNull BigDecimal amount,
        String currency,
        @NotNull ExpenseCategory category,
        @NotNull LocalDate date,
        String description,
        String receiptUrl
) {
}
