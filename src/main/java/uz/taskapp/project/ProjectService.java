package uz.taskapp.project;

import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import uz.taskapp.common.ApiException;
import uz.taskapp.project.dto.CreateProjectRequest;
import uz.taskapp.project.dto.ProjectResponse;
import uz.taskapp.project.dto.UpdateProjectRequest;
import uz.taskapp.user.UserEntity;
import uz.taskapp.user.UserRepository;
import uz.taskapp.workspace.WorkspaceMemberRepository;

import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Service
public class ProjectService {
    private final ProjectRepository projectRepository;
    private final ProjectMemberRepository memberOfProjectRepository;
    private final WorkspaceMemberRepository memberRepository;
    private final UserRepository userRepository;

    public ProjectService(ProjectRepository projectRepository, ProjectMemberRepository memberOfProjectRepository,
                           WorkspaceMemberRepository memberRepository, UserRepository userRepository) {
        this.projectRepository = projectRepository;
        this.memberOfProjectRepository = memberOfProjectRepository;
        this.memberRepository = memberRepository;
        this.userRepository = userRepository;
    }

    @Transactional(readOnly = true)
    public List<ProjectResponse> list(Long currentUserId, Long workspaceId, ProjectStatus status) {
        requireMembership(workspaceId, currentUserId);
        List<ProjectEntity> projects = status == null
                ? projectRepository.findAllByWorkspaceId(workspaceId)
                : projectRepository.findAllByWorkspaceIdAndStatus(workspaceId, status);

        List<Long> projectIds = projects.stream().map(ProjectEntity::getId).toList();
        Map<Long, List<Long>> teamByProject = new LinkedHashMap<>();
        for (ProjectMemberEntity m : memberOfProjectRepository.findAllByIdProjectIdIn(projectIds)) {
            teamByProject.computeIfAbsent(m.getProjectId(), id -> new java.util.ArrayList<>()).add(m.getUserId());
        }
        Map<Long, UserEntity> usersById = usersById(projects, teamByProject);

        return projects.stream()
                .map(project -> toResponse(project, usersById, teamByProject.getOrDefault(project.getId(), List.of())))
                .toList();
    }

    @Transactional(readOnly = true)
    public ProjectResponse detail(Long currentUserId, Long workspaceId, Long projectId) {
        requireMembership(workspaceId, currentUserId);
        ProjectEntity project = findWithinWorkspace(projectId, workspaceId);
        List<Long> teamUserIds = memberOfProjectRepository.findAllByIdProjectId(projectId).stream()
                .map(ProjectMemberEntity::getUserId).toList();
        Map<Long, UserEntity> usersById = usersById(List.of(project), Map.of(projectId, teamUserIds));
        return toResponse(project, usersById, teamUserIds);
    }

    @Transactional
    public ProjectResponse create(Long currentUserId, CreateProjectRequest request) {
        requireMembership(request.workspaceId(), currentUserId);
        requireMembership(request.workspaceId(), request.managerId());
        ProjectEntity project = new ProjectEntity(request.workspaceId(), request.name(), request.clientId(),
                request.clientName(), request.type(), ProjectStatus.PLANNING, 0, request.priority(),
                request.managerId(), request.startDate(), request.deadline(), request.budget(), request.description());
        project = projectRepository.save(project);
        replaceTeam(project.getId(), request.teamUserIds());
        return detail(currentUserId, request.workspaceId(), project.getId());
    }

    @Transactional
    public ProjectResponse update(Long currentUserId, Long workspaceId, Long projectId, UpdateProjectRequest request) {
        requireMembership(workspaceId, currentUserId);
        requireMembership(workspaceId, request.managerId());
        ProjectEntity project = findWithinWorkspace(projectId, workspaceId);
        project.update(request.name(), request.clientId(), request.clientName(), request.type(), request.priority(),
                request.managerId(), request.startDate(), request.deadline(), request.budget(), request.description());
        if (request.teamUserIds() != null) {
            replaceTeam(projectId, request.teamUserIds());
        }
        return detail(currentUserId, workspaceId, projectId);
    }

