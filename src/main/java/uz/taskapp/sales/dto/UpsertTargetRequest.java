package uz.taskapp.sales.dto;

import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Pattern;

import java.math.BigDecimal;

public record UpsertTargetRequest(
        @NotNull Long workspaceId,
        @NotNull Long userId,
        @NotBlank @Pattern(regexp = "\\d{4}-\\d{2}") String period,
        @NotNull BigDecimal targetAmount,
        @NotNull BigDecimal actualAmount,
        @NotNull BigDecimal conversionRate,
        @Min(0) int callsCount,
        @Min(0) int meetingsCount,
        @Min(0) int dealsClosed
) {
}
