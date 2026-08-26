package uz.taskapp.mapping.dto;

import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import uz.taskapp.employee.OrgRole;

import java.util.List;

public record StepInput(
        @NotBlank String name,
        String description,
        String department,
        OrgRole responsibleRole,
        @Min(0) int estimatedDays,
        List<Integer> dependencyIndexes
) {
}
