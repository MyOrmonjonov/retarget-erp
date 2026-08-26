package uz.taskapp.mapping;

import jakarta.persistence.Column;
import jakarta.persistence.Embeddable;

import java.io.Serializable;

@Embeddable
public record MappingStepDependencyId(
        @Column(name = "step_id") Long stepId,
        @Column(name = "depends_on_step_id") Long dependsOnStepId
) implements Serializable {
    public MappingStepDependencyId() {
        this(null, null);
    }
}
