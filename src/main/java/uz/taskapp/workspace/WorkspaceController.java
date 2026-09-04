package uz.taskapp.workspace;

import jakarta.servlet.http.HttpServletRequest;
import org.springframework.http.HttpStatus;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.bind.annotation.DeleteMapping;
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
import java.util.Set;
import java.util.stream.StreamSupport;

@RestController
@RequestMapping("/api/workspaces")
public class WorkspaceController {
    private static final Set<String> VALID_ROLE_CODES = Set.of("OWNER", "MEMBER");

    private final WorkspaceRepository workspaceRepository;
    private final WorkspaceMemberRepository memberRepository;
    private final WorkspaceInvitationRepository invitationRepository;
    private final UserRepository userRepository;

    public WorkspaceController(WorkspaceRepository workspaceRepository, WorkspaceMemberRepository memberRepository,
                               WorkspaceInvitationRepository invitationRepository, UserRepository userRepository) {
        this.workspaceRepository = workspaceRepository;
        this.memberRepository = memberRepository;
        this.invitationRepository = invitationRepository;
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

    @PostMapping("/{workspaceId}/invitations")
    @Transactional
    InvitationOrMemberResponse invite(HttpServletRequest request, @PathVariable Long workspaceId,
                                       @RequestBody InviteMemberRequest body) {
        Long currentUserId = (Long) request.getAttribute(AuthInterceptor.USER_ID_ATTRIBUTE);
        requireOwner(workspaceId, currentUserId);
        if (body.telegramId() == null) {
            throw new ApiException(HttpStatus.BAD_REQUEST, "TELEGRAM_ID_REQUIRED", "Telegram ID kiritilishi shart");
        }
        String roleCode = body.roleCode() == null || body.roleCode().isBlank() ? "MEMBER" : body.roleCode().trim().toUpperCase();
        if (!VALID_ROLE_CODES.contains(roleCode)) {
            throw new ApiException(HttpStatus.BAD_REQUEST, "ROLE_CODE_INVALID", "Rol noto'g'ri: " + roleCode);
        }

        UserEntity existingUser = userRepository.findByTelegramId(body.telegramId()).orElse(null);
        if (existingUser != null) {
            WorkspaceMemberEntity membership = memberRepository
                    .findByWorkspaceIdAndUserId(workspaceId, existingUser.getId())
                    .orElse(null);
            if (membership != null && membership.isActive()) {
                throw new ApiException(HttpStatus.CONFLICT, "ALREADY_MEMBER", "Bu foydalanuvchi allaqachon ish maydoni a'zosi");
            }
            if (membership == null) {
                membership = new WorkspaceMemberEntity(workspaceId, existingUser.getId(), roleCode);
            } else {
                membership.activate();
                membership.changeRole(roleCode);
            }
            memberRepository.save(membership);
            return InvitationOrMemberResponse.member(existingUser, membership);
        }

        if (invitationRepository.existsByWorkspaceIdAndTelegramIdAndStatus(workspaceId, body.telegramId(), "PENDING")) {
            throw new ApiException(HttpStatus.CONFLICT, "INVITATION_ALREADY_PENDING", "Bu Telegram ID uchun taklif allaqachon yuborilgan");
        }
        WorkspaceInvitationEntity invitation = invitationRepository.save(
                new WorkspaceInvitationEntity(workspaceId, body.telegramId(), roleCode, currentUserId));
        return InvitationOrMemberResponse.invitation(invitation);
    }

    @GetMapping("/{workspaceId}/invitations")
    List<InvitationResponse> invitations(HttpServletRequest request, @PathVariable Long workspaceId) {
        Long currentUserId = (Long) request.getAttribute(AuthInterceptor.USER_ID_ATTRIBUTE);
        requireOwner(workspaceId, currentUserId);
        return invitationRepository.findAllByWorkspaceIdAndStatus(workspaceId, "PENDING").stream()
                .map(inv -> new InvitationResponse(inv.getId(), inv.getTelegramId(), inv.getRoleCode(), inv.getStatus(),
                        inv.getCreatedAt().toString()))
                .toList();
    }

    @DeleteMapping("/{workspaceId}/invitations/{invitationId}")
    @Transactional
    void revokeInvitation(HttpServletRequest request, @PathVariable Long workspaceId, @PathVariable Long invitationId) {
        Long currentUserId = (Long) request.getAttribute(AuthInterceptor.USER_ID_ATTRIBUTE);
        requireOwner(workspaceId, currentUserId);
        WorkspaceInvitationEntity invitation = invitationRepository.findByIdAndWorkspaceId(invitationId, workspaceId)
                .orElseThrow(() -> new ApiException(HttpStatus.NOT_FOUND, "INVITATION_NOT_FOUND", "Taklif topilmadi"));
        invitation.revoke();
    }

    @PutMapping("/{workspaceId}/members/{userId}/role")
    @Transactional
    WorkspaceMemberResponse changeRole(HttpServletRequest request, @PathVariable Long workspaceId,
                                        @PathVariable Long userId, @RequestBody ChangeRoleRequest body) {
        Long currentUserId = (Long) request.getAttribute(AuthInterceptor.USER_ID_ATTRIBUTE);
        requireOwner(workspaceId, currentUserId);
        if (userId.equals(currentUserId)) {
            throw new ApiException(HttpStatus.BAD_REQUEST, "CANNOT_CHANGE_OWN_ROLE", "O'z rolingizni o'zgartira olmaysiz");
        }
        String roleCode = body.roleCode() == null ? null : body.roleCode().trim().toUpperCase();
        if (!VALID_ROLE_CODES.contains(roleCode)) {
            throw new ApiException(HttpStatus.BAD_REQUEST, "ROLE_CODE_INVALID", "Rol noto'g'ri: " + body.roleCode());
        }
        WorkspaceMemberEntity membership = memberRepository.findByWorkspaceIdAndUserIdAndActiveTrue(workspaceId, userId)
                .orElseThrow(() -> new ApiException(HttpStatus.NOT_FOUND, "MEMBER_NOT_FOUND", "A'zo topilmadi"));
        if ("MEMBER".equals(roleCode) && "OWNER".equals(membership.getRoleCode())) {
            requireAnotherActiveOwner(workspaceId, userId);
        }
        membership.changeRole(roleCode);
        UserEntity user = userRepository.findById(userId)
                .orElseThrow(() -> new ApiException(HttpStatus.NOT_FOUND, "USER_NOT_FOUND", "Foydalanuvchi topilmadi"));
        return toResponse(user, List.of(membership));
    }

    @DeleteMapping("/{workspaceId}/members/{userId}")
    @Transactional
    void removeMember(HttpServletRequest request, @PathVariable Long workspaceId, @PathVariable Long userId) {
        Long currentUserId = (Long) request.getAttribute(AuthInterceptor.USER_ID_ATTRIBUTE);
        requireOwner(workspaceId, currentUserId);
        if (userId.equals(currentUserId)) {
            throw new ApiException(HttpStatus.BAD_REQUEST, "CANNOT_REMOVE_SELF", "O'zingizni ish maydonidan chiqara olmaysiz");
        }
        WorkspaceMemberEntity membership = memberRepository.findByWorkspaceIdAndUserIdAndActiveTrue(workspaceId, userId)
                .orElseThrow(() -> new ApiException(HttpStatus.NOT_FOUND, "MEMBER_NOT_FOUND", "A'zo topilmadi"));
        if ("OWNER".equals(membership.getRoleCode())) {
            requireAnotherActiveOwner(workspaceId, userId);
        }
        membership.deactivate();
    }

    private void requireOwner(Long workspaceId, Long currentUserId) {
        WorkspaceMemberEntity membership = memberRepository.findByWorkspaceIdAndUserIdAndActiveTrue(workspaceId, currentUserId)
                .orElseThrow(() -> new ApiException(HttpStatus.FORBIDDEN, "WORKSPACE_ACCESS_DENIED", "Ish maydoniga kirishga ruxsat yo'q"));
        if (!"OWNER".equals(membership.getRoleCode())) {
            throw new ApiException(HttpStatus.FORBIDDEN, "WORKSPACE_OWNER_ONLY", "Faqat ish maydoni egasi bu amalni bajara oladi");
        }
    }

    private void requireAnotherActiveOwner(Long workspaceId, Long excludingUserId) {
        boolean hasOtherOwner = memberRepository.findAllByWorkspaceIdAndActiveTrue(workspaceId).stream()
                .anyMatch(m -> "OWNER".equals(m.getRoleCode()) && !m.getUserId().equals(excludingUserId));
        if (!hasOtherOwner) {
            throw new ApiException(HttpStatus.BAD_REQUEST, "LAST_OWNER", "Ish maydonida kamida bitta egasi (OWNER) qolishi kerak");
        }
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

    public record InviteMemberRequest(Long telegramId, String roleCode) {
    }

    public record ChangeRoleRequest(String roleCode) {
    }

    public record InvitationResponse(Long id, Long telegramId, String roleCode, String status, String createdAt) {
    }

    public record InvitationOrMemberResponse(String outcome, WorkspaceMemberResponse member, InvitationResponse invitation) {
        static InvitationOrMemberResponse member(UserEntity user, WorkspaceMemberEntity membership) {
            return new InvitationOrMemberResponse("MEMBER_ADDED", new WorkspaceMemberResponse(
                    user.getId(), user.getTelegramId(), user.getFirstName(), user.getLastName(), user.getUsername(),
                    user.getPhotoUrl(), membership.getRoleCode(), membership.isActive(), membership.isTemporarilyBlocked()
            ), null);
        }

        static InvitationOrMemberResponse invitation(WorkspaceInvitationEntity invitation) {
            return new InvitationOrMemberResponse("INVITATION_PENDING", null, new InvitationResponse(
                    invitation.getId(), invitation.getTelegramId(), invitation.getRoleCode(), invitation.getStatus(),
                    invitation.getCreatedAt().toString()
            ));
        }
    }
}
