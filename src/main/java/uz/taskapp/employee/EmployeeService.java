package uz.taskapp.employee;

import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import uz.taskapp.common.ApiException;
import uz.taskapp.employee.dto.CreateEmployeeRequest;
import uz.taskapp.employee.dto.EmployeeResponse;
import uz.taskapp.employee.dto.UpdateEmployeeRequest;
import uz.taskapp.kpi.KpiRecordRepository;
import uz.taskapp.project.ProjectEntity;
import uz.taskapp.project.ProjectMemberRepository;
import uz.taskapp.project.ProjectRepository;
import uz.taskapp.task.TaskAssigneeRepository;
import uz.taskapp.task.TaskEntity;
import uz.taskapp.task.TaskRepository;
import uz.taskapp.task.TaskStatus;
import uz.taskapp.user.UserEntity;
import uz.taskapp.user.UserRepository;
import uz.taskapp.workspace.WorkspaceMemberEntity;
import uz.taskapp.workspace.WorkspaceMemberRepository;

import java.math.BigDecimal;
import java.time.Instant;
import java.util.List;

@Service
public class EmployeeService {
    private final EmployeeProfileRepository employeeRepository;
    private final WorkspaceMemberRepository memberRepository;
    private final UserRepository userRepository;
    private final KpiRecordRepository kpiRepository;
    private final TaskAssigneeRepository taskAssigneeRepository;
    private final TaskRepository taskRepository;
    private final ProjectRepository projectRepository;
    private final ProjectMemberRepository projectMemberRepository;

    public EmployeeService(EmployeeProfileRepository employeeRepository, WorkspaceMemberRepository memberRepository,
                            UserRepository userRepository, KpiRecordRepository kpiRepository,
                            TaskAssigneeRepository taskAssigneeRepository, TaskRepository taskRepository,
                            ProjectRepository projectRepository, ProjectMemberRepository projectMemberRepository) {
        this.employeeRepository = employeeRepository;
        this.memberRepository = memberRepository;
        this.userRepository = userRepository;
        this.kpiRepository = kpiRepository;
        this.taskAssigneeRepository = taskAssigneeRepository;
        this.taskRepository = taskRepository;
        this.projectRepository = projectRepository;
        this.projectMemberRepository = projectMemberRepository;
    }

    @Transactional(readOnly = true)
    public List<EmployeeResponse> list(Long currentUserId, Long workspaceId) {
        requireMembership(workspaceId, currentUserId);
        boolean financeAccess = hasFinanceAccess(workspaceId, currentUserId);
        return employeeRepository.findAllByWorkspaceId(workspaceId).stream()
                .map(profile -> toResponse(workspaceId, profile, financeAccess))
                .toList();
    }

    @Transactional(readOnly = true)
    public EmployeeResponse detail(Long currentUserId, Long workspaceId, Long employeeId) {
        requireMembership(workspaceId, currentUserId);
        boolean financeAccess = hasFinanceAccess(workspaceId, currentUserId);
        return toResponse(workspaceId, findWithinWorkspace(employeeId, workspaceId), financeAccess);
    }

    @Transactional
    public EmployeeResponse create(Long currentUserId, CreateEmployeeRequest request) {
        requireMembership(request.workspaceId(), currentUserId);
        requireMembership(request.workspaceId(), request.userId());
        if (employeeRepository.existsByWorkspaceIdAndUserId(request.workspaceId(), request.userId())) {
            throw new ApiException(HttpStatus.CONFLICT, "EMPLOYEE_PROFILE_EXISTS",
                    "Bu foydalanuvchi uchun xodim profili allaqachon mavjud");
        }
        EmployeeProfileEntity profile = new EmployeeProfileEntity(request.workspaceId(), request.userId(),
                request.orgRole(), request.department(), request.position(), request.hireDate(),
                request.email(), request.phone());
        profile = employeeRepository.save(profile);
        return toResponse(request.workspaceId(), profile, hasFinanceAccess(request.workspaceId(), currentUserId));
    }

    @Transactional
    public EmployeeResponse update(Long currentUserId, Long workspaceId, Long employeeId, UpdateEmployeeRequest request) {
        requireMembership(workspaceId, currentUserId);
        EmployeeProfileEntity profile = findWithinWorkspace(employeeId, workspaceId);
        profile.update(request.orgRole(), request.department(), request.position(), request.hireDate(),
                request.email(), request.phone());
        return toResponse(workspaceId, profile, hasFinanceAccess(workspaceId, currentUserId));
    }

    @Transactional
    public EmployeeResponse changeStatus(Long currentUserId, Long workspaceId, Long employeeId, EmployeeStatus status) {
        requireMembership(workspaceId, currentUserId);
        EmployeeProfileEntity profile = findWithinWorkspace(employeeId, workspaceId);
        profile.changeStatus(status);
        return toResponse(workspaceId, profile, hasFinanceAccess(workspaceId, currentUserId));
    }

    @Transactional
    public EmployeeResponse updateSalary(Long currentUserId, Long workspaceId, Long employeeId, BigDecimal baseSalary) {
        requireFinanceAccess(workspaceId, currentUserId);
        EmployeeProfileEntity profile = findWithinWorkspace(employeeId, workspaceId);
        profile.updateSalary(baseSalary);
        return toResponse(workspaceId, profile, true);
    }

