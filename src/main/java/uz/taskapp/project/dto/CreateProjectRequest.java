package uz.taskapp.project.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

import java.math.BigDecimal;
import java.time.LocalDate;

public record CreateProjectRequest(
        @NotNull Long workspaceId,
        @NotBlank String name,
        Long clientId,
        @NotBlank String clientName,
        String type,
        @NotNull Long managerId,
        LocalDate startDate,
        LocalDate deadline,
        BigDecimal budget,
        String description
) {
}
