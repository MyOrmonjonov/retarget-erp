package org.example.crm.customer.dto;

import org.example.crm.customer.Customer;
import org.example.crm.customer.CustomerStatus;

import java.time.LocalDateTime;

public record CustomerResponse(
        Long id,
        String fullName,
        String phone,
        String email,
        CustomerStatus status,
        LocalDateTime createdAt,
        LocalDateTime updatedAt
) {
    public static CustomerResponse from(Customer customer) {
        return new CustomerResponse(
                customer.getId(),
                customer.getFullName(),
                customer.getPhone(),
                customer.getEmail(),
                customer.getStatus(),
                customer.getCreatedAt(),
                customer.getUpdatedAt()
        );
    }
}
