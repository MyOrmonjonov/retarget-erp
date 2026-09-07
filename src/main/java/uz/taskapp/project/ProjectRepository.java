package uz.taskapp.project;

import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface ProjectRepository extends JpaRepository<ProjectEntity, Long> {

    List<ProjectEntity> findAllByWorkspaceId(Long workspaceId);

    List<ProjectEntity> findAllByWorkspaceIdAndStatus(Long workspaceId, ProjectStatus status);

    Optional<ProjectEntity> findByIdAndWorkspaceId(Long id, Long workspaceId);

    long countByWorkspaceId(Long workspaceId);

    long countByWorkspaceIdAndStatus(Long workspaceId, ProjectStatus status);
}
