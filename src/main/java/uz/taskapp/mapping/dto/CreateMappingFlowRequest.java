package uz.taskapp.mapping.dto;

import jakarta.validation.Valid;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

import java.util.List;

public record CreateMappingFlowRequest(
        @NotNull Long workspaceId,
        @NotBlank String name,
        String description,
        @Valid List<StepInput> steps
) {
}
