package uz.taskapp.projectmonth;

import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import uz.taskapp.common.ApiException;
import uz.taskapp.project.ProjectEntity;
import uz.taskapp.project.ProjectRepository;
import uz.taskapp.workspace.WorkspaceMemberRepository;

import java.util.List;
import java.util.regex.Pattern;

@Service
public class ProjectMonthService {
    private static final Pattern MONTH_KEY_PATTERN = Pattern.compile("^\\d{4}-(0[1-9]|1[0-2])$");

    private final ProjectMonthRepository monthRepository;
    private final ProjectRepository projectRepository;
    private final WorkspaceMemberRepository memberRepository;

    public ProjectMonthService(ProjectMonthRepository monthRepository, ProjectRepository projectRepository,
                                WorkspaceMemberRepository memberRepository) {
        this.monthRepository = monthRepository;
        this.projectRepository = projectRepository;
        this.memberRepository = memberRepository;
    }

    @Transactional(readOnly = true)
    public List<ProjectMonthResponse> list(Long currentUserId, Long workspaceId, Long projectId) {
        ProjectEntity project = findProjectInWorkspace(projectId, workspaceId, currentUserId);
        return monthRepository.findAllByProjectId(project.getId()).stream()
                .map(ProjectMonthResponse::from).toList();
    }

    /** Creates the month's bookkeeping row if it doesn't exist yet, otherwise updates only the
     *  fields present in the request - so "+ Yangi oy" (no fields), rename (displayName only) and
     *  archive/activate (status only) can all reuse this one endpoint. */
    @Transactional
    public ProjectMonthResponse upsert(Long currentUserId, Long workspaceId, Long projectId, String monthKey,
                                        ProjectMonthUpsertRequest request) {
        if (!MONTH_KEY_PATTERN.matcher(monthKey).matches()) {
            throw new ApiException(HttpStatus.BAD_REQUEST, "PROJECT_MONTH_KEY_INVALID", "Oy formati noto'g'ri: " + monthKey);
        }
        ProjectEntity project = findProjectInWorkspace(projectId, workspaceId, currentUserId);
        ProjectMonthEntity month = monthRepository.findByProjectIdAndMonthKey(project.getId(), monthKey)
                .orElseGet(() -> monthRepository.save(new ProjectMonthEntity(workspaceId, project.getId(), monthKey)));
        if (request != null && request.displayName() != null) {
            month.rename(request.displayName().isBlank() ? null : request.displayName());
        }
        if (request != null && request.status() != null) {
            month.changeStatus(request.status());
        }
        return ProjectMonthResponse.from(month);
    }

    @Transactional
    public void delete(Long currentUserId, Long workspaceId, Long projectId, String monthKey) {
        ProjectEntity project = findProjectInWorkspace(projectId, workspaceId, currentUserId);
        ProjectMonthEntity month = monthRepository.findByProjectIdAndMonthKey(project.getId(), monthKey)
                .orElseThrow(() -> new ApiException(HttpStatus.NOT_FOUND, "PROJECT_MONTH_NOT_FOUND", "Oy topilmadi"));
        monthRepository.delete(month);
    }

    private ProjectEntity findProjectInWorkspace(Long projectId, Long workspaceId, Long currentUserId) {
        if (!memberRepository.existsByWorkspaceIdAndUserIdAndActiveTrueAndTemporarilyBlockedFalse(workspaceId, currentUserId)) {
            throw new ApiException(HttpStatus.FORBIDDEN, "WORKSPACE_ACCESS_DENIED", "Ish maydoniga kirishga ruxsat yo'q");
        }
        return projectRepository.findByIdAndWorkspaceId(projectId, workspaceId)
                .orElseThrow(() -> new ApiException(HttpStatus.NOT_FOUND, "PROJECT_NOT_FOUND", "Loyiha topilmadi"));
    }

    public record ProjectMonthUpsertRequest(String displayName, ProjectMonthStatus status) {
    }

    public record ProjectMonthResponse(Long id, Long projectId, String monthKey, String displayName,
                                        ProjectMonthStatus status) {
        static ProjectMonthResponse from(ProjectMonthEntity month) {
            return new ProjectMonthResponse(month.getId(), month.getProjectId(), month.getMonthKey(),
                    month.getDisplayName(), month.getStatus());
        }
    }
}