    @Transactional
    public ProjectResponse changeStatus(Long currentUserId, Long workspaceId, Long projectId, ProjectStatus status) {
        requireMembership(workspaceId, currentUserId);
        ProjectEntity project = findWithinWorkspace(projectId, workspaceId);
        project.changeStatus(status);
        return detail(currentUserId, workspaceId, projectId);
    }

    @Transactional
    public ProjectResponse updateProgress(Long currentUserId, Long workspaceId, Long projectId, int progress) {
        if (progress < 0 || progress > 100) {
            throw new ApiException(HttpStatus.BAD_REQUEST, "PROJECT_PROGRESS_INVALID", "Progress 0-100 oralig'ida bo'lishi kerak");
        }
        requireMembership(workspaceId, currentUserId);
        ProjectEntity project = findWithinWorkspace(projectId, workspaceId);
        project.updateProgress(progress);
        return detail(currentUserId, workspaceId, projectId);
    }

    @Transactional
    public ProjectResponse updateReport(Long currentUserId, Long workspaceId, Long projectId,
                                         java.math.BigDecimal reportBudget, Integer reportLeads,
                                         java.math.BigDecimal reportCpl, Integer reportSales,
                                         java.math.BigDecimal reportRoi) {
        requireMembership(workspaceId, currentUserId);
        ProjectEntity project = findWithinWorkspace(projectId, workspaceId);
        project.updateReport(reportBudget, reportLeads, reportCpl, reportSales, reportRoi);
        return detail(currentUserId, workspaceId, projectId);
    }

    @Transactional
    public void delete(Long currentUserId, Long workspaceId, Long projectId) {
        requireMembership(workspaceId, currentUserId);
        projectRepository.delete(findWithinWorkspace(projectId, workspaceId));
    }

    private void replaceTeam(Long projectId, List<Long> teamUserIds) {
        memberOfProjectRepository.deleteAllByIdProjectId(projectId);
        if (teamUserIds == null) return;
        for (Long userId : teamUserIds.stream().distinct().toList()) {
            memberOfProjectRepository.save(new ProjectMemberEntity(projectId, userId));
        }
    }

    private ProjectResponse toResponse(ProjectEntity project, Map<Long, UserEntity> usersById, List<Long> teamUserIds) {
        UserEntity manager = usersById.get(project.getManagerId());
        List<ProjectResponse.TeamMemberDto> team = teamUserIds.stream()
                .map(usersById::get)
                .filter(u -> u != null)
                .map(u -> new ProjectResponse.TeamMemberDto(u.getId(), displayName(u), u.getPhotoUrl()))
                .toList();
        return ProjectResponse.from(project, manager == null ? null : displayName(manager),
                manager == null ? null : manager.getPhotoUrl(), team);
    }

    private ProjectEntity findWithinWorkspace(Long projectId, Long workspaceId) {
        return projectRepository.findByIdAndWorkspaceId(projectId, workspaceId)
                .orElseThrow(() -> new ApiException(HttpStatus.NOT_FOUND, "PROJECT_NOT_FOUND",
                        "Loyiha topilmadi: " + projectId));
    }

    private void requireMembership(Long workspaceId, Long userId) {
        if (!memberRepository.existsByWorkspaceIdAndUserIdAndActiveTrueAndTemporarilyBlockedFalse(workspaceId, userId)) {
            throw new ApiException(HttpStatus.FORBIDDEN, "WORKSPACE_ACCESS_DENIED", "Ish maydoniga kirishga ruxsat yo'q");
        }
    }

    private String displayName(UserEntity user) {
        return user.getLastName() == null || user.getLastName().isBlank()
                ? user.getFirstName()
                : user.getFirstName() + " " + user.getLastName();
    }

    private Map<Long, UserEntity> usersById(List<ProjectEntity> projects, Map<Long, List<Long>> teamByProject) {
        List<Long> ids = new java.util.ArrayList<>(projects.stream().map(ProjectEntity::getManagerId).distinct().toList());
        teamByProject.values().forEach(ids::addAll);
        List<Long> distinctIds = ids.stream().distinct().toList();
        if (distinctIds.isEmpty()) return Map.of();
        return userRepository.findAllById(distinctIds).stream()
                .collect(Collectors.toMap(UserEntity::getId, u -> u));
    }
}
