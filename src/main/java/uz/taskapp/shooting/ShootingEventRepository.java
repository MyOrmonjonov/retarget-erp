package uz.taskapp.shooting;

import org.springframework.data.jpa.repository.JpaRepository;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

public interface ShootingEventRepository extends JpaRepository<ShootingEventEntity, Long> {

    List<ShootingEventEntity> findAllByWorkspaceIdOrderByDateAsc(Long workspaceId);

    List<ShootingEventEntity> findAllByWorkspaceIdAndDateBetweenOrderByDateAsc(
            Long workspaceId, LocalDate from, LocalDate to);

    Optional<ShootingEventEntity> findByIdAndWorkspaceId(Long id, Long workspaceId);
}
