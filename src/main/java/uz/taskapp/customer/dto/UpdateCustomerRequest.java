package uz.taskapp.customer.dto;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;

public record UpdateCustomerRequest(
        @NotBlank String fullName,
        @NotBlank String phone,
        @Email String email
) {
}
