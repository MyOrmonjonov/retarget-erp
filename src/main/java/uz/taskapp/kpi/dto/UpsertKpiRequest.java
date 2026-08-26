package uz.taskapp.kpi.dto;

import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Pattern;

import java.math.BigDecimal;

public record UpsertKpiRequest(
        @NotNull Long workspaceId,
        @NotNull Long userId,
        @NotBlank @Pattern(regexp = "\\d{4}-\\d{2}") String period,
        @NotNull BigDecimal target,
        @NotNull BigDecimal actual,
        @NotNull @Min(0) @Max(100) Integer score,
        @NotNull @Min(0) Integer tasksCompleted,
        @NotNull @Min(0) Integer tasksOnTime,
        @NotNull @Min(0) @Max(100) Integer qualityScore,
        @NotNull @Min(0) @Max(100) Integer collaborationScore
) {
}
