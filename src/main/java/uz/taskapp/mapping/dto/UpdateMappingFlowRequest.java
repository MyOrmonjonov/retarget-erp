package uz.taskapp.mapping.dto;

import jakarta.validation.Valid;
import jakarta.validation.constraints.NotBlank;

import java.util.List;

public record UpdateMappingFlowRequest(
        @NotBlank String name,
        String description,
        @Valid List<StepInput> steps
) {
}
