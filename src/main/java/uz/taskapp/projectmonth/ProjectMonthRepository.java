package uz.taskapp.projectmonth;

import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface ProjectMonthRepository extends JpaRepository<ProjectMonthEntity, Long> {
    List<ProjectMonthEntity> findAllByProjectId(Long projectId);
    Optional<ProjectMonthEntity> findByProjectIdAndMonthKey(Long projectId, String monthKey);
}
