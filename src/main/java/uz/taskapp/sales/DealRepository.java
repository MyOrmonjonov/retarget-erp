package uz.taskapp.sales;

import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface DealRepository extends JpaRepository<DealEntity, Long> {

    List<DealEntity> findAllByWorkspaceId(Long workspaceId);

    List<DealEntity> findAllByWorkspaceIdAndStage(Long workspaceId, DealStage stage);

    Optional<DealEntity> findByIdAndWorkspaceId(Long id, Long workspaceId);
}
