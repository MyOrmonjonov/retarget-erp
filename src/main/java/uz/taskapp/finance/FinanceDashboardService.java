package uz.taskapp.finance;

import org.springframework.http.HttpStatus;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import uz.taskapp.common.ApiException;
import uz.taskapp.employee.EmployeeProfileEntity;
import uz.taskapp.employee.EmployeeProfileRepository;
import uz.taskapp.project.ProjectEntity;
import uz.taskapp.project.ProjectRepository;
import uz.taskapp.project.ProjectStatus;
import uz.taskapp.user.UserEntity;
import uz.taskapp.user.UserRepository;
import uz.taskapp.workspace.WorkspaceMemberRepository;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.sql.Timestamp;
import java.time.LocalDate;
import java.time.YearMonth;
import java.time.ZoneOffset;
import java.util.ArrayList;
import java.util.List;

/**
 * Internal profit/salary view, ported from a reference CRM the user pointed at (see project memory) -
 * distinct from {@link InvoiceService}/{@link ExpenseService}, which are client-facing billing. Nothing
 * here has a server-side role check yet, matching the rest of this codebase (role gating happens on the
 * frontend) - do not treat that as settled; it's a pre-existing gap, not something introduced here.
 */
@Service
public class FinanceDashboardService {
    /** Matches the reference CRM's hardcoded INVESTOR_SHARE_RATIO/CEO_SHARE_RATIO - not yet configurable. */
    private static final BigDecimal INVESTOR_SHARE_RATIO = new BigDecimal("0.35");
    private static final BigDecimal CEO_SHARE_RATIO = new BigDecimal("0.65");

    private final JdbcTemplate jdbcTemplate;
    private final EmployeeProfileRepository employeeRepository;
    private final ProjectRepository projectRepository;
    private final UserRepository userRepository;
    private final WorkspaceMemberRepository memberRepository;

    public FinanceDashboardService(JdbcTemplate jdbcTemplate, EmployeeProfileRepository employeeRepository,
                                    ProjectRepository projectRepository, UserRepository userRepository,
                                    WorkspaceMemberRepository memberRepository) {
        this.jdbcTemplate = jdbcTemplate;
        this.employeeRepository = employeeRepository;
        this.projectRepository = projectRepository;
        this.userRepository = userRepository;
        this.memberRepository = memberRepository;
    }

