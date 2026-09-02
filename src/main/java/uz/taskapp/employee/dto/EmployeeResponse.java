package uz.taskapp.employee.dto;

import uz.taskapp.employee.EmployeeProfileEntity;
import uz.taskapp.employee.EmployeeStatus;
import uz.taskapp.employee.OrgRole;

import java.math.BigDecimal;
import java.time.Instant;
import java.time.LocalDate;

public record EmployeeResponse(
        Long id,
        Long workspaceId,
        Long userId,
        String fullName,
        String email,
        String phone,
        String avatar,
        OrgRole role,
        String department,
        String position,
        EmployeeStatus status,
        LocalDate hireDate,
        Integer kpiScore,
        long projectCount,
        long taskCount,
        long completedTasks,
        long overdueTasks,
        BigDecimal baseSalary,
        Instant createdAt,
        Instant updatedAt
) {
    public static EmployeeResponse from(EmployeeProfileEntity profile, String fullName, String avatar,
                                         Integer kpiScore, long projectCount, long taskCount,
                                         long completedTasks, long overdueTasks) {
        return new EmployeeResponse(
                profile.getId(),
                profile.getWorkspaceId(),
                profile.getUserId(),
                fullName,
                profile.getEmail(),
                profile.getPhone(),
                avatar,
                profile.getOrgRole(),
                profile.getDepartment(),
                profile.getPosition(),
                profile.getStatus(),
                profile.getHireDate(),
                kpiScore,
                projectCount,
                taskCount,
                completedTasks,
                overdueTasks,
                profile.getBaseSalary(),
                profile.getCreatedAt(),
                profile.getUpdatedAt()
        );
    }
}
