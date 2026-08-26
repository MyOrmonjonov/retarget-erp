package uz.taskapp.mapping;

import jakarta.persistence.EmbeddedId;
import jakarta.persistence.Entity;
import jakarta.persistence.Table;

@Entity
@Table(name = "mapping_step_dependencies")
public class MappingStepDependencyEntity {
    @EmbeddedId
    private MappingStepDependencyId id;

    protected MappingStepDependencyEntity() {
    }

    public MappingStepDependencyEntity(Long stepId, Long dependsOnStepId) {
        this.id = new MappingStepDependencyId(stepId, dependsOnStepId);
    }

    public Long getStepId() { return id.stepId(); }
    public Long getDependsOnStepId() { return id.dependsOnStepId(); }
}
