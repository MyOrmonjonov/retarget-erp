package uz.taskapp.customer.dto;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

public record CreateCustomerRequest(
        @NotNull Long workspaceId,
        @NotBlank String fullName,
        @NotBlank String phone,
        @Email String email
) {
}
