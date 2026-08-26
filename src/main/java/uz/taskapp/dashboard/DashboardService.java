package uz.taskapp.dashboard;

import org.springframework.http.HttpStatus;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import uz.taskapp.common.ApiException;
import uz.taskapp.employee.EmployeeProfileEntity;
import uz.taskapp.employee.EmployeeProfileRepository;
import uz.taskapp.kpi.KpiRecordRepository;
import uz.taskapp.project.ProjectEntity;
import uz.taskapp.project.ProjectRepository;
import uz.taskapp.project.ProjectStatus;
import uz.taskapp.user.UserEntity;
import uz.taskapp.user.UserRepository;
import uz.taskapp.workspace.WorkspaceMemberRepository;

import java.util.ArrayList;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;

/**
 * Aggregates Project/Task/Employee/Expense data for the retarget-erp Dashboard page.
 * No single existing endpoint covers this shape (TaskApp's own StatisticsService is
 * entirely task-focused), so this composes fresh queries across the Phase 2 modules.
 */
@Service
public class DashboardService {
    private final JdbcTemplate jdbcTemplate;
    private final ProjectRepository projectRepository;
    private final EmployeeProfileRepository employeeRepository;
    private final KpiRecordRepository kpiRepository;
    private final UserRepository userRepository;
    private final WorkspaceMemberRepository memberRepository;

    public DashboardService(JdbcTemplate jdbcTemplate, ProjectRepository projectRepository,
                             EmployeeProfileRepository employeeRepository, KpiRecordRepository kpiRepository,
                             UserRepository userRepository, WorkspaceMemberRepository memberRepository) {
        this.jdbcTemplate = jdbcTemplate;
        this.projectRepository = projectRepository;
        this.employeeRepository = employeeRepository;
        this.kpiRepository = kpiRepository;
        this.userRepository = userRepository;
        this.memberRepository = memberRepository;
    }

    @Transactional(readOnly = true)
    public DashboardResponse compute(Long currentUserId, Long workspaceId) {
        if (!memberRepository.existsByWorkspaceIdAndUserIdAndActiveTrueAndTemporarilyBlockedFalse(workspaceId, currentUserId)) {
            throw new ApiException(HttpStatus.FORBIDDEN, "WORKSPACE_ACCESS_DENIED", "Ish maydoniga kirishga ruxsat yo'q");
        }

        List<ProjectEntity> projects = projectRepository.findAllByWorkspaceId(workspaceId);
        int totalProjects = projects.size();
        long activeProjects = projects.stream().filter(p -> p.getStatus() == ProjectStatus.ACTIVE).count();

        int totalTasks = count("SELECT COUNT(*) FROM tasks WHERE workspace_id = ? AND deleted_at IS NULL", workspaceId);
        int completedTasks = count("SELECT COUNT(*) FROM tasks WHERE workspace_id = ? AND deleted_at IS NULL " +
                "AND status = 'COMPLETED'", workspaceId);
        int pendingApprovals = count("SELECT COUNT(*) FROM expenses WHERE workspace_id = ? AND approved_at IS NULL", workspaceId);

        List<EmployeeProfileEntity> employees = employeeRepository.findAllByWorkspaceId(workspaceId);
        Map<Long, UserEntity> usersById = new LinkedHashMap<>();
        for (EmployeeProfileEntity emp : employees) {
            userRepository.findById(emp.getUserId()).ifPresent(u -> usersById.put(emp.getUserId(), u));
        }
        Map<Long, Integer> kpiScoreByUser = new LinkedHashMap<>();
        for (EmployeeProfileEntity emp : employees) {
            kpiRepository.findFirstByWorkspaceIdAndUserIdOrderByPeriodDesc(workspaceId, emp.getUserId())
                    .ifPresent(kpi -> kpiScoreByUser.put(emp.getUserId(), kpi.getScore()));
        }
        int motivationScore = kpiScoreByUser.isEmpty() ? 0
                : (int) Math.round(kpiScoreByUser.values().stream().mapToInt(Integer::intValue).average().orElse(0));

        TopEmployeeDto topEmployee = employees.stream()
                .max((a, b) -> Integer.compare(
                        kpiScoreByUser.getOrDefault(a.getUserId(), 0),
                        kpiScoreByUser.getOrDefault(b.getUserId(), 0)))
                .map(emp -> {
                    UserEntity user = usersById.get(emp.getUserId());
                    int completed = count("SELECT COUNT(*) FROM task_assignees a JOIN tasks t ON t.id = a.task_id " +
                            "WHERE a.user_id = ? AND t.workspace_id = ? AND t.deleted_at IS NULL AND t.status = 'COMPLETED'",
                            emp.getUserId(), workspaceId);
                    long projectCount = projectRepository.countByWorkspaceIdAndManagerId(workspaceId, emp.getUserId());
                    return new TopEmployeeDto(emp.getId(), user == null ? "Foydalanuvchi" : displayName(user),
                            user == null ? null : user.getPhotoUrl(), emp.getPosition(),
                            kpiScoreByUser.getOrDefault(emp.getUserId(), 0), completed, (int) projectCount);
                })
                .orElse(null);

        List<TeamLoadDto> teamLoad = buildTeamLoad(workspaceId, employees);

        List<ProjectStatusDto> projectStatus = projects.stream()
                .sorted((a, b) -> b.getUpdatedAt().compareTo(a.getUpdatedAt()))
                .limit(6)
                .map(p -> new ProjectStatusDto(p.getId(), p.getName(), p.getClientName(), p.getStatus().name(), p.getProgress()))
                .toList();

        return new DashboardResponse(totalProjects, (int) activeProjects, totalTasks, completedTasks,
                employees.size(), pendingApprovals, motivationScore, teamLoad, topEmployee, projectStatus);
    }

