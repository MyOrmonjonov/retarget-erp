package org.example.crm.customer.dto;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;

public record CustomerRequest(
        @NotBlank(message = "full name is required")
        String fullName,

        @NotBlank(message = "phone is required")
        String phone,

        @Email(message = "email must be valid")
        String email
) {
}
