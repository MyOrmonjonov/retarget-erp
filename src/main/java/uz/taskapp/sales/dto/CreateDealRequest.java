package uz.taskapp.sales.dto;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

import java.math.BigDecimal;
import java.time.LocalDate;

public record CreateDealRequest(
        @NotNull Long workspaceId,
        @NotBlank String title,
        @NotBlank String client,
        @NotNull BigDecimal value,
        @Min(0) @Max(100) int probability,
        @NotNull Long ownerId,
        LocalDate expectedCloseDate,
        String description,
        String contactPerson,
        String contactPhone,
        @Email String contactEmail
) {
}
