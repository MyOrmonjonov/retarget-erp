package uz.taskapp.employee.dto;

import jakarta.validation.constraints.NotNull;
import uz.taskapp.employee.OrgRole;

import java.time.LocalDate;

public record CreateEmployeeRequest(
        @NotNull Long workspaceId,
        @NotNull Long userId,
        OrgRole orgRole,
        String department,
        String position,
        LocalDate hireDate,
        String email,
        String phone
) {
}
