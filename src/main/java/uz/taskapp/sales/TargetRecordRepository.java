package uz.taskapp.sales;

import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface TargetRecordRepository extends JpaRepository<TargetRecordEntity, Long> {

    List<TargetRecordEntity> findAllByWorkspaceIdAndUserIdOrderByPeriodDesc(Long workspaceId, Long userId);

    List<TargetRecordEntity> findAllByWorkspaceIdAndPeriod(Long workspaceId, String period);

    Optional<TargetRecordEntity> findByWorkspaceIdAndUserIdAndPeriod(Long workspaceId, Long userId, String period);

    Optional<TargetRecordEntity> findByIdAndWorkspaceId(Long id, Long workspaceId);
}