    @Transactional(readOnly = true)
    public FinanceDashboardResponse compute(Long currentUserId, Long workspaceId, YearMonth month) {
        requireMembership(workspaceId, currentUserId);
        YearMonth targetMonth = month == null ? YearMonth.now() : month;
        LocalDate monthStart = targetMonth.atDay(1);
        LocalDate monthEndExclusive = targetMonth.plusMonths(1).atDay(1);
        Timestamp rangeStart = Timestamp.from(monthStart.atStartOfDay(ZoneOffset.UTC).toInstant());
        Timestamp rangeEnd = Timestamp.from(monthEndExclusive.atStartOfDay(ZoneOffset.UTC).toInstant());

        List<ProjectEntity> projects = projectRepository.findAllByWorkspaceId(workspaceId).stream()
                .filter(p -> p.getStatus() != ProjectStatus.CANCELLED)
                .toList();

        List<ProjectRevenueDto> projectRows = new ArrayList<>();
        BigDecimal totalRevenue = BigDecimal.ZERO;
        for (ProjectEntity project : projects) {
            BigDecimal revenue = project.getBudget() == null ? BigDecimal.ZERO : project.getBudget();
            totalRevenue = totalRevenue.add(revenue);
            UserEntity manager = project.getManagerId() == null ? null
                    : userRepository.findById(project.getManagerId()).orElse(null);
            projectRows.add(new ProjectRevenueDto(project.getId(), project.getName(), project.getClientName(),
                    revenue, manager == null ? null : displayName(manager), manager == null ? null : manager.getPhotoUrl()));
        }

        List<EmployeeProfileEntity> employees = employeeRepository.findAllByWorkspaceId(workspaceId);
        List<EmployeeFinanceDto> employeeRows = new ArrayList<>();
        BigDecimal totalSalaryExpense = BigDecimal.ZERO;
        for (EmployeeProfileEntity emp : employees) {
            Long userId = emp.getUserId();
            int assignedTasks = count("SELECT COUNT(*) FROM task_assignees a JOIN tasks t ON t.id = a.task_id " +
                    "WHERE a.user_id = ? AND t.workspace_id = ? AND t.deleted_at IS NULL AND t.status <> 'CANCELLED' " +
                    "AND t.due_at IS NOT NULL AND t.due_at >= ? AND t.due_at < ?",
                    userId, workspaceId, rangeStart, rangeEnd);
            int completedTasks = count("SELECT COUNT(*) FROM task_assignees a JOIN tasks t ON t.id = a.task_id " +
                    "WHERE a.user_id = ? AND t.workspace_id = ? AND t.deleted_at IS NULL AND t.status = 'COMPLETED' " +
                    "AND t.due_at IS NOT NULL AND t.due_at >= ? AND t.due_at < ?",
                    userId, workspaceId, rangeStart, rangeEnd);
            int kpi = assignedTasks == 0 ? emp.getKpiBase()
                    : (int) Math.min(100, Math.round(completedTasks / (double) assignedTasks * 100));
            BigDecimal baseSalary = emp.getBaseSalary() == null ? BigDecimal.ZERO : emp.getBaseSalary();
            BigDecimal calculatedSalary = baseSalary
                    .multiply(BigDecimal.valueOf(kpi))
                    .divide(BigDecimal.valueOf(100), 2, RoundingMode.HALF_UP);
            totalSalaryExpense = totalSalaryExpense.add(calculatedSalary);

            UserEntity user = userRepository.findById(userId).orElse(null);
            employeeRows.add(new EmployeeFinanceDto(emp.getId(), user == null ? "Foydalanuvchi" : displayName(user),
                    user == null ? null : user.getPhotoUrl(), kpi, baseSalary, calculatedSalary,
                    assignedTasks, completedTasks));
        }

        BigDecimal netProfit = totalRevenue.subtract(totalSalaryExpense).max(BigDecimal.ZERO);
        BigDecimal investorShare = netProfit.multiply(INVESTOR_SHARE_RATIO).setScale(2, RoundingMode.HALF_UP);
        BigDecimal ceoShare = netProfit.multiply(CEO_SHARE_RATIO).setScale(2, RoundingMode.HALF_UP);

        return new FinanceDashboardResponse(targetMonth.toString(), totalRevenue, totalSalaryExpense, netProfit,
                investorShare, ceoShare, projectRows, employeeRows);
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

    private void requireMembership(Long workspaceId, Long userId) {
        if (!memberRepository.existsByWorkspaceIdAndUserIdAndActiveTrueAndTemporarilyBlockedFalse(workspaceId, userId)) {
            throw new ApiException(HttpStatus.FORBIDDEN, "WORKSPACE_ACCESS_DENIED", "Ish maydoniga kirishga ruxsat yo'q");
        }
    }

    public record FinanceDashboardResponse(
            String month,
            BigDecimal totalRevenue,
            BigDecimal totalSalaryExpense,
            BigDecimal netProfit,
            BigDecimal investorShare,
            BigDecimal ceoShare,
            List<ProjectRevenueDto> projects,
            List<EmployeeFinanceDto> employees) {
    }

    public record ProjectRevenueDto(Long id, String name, String client, BigDecimal revenue,
                                     String managerName, String managerAvatar) {
    }

    public record EmployeeFinanceDto(Long employeeId, String name, String avatar, int kpi, BigDecimal baseSalary,
                                      BigDecimal calculatedSalary, int assignedTasks, int completedTasks) {
    }
}
