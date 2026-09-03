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
import uz.taskapp.project.ProjectProgressCalculator;
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
    private final ProjectProgressCalculator progressCalculator;

    public DashboardService(JdbcTemplate jdbcTemplate, ProjectRepository projectRepository,
                             EmployeeProfileRepository employeeRepository, KpiRecordRepository kpiRepository,
                             UserRepository userRepository, WorkspaceMemberRepository memberRepository,
                             ProjectProgressCalculator progressCalculator) {
        this.jdbcTemplate = jdbcTemplate;
        this.projectRepository = projectRepository;
        this.employeeRepository = employeeRepository;
        this.kpiRepository = kpiRepository;
        this.userRepository = userRepository;
        this.memberRepository = memberRepository;
        this.progressCalculator = progressCalculator;
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
        int activeTasksTotal = count("SELECT COUNT(*) FROM tasks WHERE workspace_id = ? AND deleted_at IS NULL " +
                "AND status IN ('NEW','IN_PROGRESS','REVIEW')", workspaceId);
        int overdueTasksTotal = count("SELECT COUNT(*) FROM tasks WHERE workspace_id = ? AND deleted_at IS NULL " +
                "AND status NOT IN ('COMPLETED','CANCELLED') AND due_at IS NOT NULL AND due_at < now()", workspaceId);
        int reviewTasksTotal = count("SELECT COUNT(*) FROM tasks WHERE workspace_id = ? AND deleted_at IS NULL " +
                "AND status = 'REVIEW'", workspaceId);
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
        int motivationScore = computeMotivationScore(totalTasks, completedTasks, activeTasksTotal, overdueTasksTotal, reviewTasksTotal);

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

        List<ProjectEntity> recentProjects = projects.stream()
                .sorted((a, b) -> b.getUpdatedAt().compareTo(a.getUpdatedAt()))
                .limit(6)
                .toList();
        Map<Long, Integer> progressByProject = progressCalculator.computeProgress(
                recentProjects.stream().map(ProjectEntity::getId).toList());
        List<ProjectStatusDto> projectStatus = recentProjects.stream()
                .map(p -> {
                    UserEntity manager = p.getManagerId() == null ? null
                            : usersById.computeIfAbsent(p.getManagerId(), id -> userRepository.findById(id).orElse(null));
                    return new ProjectStatusDto(p.getId(), p.getName(), p.getClientName(), p.getStatus().name(),
                            progressByProject.getOrDefault(p.getId(), 0),
                            manager == null ? null : displayName(manager), manager == null ? null : manager.getPhotoUrl());
                })
                .toList();

        return new DashboardResponse(totalProjects, (int) activeProjects, totalTasks, completedTasks,
                employees.size(), pendingApprovals, motivationScore, teamLoad, topEmployee, projectStatus);
    }

    /** Per-employee load (not per-department - each person's own bar), sorted heaviest first.
     *  Each component is normalized against the team's own max for that metric, then weighted:
     *  active tasks 70% ("asosiy vazn"), overdue tasks 20% ("bosim"), project count 10% ("yengil
     *  ta'sir") - e.g. the single busiest person on active tasks scores the full 70 on that
     *  component even with just 1 active task, if nobody else has any. An employee with zero
     *  active/overdue/projects scores flat 0 rather than an undefined ratio. */
    private List<TeamLoadDto> buildTeamLoad(Long workspaceId, List<EmployeeProfileEntity> employees) {
        record RawLoad(EmployeeProfileEntity emp, UserEntity user, int activeTasks, int overdueTasks, int projectCount) {}

        List<RawLoad> raw = new ArrayList<>();
        for (EmployeeProfileEntity emp : employees) {
            Long userId = emp.getUserId();
            UserEntity user = userRepository.findById(userId).orElse(null);
            int activeTasks = count("SELECT COUNT(*) FROM task_assignees a JOIN tasks t ON t.id = a.task_id " +
                    "WHERE a.user_id = ? AND t.workspace_id = ? AND t.deleted_at IS NULL " +
                    "AND t.status NOT IN ('COMPLETED','CANCELLED')", userId, workspaceId);
            int overdueTasks = count("SELECT COUNT(*) FROM task_assignees a JOIN tasks t ON t.id = a.task_id " +
                    "WHERE a.user_id = ? AND t.workspace_id = ? AND t.deleted_at IS NULL " +
                    "AND t.status NOT IN ('COMPLETED','CANCELLED') AND t.due_at IS NOT NULL AND t.due_at < now()",
                    userId, workspaceId);
            int projectCount = (int) projectRepository.countByWorkspaceIdAndManagerId(workspaceId, userId);
            raw.add(new RawLoad(emp, user, activeTasks, overdueTasks, projectCount));
        }

        int maxActive = raw.stream().mapToInt(RawLoad::activeTasks).max().orElse(0);
        int maxOverdue = raw.stream().mapToInt(RawLoad::overdueTasks).max().orElse(0);
        int maxProjects = raw.stream().mapToInt(RawLoad::projectCount).max().orElse(0);

        List<TeamLoadDto> result = new ArrayList<>();
        for (RawLoad r : raw) {
            boolean hasWorkSignals = r.activeTasks() > 0 || r.overdueTasks() > 0 || r.projectCount() > 0;
            double activeScore = maxActive > 0 ? (r.activeTasks() / (double) maxActive) * 70 : 0;
            double overdueScore = maxOverdue > 0 ? (r.overdueTasks() / (double) maxOverdue) * 20 : 0;
            double projectScore = maxProjects > 0 ? (r.projectCount() / (double) maxProjects) * 10 : 0;
            int load = hasWorkSignals ? (int) Math.round(Math.min(100, activeScore + overdueScore + projectScore)) : 0;
            result.add(new TeamLoadDto(r.emp().getId(), r.user() == null ? "Foydalanuvchi" : displayName(r.user()),
                    r.user() == null ? null : r.user().getPhotoUrl(), load, r.activeTasks(), r.overdueTasks(), r.projectCount()));
        }
        result.sort((a, b) -> b.load() != a.load() ? Integer.compare(b.load(), a.load())
                : Integer.compare(b.activeTasks(), a.activeTasks()));
        return result;
    }

    /** Ported from the reference CRM's healthScore(): a workspace-wide task-health score, distinct
     *  from the user's still-unspecified 30/30/40 per-employee KPI formula (see KpiService). No
     *  task status here corresponds to their "approved" (Tasdiqlandi) sub-status, so that term is
     *  always 0 rather than invented - the other weights are otherwise unchanged from the original:
     *  completion rate carries the most weight, overdue rate pulls it down hardest, active/review
     *  rates nudge it up slightly. Floors at 12, caps at 100; an empty workspace defaults to 55. */
    private int computeMotivationScore(int totalTasks, int completedTasks, int activeTasks, int overdueTasks, int reviewTasks) {
        if (totalTasks == 0) return 55;
        double completionRate = completedTasks / (double) totalTasks;
        double activeRate = activeTasks / (double) totalTasks;
        double overdueRate = overdueTasks / (double) totalTasks;
        double reviewRate = reviewTasks / (double) totalTasks;
        double score = 35 + completionRate * 35 + activeRate * 6 + reviewRate * 4 - overdueRate * 30;
        return (int) Math.round(Math.min(100, Math.max(12, score)));
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

    public record TeamLoadDto(Long employeeId, String name, String avatar, int load, int activeTasks,
                               int overdueTasks, int projectCount) {
    }

    public record TopEmployeeDto(Long id, String name, String avatar, String position, int kpiScore,
                                  int completedTasks, int projectCount) {
    }

    public record ProjectStatusDto(Long id, String name, String client, String status, int progress,
                                    String managerName, String managerAvatar) {
    }
}
