package uz.taskapp.mapping.dto;

import uz.taskapp.employee.OrgRole;
import uz.taskapp.mapping.MappingFlowEntity;
import uz.taskapp.mapping.MappingStepEntity;

import java.time.Instant;
import java.util.List;

public record MappingFlowResponse(
        Long id,
        Long workspaceId,
        String name,
        String description,
        boolean isActive,
        List<StepResponse> steps,
        Instant createdAt,
        Instant updatedAt
) {
    public record StepResponse(
            Long id,
            String name,
            String description,
            int order,
            String department,
            OrgRole responsibleRole,
            int estimatedDays,
            List<Long> dependencies
    ) {
        public static StepResponse from(MappingStepEntity step, List<Long> dependencies) {
            return new StepResponse(step.getId(), step.getName(), step.getDescription(), step.getPosition(),
                    step.getDepartment(), step.getResponsibleRole(), step.getEstimatedDays(), dependencies);
        }
    }

    public static MappingFlowResponse from(MappingFlowEntity flow, List<StepResponse> steps) {
        return new MappingFlowResponse(
                flow.getId(),
                flow.getWorkspaceId(),
                flow.getName(),
                flow.getDescription(),
                flow.isActive(),
                steps,
                flow.getCreatedAt(),
                flow.getUpdatedAt()
        );
    }
}
