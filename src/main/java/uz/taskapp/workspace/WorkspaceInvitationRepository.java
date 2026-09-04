package uz.taskapp.workspace;

import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface WorkspaceInvitationRepository extends JpaRepository<WorkspaceInvitationEntity, Long> {

    List<WorkspaceInvitationEntity> findAllByWorkspaceIdAndStatus(Long workspaceId, String status);

    List<WorkspaceInvitationEntity> findAllByTelegramIdAndStatus(Long telegramId, String status);

    Optional<WorkspaceInvitationEntity> findByIdAndWorkspaceId(Long id, Long workspaceId);

    boolean existsByWorkspaceIdAndTelegramIdAndStatus(Long workspaceId, Long telegramId, String status);
}
