package uz.taskapp.contentplan;

import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface ContentPlanItemRepository extends JpaRepository<ContentPlanItemEntity, Long> {
    List<ContentPlanItemEntity> findAllByProjectIdOrderByDateAsc(Long projectId);
    Optional<ContentPlanItemEntity> findByIdAndProjectId(Long id, Long projectId);
    List<ContentPlanItemEntity> findAllByProjectIdIn(java.util.Collection<Long> projectIds);
}
