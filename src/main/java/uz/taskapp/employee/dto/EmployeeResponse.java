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
        long activeTasks,
        long completedTasks,
        long overdueTasks,
        int workload,
        BigDecimal baseSalary,
        int kpiBase,
        Instant createdAt,
        Instant updatedAt
) {
    public static EmployeeResponse from(EmployeeProfileEntity profile, String fullName, String avatar,
                                         Integer kpiScore, long projectCount, long taskCount, long activeTasks,
                                         long completedTasks, long overdueTasks) {
        // Ported from the reference CRM's Team page: workload = clamp(active*18 + projects*10, 0, 100) -
        // a fixed-weight formula, distinct from Dashboard's team-load which normalizes against the team's
        // own max instead of fixed weights.
        int workload = (int) Math.min(100, Math.max(0, activeTasks * 18 + projectCount * 10));
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
                activeTasks,
                completedTasks,
                overdueTasks,
                workload,
                profile.getBaseSalary(),
                profile.getKpiBase(),
                profile.getCreatedAt(),
                profile.getUpdatedAt()
        );
    }
}
