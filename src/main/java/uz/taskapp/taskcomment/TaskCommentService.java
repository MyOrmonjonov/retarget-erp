package uz.taskapp.taskcomment;

import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.transaction.support.TransactionSynchronization;
import org.springframework.transaction.support.TransactionSynchronizationManager;
import uz.taskapp.common.ApiException;
import uz.taskapp.realtime.WorkspaceBroadcastService;
import uz.taskapp.task.TaskAssigneeRepository;
import uz.taskapp.task.TaskEntity;
import uz.taskapp.task.TaskRepository;
import uz.taskapp.task.TaskVisibility;
import uz.taskapp.user.UserEntity;
import uz.taskapp.user.UserRepository;
import uz.taskapp.workspace.WorkspaceMemberRepository;

import java.time.Instant;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Service
public class TaskCommentService {
    private final TaskCommentRepository commentRepository;
    private final TaskRepository taskRepository;
    private final TaskAssigneeRepository assigneeRepository;
    private final WorkspaceMemberRepository memberRepository;
    private final UserRepository userRepository;
    private final WorkspaceBroadcastService broadcastService;

    public TaskCommentService(TaskCommentRepository commentRepository, TaskRepository taskRepository,
                               TaskAssigneeRepository assigneeRepository, WorkspaceMemberRepository memberRepository,
                               UserRepository userRepository, WorkspaceBroadcastService broadcastService) {
        this.commentRepository = commentRepository;
        this.taskRepository = taskRepository;
        this.assigneeRepository = assigneeRepository;
        this.memberRepository = memberRepository;
        this.userRepository = userRepository;
        this.broadcastService = broadcastService;
    }

    @Transactional(readOnly = true)
    public List<CommentResponse> list(Long currentUserId, Long taskId) {
        TaskEntity task = findVisibleTask(currentUserId, taskId);
        List<TaskCommentEntity> comments = commentRepository.findAllByTaskIdOrderByCreatedAtAsc(task.getId());
        Map<Long, String> authorNames = authorNames(comments);
        return comments.stream().map(c -> toResponse(c, authorNames)).toList();
    }

    @Transactional
    public CommentResponse create(Long currentUserId, Long taskId, String body) {
        if (body == null || body.isBlank()) {
            throw new ApiException(HttpStatus.BAD_REQUEST, "COMMENT_BODY_REQUIRED", "Izoh matnini kiriting");
        }
        TaskEntity task = findVisibleTask(currentUserId, taskId);
        TaskCommentEntity comment = commentRepository.save(
                new TaskCommentEntity(task.getId(), currentUserId, null, body.trim()));
        Long workspaceId = task.getWorkspaceId();
        Long taskIdFinal = task.getId();
        runAfterCommit(() -> broadcastService.notifyTaskChanged(workspaceId, taskIdFinal, currentUserId));
        return toResponse(comment, authorNames(List.of(comment)));
    }

    private TaskEntity findVisibleTask(Long currentUserId, Long taskId) {
        TaskEntity task = taskRepository.findByIdAndDeletedAtIsNull(taskId)
                .orElseThrow(() -> new ApiException(HttpStatus.NOT_FOUND, "TASK_NOT_FOUND", "Vazifa topilmadi"));
        if (!memberRepository.existsByWorkspaceIdAndUserIdAndActiveTrueAndTemporarilyBlockedFalse(
                task.getWorkspaceId(), currentUserId)) {
            throw new ApiException(HttpStatus.FORBIDDEN, "WORKSPACE_ACCESS_DENIED", "Ish maydoniga kirishga ruxsat yo'q");
        }
        boolean visible = task.getVisibility() != TaskVisibility.ONE_TO_ONE
                || task.getAuthorId().equals(currentUserId)
                || assigneeRepository.existsByIdTaskIdAndIdUserId(taskId, currentUserId);
        if (!visible) {
            throw new ApiException(HttpStatus.FORBIDDEN, "TASK_ACCESS_DENIED", "Vazifani ko'rishga ruxsat yo'q");
        }
        return task;
    }

    private Map<Long, String> authorNames(List<TaskCommentEntity> comments) {
        List<Long> ids = comments.stream().map(TaskCommentEntity::getAuthorId).distinct().toList();
        return userRepository.findAllById(ids).stream()
                .collect(Collectors.toMap(UserEntity::getId, this::displayName));
    }

    private String displayName(UserEntity user) {
        return user.getLastName() == null || user.getLastName().isBlank()
                ? user.getFirstName()
                : user.getFirstName() + " " + user.getLastName();
    }

    private CommentResponse toResponse(TaskCommentEntity comment, Map<Long, String> authorNames) {
        return new CommentResponse(comment.getId(), comment.getTaskId(), comment.getAuthorId(),
                authorNames.getOrDefault(comment.getAuthorId(), "Foydalanuvchi"), comment.getBody(), comment.getCreatedAt());
    }

    private void runAfterCommit(Runnable action) {
        if (TransactionSynchronizationManager.isSynchronizationActive()) {
            TransactionSynchronizationManager.registerSynchronization(new TransactionSynchronization() {
                @Override
                public void afterCommit() {
                    action.run();
                }
            });
        } else {
            action.run();
        }
    }

    public record CommentResponse(Long id, Long taskId, Long authorId, String authorName, String body, Instant createdAt) {
    }
}
