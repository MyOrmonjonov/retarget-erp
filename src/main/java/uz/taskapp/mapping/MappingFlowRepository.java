package uz.taskapp.mapping;

import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface MappingFlowRepository extends JpaRepository<MappingFlowEntity, Long> {

    List<MappingFlowEntity> findAllByWorkspaceId(Long workspaceId);

    Optional<MappingFlowEntity> findByIdAndWorkspaceId(Long id, Long workspaceId);
}
