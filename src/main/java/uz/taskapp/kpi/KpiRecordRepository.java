package uz.taskapp.kpi;

import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface KpiRecordRepository extends JpaRepository<KpiRecordEntity, Long> {

    List<KpiRecordEntity> findAllByWorkspaceIdAndUserIdOrderByPeriodDesc(Long workspaceId, Long userId);

    Optional<KpiRecordEntity> findFirstByWorkspaceIdAndUserIdOrderByPeriodDesc(Long workspaceId, Long userId);

    Optional<KpiRecordEntity> findByWorkspaceIdAndUserIdAndPeriod(Long workspaceId, Long userId, String period);

    Optional<KpiRecordEntity> findByIdAndWorkspaceId(Long id, Long workspaceId);

    List<KpiRecordEntity> findAllByWorkspaceIdAndPeriod(Long workspaceId, String period);
}
