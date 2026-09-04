package uz.taskapp.auth;

import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import uz.taskapp.common.ApiException;
import uz.taskapp.user.UserEntity;
import uz.taskapp.user.UserRepository;
import uz.taskapp.workspace.WorkspaceEntity;
import uz.taskapp.workspace.WorkspaceInvitationEntity;
import uz.taskapp.workspace.WorkspaceInvitationRepository;
import uz.taskapp.workspace.WorkspaceMemberEntity;
import uz.taskapp.workspace.WorkspaceMemberRepository;
import uz.taskapp.workspace.WorkspaceRepository;

import java.util.List;

@Service
public class AuthService {
    private final TelegramInitDataVerifier verifier;
    private final AccessTokenService tokenService;
    private final UserRepository userRepository;
    private final WorkspaceRepository workspaceRepository;
    private final WorkspaceMemberRepository memberRepository;
    private final WorkspaceInvitationRepository invitationRepository;

    public AuthService(TelegramInitDataVerifier verifier,
                       AccessTokenService tokenService,
                       UserRepository userRepository,
                       WorkspaceRepository workspaceRepository,
                       WorkspaceMemberRepository memberRepository,
                       WorkspaceInvitationRepository invitationRepository) {
        this.verifier = verifier;
        this.tokenService = tokenService;
        this.userRepository = userRepository;
        this.workspaceRepository = workspaceRepository;
        this.memberRepository = memberRepository;
        this.invitationRepository = invitationRepository;
    }

    @Transactional
    public AuthResponse authenticate(String initData) {
        VerifiedTelegramData verified = verifier.verify(initData);
        TelegramUserData telegram = verified.user();
        UserEntity user = userRepository.findByTelegramId(telegram.id())
                .orElseGet(() -> new UserEntity(telegram.id(), telegram.firstName()));
        user.updateTelegramProfile(telegram.firstName(), telegram.lastName(), telegram.username(),
                telegram.photoUrl(), telegram.languageCode());
        user = userRepository.save(user);
        if (user.isBlocked()) {
            throw new ApiException(HttpStatus.FORBIDDEN, "USER_BLOCKED", "Foydalanuvchi bloklangan");
        }

        List<WorkspaceMemberEntity> memberships = memberRepository.findAllByUserIdAndActiveTrue(user.getId())
                .stream().filter(member -> !member.isTemporarilyBlocked()).toList();

        // A workspace owner may invite a not-yet-registered Telegram user by ID before that
        // person has ever opened the bot (see WorkspaceController#invite). Apply any such
        // pending invitations on this, their first-ever login, instead of auto-provisioning
        // them their own separate workspace below.
        List<WorkspaceInvitationEntity> pendingInvitations =
                invitationRepository.findAllByTelegramIdAndStatus(telegram.id(), "PENDING");
        if (!pendingInvitations.isEmpty()) {
            List<WorkspaceMemberEntity> fromInvitations = new java.util.ArrayList<>();
            for (WorkspaceInvitationEntity invitation : pendingInvitations) {
                fromInvitations.add(memberRepository.save(
                        new WorkspaceMemberEntity(invitation.getWorkspaceId(), user.getId(), invitation.getRoleCode())));
                invitation.accept();
            }
            memberships = java.util.stream.Stream.concat(memberships.stream(), fromInvitations.stream()).toList();
        }

        // Self-service tenant provisioning: any brand-new Telegram user (no existing membership
        // anywhere, and no pending invitation into someone else's workspace) gets their own
        // private workspace as OWNER on first login - this used to be gated to a single
        // hardcoded bootstrapOwnerTelegramId, which meant nobody but the app's own developer
        // could ever sign up. That gate made sense for a single-tenant internal tool; it's a
        // hard launch-blocker for selling this as a multi-tenant subscription product, since
        // every other real customer would hit INVITATION_REQUIRED on their very first open and
        // have no way in.
        if (memberships.isEmpty()) {
            WorkspaceEntity workspace = workspaceRepository.save(
                    new WorkspaceEntity("Mening ish maydonim", preferredLanguage(telegram.languageCode()), user.getId()));
            memberships = List.of(memberRepository.save(
                    new WorkspaceMemberEntity(workspace.getId(), user.getId(), "OWNER")));
        }

        List<AuthWorkspace> workspaces = memberships.stream()
                .map(member -> workspaceRepository.findById(member.getWorkspaceId())
                        .map(workspace -> new AuthWorkspace(workspace.getId(), workspace.getName(), member.getRoleCode()))
                        .orElse(null))
                .filter(java.util.Objects::nonNull)
                .toList();
        return new AuthResponse(tokenService.issue(user.getId()), new AuthUser(
                user.getId(), user.getTelegramId(), user.getFirstName(), user.getLastName(),
                user.getUsername(), user.getPhotoUrl(), user.getUiLanguage(), user.getTheme(),
                user.isRemindersEnabled()), workspaces);
    }

    private String preferredLanguage(String languageCode) {
        return switch (languageCode == null ? "uz" : languageCode.toLowerCase()) {
            case "ru" -> "ru";
            case "en" -> "en";
            default -> "uz";
        };
    }

    public record AuthResponse(String accessToken, AuthUser user, List<AuthWorkspace> workspaces) {}
    public record AuthUser(Long id, Long telegramId, String firstName, String lastName,
                           String username, String photoUrl, String uiLanguage, String theme,
                           boolean remindersEnabled) {}
    public record AuthWorkspace(Long id, String name, String role) {}
}
