package uz.taskapp.employee.dto;

import jakarta.validation.constraints.NotNull;
import uz.taskapp.employee.OrgRole;

import java.time.LocalDate;

public record UpdateEmployeeRequest(
        @NotNull OrgRole orgRole,
        String department,
        String position,
        LocalDate hireDate,
        String email,
        String phone
) {
}
