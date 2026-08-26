package uz.taskapp.employee;

import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface EmployeeProfileRepository extends JpaRepository<EmployeeProfileEntity, Long> {

    List<EmployeeProfileEntity> findAllByWorkspaceId(Long workspaceId);

    Optional<EmployeeProfileEntity> findByIdAndWorkspaceId(Long id, Long workspaceId);

    Optional<EmployeeProfileEntity> findByWorkspaceIdAndUserId(Long workspaceId, Long userId);

    boolean existsByWorkspaceIdAndUserId(Long workspaceId, Long userId);
}