    /** Load% per department = active (non-completed) task assignments per employee, treating 5 active
     *  tasks/employee as "full load" (100%) - a documented heuristic, tune once real usage data exists. */
    private List<TeamLoadDto> buildTeamLoad(Long workspaceId, List<EmployeeProfileEntity> employees) {
        Map<String, List<Long>> userIdsByDept = new LinkedHashMap<>();
        for (EmployeeProfileEntity emp : employees) {
            String dept = emp.getDepartment() == null || emp.getDepartment().isBlank() ? "Boshqa" : emp.getDepartment();
            userIdsByDept.computeIfAbsent(dept, d -> new ArrayList<>()).add(emp.getUserId());
        }
        List<TeamLoadDto> result = new ArrayList<>();
        userIdsByDept.forEach((department, userIds) -> {
            int activeTasks = 0;
            for (Long userId : userIds) {
                activeTasks += count("SELECT COUNT(*) FROM task_assignees a JOIN tasks t ON t.id = a.task_id " +
                        "WHERE a.user_id = ? AND t.workspace_id = ? AND t.deleted_at IS NULL " +
                        "AND t.status NOT IN ('COMPLETED','CANCELLED')", userId, workspaceId);
            }
            double avgActive = userIds.isEmpty() ? 0 : activeTasks / (double) userIds.size();
            int load = (int) Math.min(100, Math.round(avgActive / 5.0 * 100));
            result.add(new TeamLoadDto(department, load, userIds.size()));
        });
        return result;
    }

    private String displayName(UserEntity user) {
        return user.getLastName() == null || user.getLastName().isBlank()
                ? user.getFirstName()
                : user.getFirstName() + " " + user.getLastName();
    }

    private int count(String sql, Object... args) {
        Integer value = jdbcTemplate.queryForObject(sql, Integer.class, args);
        return value == null ? 0 : value;
    }

    public record DashboardResponse(
            int totalProjects,
            int activeProjects,
            int totalTasks,
            int completedTasks,
            int totalEmployees,
            int pendingApprovals,
            int motivationScore,
            List<TeamLoadDto> teamLoad,
            TopEmployeeDto topEmployee,
            List<ProjectStatusDto> projectStatus) {
    }

    public record TeamLoadDto(String department, int load, int employeeCount) {
    }

    public record TopEmployeeDto(Long id, String name, String avatar, String position, int kpiScore,
                                  int completedTasks, int projectCount) {
    }

    public record ProjectStatusDto(Long id, String name, String client, String status, int progress) {
    }
}
