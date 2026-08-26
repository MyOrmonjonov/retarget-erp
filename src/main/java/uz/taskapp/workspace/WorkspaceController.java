package uz.taskapp.workspace;

import jakarta.servlet.http.HttpServletRequest;
import org.springframework.http.HttpStatus;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import uz.taskapp.common.ApiException;
import uz.taskapp.auth.AuthInterceptor;
import uz.taskapp.user.UserEntity;
import uz.taskapp.user.UserRepository;

import java.util.List;
import java.util.stream.StreamSupport;

@RestController
@RequestMapping("/api/workspaces")
public class WorkspaceController {
    private final WorkspaceRepository workspaceRepository;
    private final WorkspaceMemberRepository memberRepository;
    private final UserRepository userRepository;

    public WorkspaceController(WorkspaceRepository workspaceRepository, WorkspaceMemberRepository memberRepository,
                               UserRepository userRepository) {
        this.workspaceRepository = workspaceRepository;
        this.memberRepository = memberRepository;
        this.userRepository = userRepository;
    }

    @PostMapping
    WorkspaceResponse create(HttpServletRequest request, @RequestBody CreateWorkspaceRequest body) {
        Long userId = (Long) request.getAttribute(AuthInterceptor.USER_ID_ATTRIBUTE);
        String name = body.name() == null || body.name().isBlank() ? "Yangi ish maydoni" : body.name().trim();
        UserEntity user = userRepository.findById(userId)
                .orElseThrow(() -> new ApiException(HttpStatus.UNAUTHORIZED, "USER_NOT_FOUND", "Foydalanuvchi topilmadi"));
        String language = user.getUiLanguage() == null ? "uz" : user.getUiLanguage();
        WorkspaceEntity workspace = workspaceRepository.save(new WorkspaceEntity(name, language, userId));
        memberRepository.save(new WorkspaceMemberEntity(workspace.getId(), userId, "OWNER"));
        return new WorkspaceResponse(workspace.getId(), workspace.getName(), "OWNER");
    }

    @PutMapping("/{workspaceId}")
    @Transactional
    WorkspaceResponse rename(HttpServletRequest request, @PathVariable Long workspaceId,
                             @RequestBody RenameWorkspaceRequest body) {
        Long currentUserId = (Long) request.getAttribute(AuthInterceptor.USER_ID_ATTRIBUTE);
        WorkspaceMemberEntity membership = memberRepository.findByWorkspaceIdAndUserIdAndActiveTrue(workspaceId, currentUserId)
                .orElseThrow(() -> new ApiException(HttpStatus.FORBIDDEN, "WORKSPACE_ACCESS_DENIED", "Ish maydoniga kirishga ruxsat yo'q"));
        if (!"OWNER".equals(membership.getRoleCode())) {
            throw new ApiException(HttpStatus.FORBIDDEN, "WORKSPACE_OWNER_ONLY", "Faqat ish maydoni egasi nomini o'zgartira oladi");
        }
        if (body.name() == null || body.name().isBlank()) {
            throw new ApiException(HttpStatus.BAD_REQUEST, "WORKSPACE_NAME_REQUIRED", "Ish maydoni nomini kiriting");
        }
        WorkspaceEntity workspace = workspaceRepository.findById(workspaceId)
                .orElseThrow(() -> new ApiException(HttpStatus.NOT_FOUND, "WORKSPACE_NOT_FOUND", "Ish maydoni topilmadi"));
        workspace.rename(body.name().trim());
        workspaceRepository.save(workspace);
        return new WorkspaceResponse(workspace.getId(), workspace.getName(), membership.getRoleCode());
    }

    @GetMapping("/{workspaceId}/members")
    List<WorkspaceMemberResponse> members(HttpServletRequest request, @PathVariable Long workspaceId) {
        Long currentUserId = (Long) request.getAttribute(AuthInterceptor.USER_ID_ATTRIBUTE);
        if (!memberRepository.existsByWorkspaceIdAndUserIdAndActiveTrueAndTemporarilyBlockedFalse(workspaceId, currentUserId)) {
            throw new ApiException(HttpStatus.FORBIDDEN, "WORKSPACE_ACCESS_DENIED", "Ish maydoniga kirishga ruxsat yo'q");
        }
        List<WorkspaceMemberEntity> memberships = memberRepository.findAllByWorkspaceIdAndActiveTrue(workspaceId);
        List<Long> userIds = memberships.stream().map(WorkspaceMemberEntity::getUserId).toList();
        return StreamSupport.stream(userRepository.findAllById(userIds).spliterator(), false)
                .map(user -> toResponse(user, memberships))
                .sorted((left, right) -> left.firstName().compareToIgnoreCase(right.firstName()))
                .toList();
    }

    private WorkspaceMemberResponse toResponse(UserEntity user, List<WorkspaceMemberEntity> memberships) {
        WorkspaceMemberEntity membership = memberships.stream()
                .filter(item -> item.getUserId().equals(user.getId()))
                .findFirst()
                .orElseThrow();
        return new WorkspaceMemberResponse(
                user.getId(),
                user.getTelegramId(),
                user.getFirstName(),
                user.getLastName(),
                user.getUsername(),
                user.getPhotoUrl(),
                membership.getRoleCode(),
                membership.isActive(),
                membership.isTemporarilyBlocked()
        );
    }

    public record WorkspaceMemberResponse(
            Long id,
            Long telegramId,
            String firstName,
            String lastName,
            String username,
            String photoUrl,
            String roleCode,
            boolean active,
            boolean temporarilyBlocked
    ) {
    }

    public record CreateWorkspaceRequest(String name) {
    }

    public record RenameWorkspaceRequest(String name) {
    }

    public record WorkspaceResponse(Long id, String name, String role) {
    }
}
