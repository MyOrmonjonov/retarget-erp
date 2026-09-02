package uz.taskapp.project.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import uz.taskapp.project.ProjectPriority;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;

public record UpdateProjectRequest(
        @NotBlank String name,
        Long clientId,
        @NotBlank String clientName,
        String type,
        ProjectPriority priority,
        @NotNull Long managerId,
        LocalDate startDate,
        LocalDate deadline,
        BigDecimal budget,
        String description,
        List<Long> teamUserIds
) {
}