    @Transactional
    public EmployeeResponse updateKpiBase(Long currentUserId, Long workspaceId, Long employeeId, int kpiBase) {
        requireFinanceAccess(workspaceId, currentUserId);
        EmployeeProfileEntity profile = findWithinWorkspace(employeeId, workspaceId);
        profile.updateKpiBase(kpiBase);
        return toResponse(workspaceId, profile, true);
    }

    @Transactional
    public void delete(Long currentUserId, Long workspaceId, Long employeeId) {
        requireMembership(workspaceId, currentUserId);
        employeeRepository.delete(findWithinWorkspace(employeeId, workspaceId));
    }

    private EmployeeResponse toResponse(Long workspaceId, EmployeeProfileEntity profile, boolean financeAccess) {
        UserEntity user = userRepository.findById(profile.getUserId()).orElse(null);
        String fullName = user == null ? "Noma'lum" : displayName(user);
        String avatar = user == null ? null : user.getPhotoUrl();

        Integer kpiScore = kpiRepository.findFirstByWorkspaceIdAndUserIdOrderByPeriodDesc(workspaceId, profile.getUserId())
                .map(kpi -> kpi.getScore())
                .orElse(null);

        List<ProjectEntity> workspaceProjects = projectRepository.findAllByWorkspaceId(workspaceId);
        java.util.Set<Long> memberProjectIds = projectMemberRepository
                .findAllByIdProjectIdIn(workspaceProjects.stream().map(ProjectEntity::getId).toList()).stream()
                .filter(m -> m.getUserId().equals(profile.getUserId()))
                .map(m -> m.getProjectId())
                .collect(java.util.stream.Collectors.toSet());
        List<ProjectEntity> involvedProjects = workspaceProjects.stream()
                .filter(p -> p.getManagerId().equals(profile.getUserId()) || memberProjectIds.contains(p.getId()))
                .toList();
        // "involved" = manager OR team member (union) - counting managed-only projects undercounts
        // everyone who isn't the single project manager, see DashboardService's matching fix.
        long projectCount = involvedProjects.size();
        List<String> projectNames = involvedProjects.stream().map(ProjectEntity::getName).toList();

        List<Long> taskIds = taskAssigneeRepository.findAllByIdUserId(profile.getUserId()).stream()
                .map(a -> a.getTaskId())
                .toList();
        List<TaskEntity> tasks = taskIds.isEmpty() ? List.of() : taskRepository.findAllById(taskIds).stream()
                .filter(t -> t.getWorkspaceId().equals(workspaceId) && t.getDeletedAt() == null)
                .toList();
        long taskCount = tasks.size();
        long completedTasks = tasks.stream().filter(t -> t.getStatus() == TaskStatus.COMPLETED).count();
        long activeTasks = tasks.stream()
                .filter(t -> t.getStatus() != TaskStatus.COMPLETED && t.getStatus() != TaskStatus.CANCELLED)
                .count();
        Instant now = Instant.now();
        long overdueTasks = tasks.stream()
                .filter(t -> t.getStatus() != TaskStatus.COMPLETED && t.getStatus() != TaskStatus.CANCELLED)
                .filter(t -> t.getDueAt() != null && t.getDueAt().isBefore(now))
                .count();

        return EmployeeResponse.from(profile, fullName, avatar, kpiScore, projectCount, taskCount, activeTasks,
                completedTasks, overdueTasks, projectNames, financeAccess);
    }

    private String displayName(UserEntity user) {
        return user.getLastName() == null || user.getLastName().isBlank()
                ? user.getFirstName()
                : user.getFirstName() + " " + user.getLastName();
    }

    private EmployeeProfileEntity findWithinWorkspace(Long employeeId, Long workspaceId) {
        return employeeRepository.findByIdAndWorkspaceId(employeeId, workspaceId)
                .orElseThrow(() -> new ApiException(HttpStatus.NOT_FOUND, "EMPLOYEE_NOT_FOUND",
                        "Xodim topilmadi: " + employeeId));
    }

    private void requireMembership(Long workspaceId, Long userId) {
        if (!memberRepository.existsByWorkspaceIdAndUserIdAndActiveTrueAndTemporarilyBlockedFalse(workspaceId, userId)) {
            throw new ApiException(HttpStatus.FORBIDDEN, "WORKSPACE_ACCESS_DENIED", "Ish maydoniga kirishga ruxsat yo'q");
        }
    }

    /** Mirrors FinanceDashboardService's access rule: workspace OWNER, or CEO/MENEJER org role -
     *  base salary is sensitive and must not leak to (or be editable by) regular employees. */
    private boolean hasFinanceAccess(Long workspaceId, Long userId) {
        WorkspaceMemberEntity membership = memberRepository
                .findByWorkspaceIdAndUserIdAndActiveTrueAndTemporarilyBlockedFalse(workspaceId, userId)
                .orElse(null);
        if (membership == null) {
            return false;
        }
        if ("OWNER".equals(membership.getRoleCode())) {
            return true;
        }
        OrgRole orgRole = employeeRepository.findByWorkspaceIdAndUserId(workspaceId, userId)
                .map(EmployeeProfileEntity::getOrgRole)
                .orElse(null);
        return orgRole == OrgRole.CEO || orgRole == OrgRole.MENEJER;
    }

    private void requireFinanceAccess(Long workspaceId, Long userId) {
        if (!hasFinanceAccess(workspaceId, userId)) {
            throw new ApiException(HttpStatus.FORBIDDEN, "FINANCE_ACCESS_DENIED",
                    "Maosh ma'lumotlarini o'zgartirish uchun ruxsat yo'q");
        }
    }
}
