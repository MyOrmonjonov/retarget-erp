package uz.taskapp.contentplan;

import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import uz.taskapp.common.ApiException;
import uz.taskapp.project.ProjectEntity;
import uz.taskapp.project.ProjectRepository;
import uz.taskapp.workspace.WorkspaceMemberRepository;

import java.time.LocalDate;
import java.util.List;

@Service
public class ContentPlanService {
    private final ContentPlanItemRepository itemRepository;
    private final ProjectRepository projectRepository;
    private final WorkspaceMemberRepository memberRepository;

    public ContentPlanService(ContentPlanItemRepository itemRepository, ProjectRepository projectRepository,
                               WorkspaceMemberRepository memberRepository) {
        this.itemRepository = itemRepository;
        this.projectRepository = projectRepository;
        this.memberRepository = memberRepository;
    }

    @Transactional(readOnly = true)
    public List<ContentPlanItemResponse> list(Long currentUserId, Long workspaceId, Long projectId) {
        ProjectEntity project = findProjectInWorkspace(projectId, workspaceId, currentUserId);
        return itemRepository.findAllByProjectIdOrderByDateAsc(project.getId()).stream()
                .map(ContentPlanItemResponse::from).toList();
    }

    @Transactional
    public ContentPlanItemResponse create(Long currentUserId, Long workspaceId, Long projectId,
                                           ContentPlanItemRequest request) {
        ProjectEntity project = findProjectInWorkspace(projectId, workspaceId, currentUserId);
        ContentPlanItemEntity item = new ContentPlanItemEntity(project.getId(), request.date(), request.topic(),
                request.caption(), request.note(), request.format(), joinOrNull(request.platforms()),
                joinOrNull(request.statuses()), joinOrNull(request.ownerIds()));
        return ContentPlanItemResponse.from(itemRepository.save(item));
    }

    @Transactional
    public ContentPlanItemResponse update(Long currentUserId, Long workspaceId, Long projectId, Long itemId,
                                           ContentPlanItemRequest request) {
        findProjectInWorkspace(projectId, workspaceId, currentUserId);
        ContentPlanItemEntity item = itemRepository.findByIdAndProjectId(itemId, projectId)
                .orElseThrow(() -> new ApiException(HttpStatus.NOT_FOUND, "CONTENT_PLAN_ITEM_NOT_FOUND", "Band topilmadi"));
        item.update(request.date(), request.topic(), request.caption(), request.note(), request.format(),
                joinOrNull(request.platforms()), joinOrNull(request.statuses()), joinOrNull(request.ownerIds()));
        return ContentPlanItemResponse.from(item);
    }

    @Transactional
    public void delete(Long currentUserId, Long workspaceId, Long projectId, Long itemId) {
        findProjectInWorkspace(projectId, workspaceId, currentUserId);
        ContentPlanItemEntity item = itemRepository.findByIdAndProjectId(itemId, projectId)
                .orElseThrow(() -> new ApiException(HttpStatus.NOT_FOUND, "CONTENT_PLAN_ITEM_NOT_FOUND", "Band topilmadi"));
        itemRepository.delete(item);
    }

    private ProjectEntity findProjectInWorkspace(Long projectId, Long workspaceId, Long currentUserId) {
        if (!memberRepository.existsByWorkspaceIdAndUserIdAndActiveTrueAndTemporarilyBlockedFalse(workspaceId, currentUserId)) {
            throw new ApiException(HttpStatus.FORBIDDEN, "WORKSPACE_ACCESS_DENIED", "Ish maydoniga kirishga ruxsat yo'q");
        }
        return projectRepository.findByIdAndWorkspaceId(projectId, workspaceId)
                .orElseThrow(() -> new ApiException(HttpStatus.NOT_FOUND, "PROJECT_NOT_FOUND", "Loyiha topilmadi"));
    }

    private String joinOrNull(List<String> values) {
        if (values == null || values.isEmpty()) return null;
        return String.join(",", values);
    }

    public record ContentPlanItemRequest(LocalDate date, String topic, String caption, String note, String format,
                                          List<String> platforms, List<String> statuses, List<String> ownerIds) {
    }

    public record ContentPlanItemResponse(Long id, Long projectId, LocalDate date, String topic, String caption,
                                           String note, String format, List<String> platforms, List<String> statuses,
                                           List<String> ownerIds) {
        static ContentPlanItemResponse from(ContentPlanItemEntity item) {
            return new ContentPlanItemResponse(item.getId(), item.getProjectId(), item.getDate(), item.getTopic(),
                    item.getCaption(), item.getNote(), item.getFormat(), split(item.getPlatforms()),
                    split(item.getStatuses()), split(item.getOwnerIds()));
        }

        private static List<String> split(String value) {
            return value == null || value.isBlank() ? List.of() : List.of(value.split(","));
        }
    }
}
