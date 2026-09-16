package uz.taskapp.admin;

import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface WorkspaceSubscriptionRepository extends JpaRepository<WorkspaceSubscriptionEntity, Long> {
    Optional<WorkspaceSubscriptionEntity> findByWorkspaceId(Long workspaceId);
    List<WorkspaceSubscriptionEntity> findAllByWorkspaceIdIn(List<Long> workspaceIds);
}
