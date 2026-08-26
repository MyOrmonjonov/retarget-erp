package uz.taskapp.attendance;

import org.springframework.data.jpa.repository.JpaRepository;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

public interface AttendanceRecordRepository extends JpaRepository<AttendanceRecordEntity, Long> {

    List<AttendanceRecordEntity> findAllByWorkspaceIdAndDateBetweenOrderByDateDesc(
            Long workspaceId, LocalDate from, LocalDate to);

    List<AttendanceRecordEntity> findAllByWorkspaceIdAndUserIdAndDateBetweenOrderByDateDesc(
            Long workspaceId, Long userId, LocalDate from, LocalDate to);

    Optional<AttendanceRecordEntity> findByWorkspaceIdAndUserIdAndDate(Long workspaceId, Long userId, LocalDate date);

    Optional<AttendanceRecordEntity> findByIdAndWorkspaceId(Long id, Long workspaceId);
}
