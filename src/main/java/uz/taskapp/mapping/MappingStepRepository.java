package uz.taskapp.mapping;

import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface MappingStepRepository extends JpaRepository<MappingStepEntity, Long> {

    List<MappingStepEntity> findAllByFlowIdOrderByPositionAsc(Long flowId);

    List<MappingStepEntity> findAllByFlowIdInOrderByPositionAsc(List<Long> flowIds);

    void deleteAllByFlowId(Long flowId);
}
