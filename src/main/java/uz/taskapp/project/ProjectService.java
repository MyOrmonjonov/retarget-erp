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

import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Service
public class ProjectService {
    private final ProjectRepository projectRepository;
    private final WorkspaceMemberRepository memberRepository;
    private final UserRepository userRepository;

    public ProjectService(ProjectRepository projectRepository, WorkspaceMemberRepository memberRepository,
                           UserRepository userRepository) {
        this.projectRepository = projectRepository;
        this.memberRepository = memberRepository;
        this.userRepository = userRepository;
    }

    @Transactional(readOnly = true)
    public List<ProjectResponse> list(Long currentUserId, Long workspaceId, ProjectStatus status) {
        requireMembership(workspaceId, currentUserId);
        List<ProjectEntity> projects = status == null
                ? projectRepository.findAllByWorkspaceId(workspaceId)
                : projectRepository.findAllByWorkspaceIdAndStatus(workspaceId, status);
        Map<Long, String> managerNames = managerNames(projects);
        return projects.stream()
                .map(project -> ProjectResponse.from(project, managerNames.get(project.getManagerId())))
                .toList();
    }

    @Transactional(readOnly = true)
    public ProjectResponse detail(Long currentUserId, Long workspaceId, Long projectId) {
        requireMembership(workspaceId, currentUserId);
        ProjectEntity project = findWithinWorkspace(projectId, workspaceId);
        return ProjectResponse.from(project, displayName(project.getManagerId()));
    }

    @Transactional
    public ProjectResponse create(Long currentUserId, CreateProjectRequest request) {
        requireMembership(request.workspaceId(), currentUserId);
        requireMembership(request.workspaceId(), request.managerId());
        ProjectEntity project = new ProjectEntity(request.workspaceId(), request.name(), request.clientId(),
                request.clientName(), request.type(), ProjectStatus.PLANNING, 0, request.managerId(),
                request.startDate(), request.deadline(), request.budget(), request.description());
        project = projectRepository.save(project);
        return ProjectResponse.from(project, displayName(project.getManagerId()));
    }

    @Transactional
    public ProjectResponse update(Long currentUserId, Long workspaceId, Long projectId, UpdateProjectRequest request) {
        requireMembership(workspaceId, currentUserId);
        requireMembership(workspaceId, request.managerId());
        ProjectEntity project = findWithinWorkspace(projectId, workspaceId);
        project.update(request.name(), request.clientId(), request.clientName(), request.type(),
                request.managerId(), request.startDate(), request.deadline(), request.budget(), request.description());
        return ProjectResponse.from(project, displayName(project.getManagerId()));
    }

    @Transactional
    public ProjectResponse changeStatus(Long currentUserId, Long workspaceId, Long projectId, ProjectStatus status) {
        requireMembership(workspaceId, currentUserId);
        ProjectEntity project = findWithinWorkspace(projectId, workspaceId);
        project.changeStatus(status);
        return ProjectResponse.from(project, displayName(project.getManagerId()));
    }

    @Transactional
    public ProjectResponse updateProgress(Long currentUserId, Long workspaceId, Long projectId, int progress) {
        if (progress < 0 || progress > 100) {
            throw new ApiException(HttpStatus.BAD_REQUEST, "PROJECT_PROGRESS_INVALID", "Progress 0-100 oralig'ida bo'lishi kerak");
        }
        requireMembership(workspaceId, currentUserId);
        ProjectEntity project = findWithinWorkspace(projectId, workspaceId);
        project.updateProgress(progress);
        return ProjectResponse.from(project, displayName(project.getManagerId()));
    }

    @Transactional
    public void delete(Long currentUserId, Long workspaceId, Long projectId) {
        requireMembership(workspaceId, currentUserId);
        projectRepository.delete(findWithinWorkspace(projectId, workspaceId));
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

    private String displayName(Long userId) {
        return userRepository.findById(userId).map(this::displayName).orElse(null);
    }

    private String displayName(UserEntity user) {
        return user.getLastName() == null || user.getLastName().isBlank()
                ? user.getFirstName()
                : user.getFirstName() + " " + user.getLastName();
    }

    private Map<Long, String> managerNames(List<ProjectEntity> projects) {
        List<Long> managerIds = projects.stream().map(ProjectEntity::getManagerId).distinct().toList();
        if (managerIds.isEmpty()) return Map.of();
        return userRepository.findAllById(managerIds).stream()
                .collect(Collectors.toMap(UserEntity::getId, this::displayName));
    }
}
