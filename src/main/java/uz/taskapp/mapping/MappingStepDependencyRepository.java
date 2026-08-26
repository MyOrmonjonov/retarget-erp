package uz.taskapp.mapping;

import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Collection;
import java.util.List;

public interface MappingStepDependencyRepository extends JpaRepository<MappingStepDependencyEntity, MappingStepDependencyId> {

    List<MappingStepDependencyEntity> findAllByIdStepIdIn(Collection<Long> stepIds);

    void deleteAllByIdStepIdIn(Collection<Long> stepIds);
}
