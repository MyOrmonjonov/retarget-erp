package uz.taskapp.customer.dto;

import uz.taskapp.customer.CustomerEntity;
import uz.taskapp.customer.CustomerStatus;

import java.time.Instant;

public record CustomerResponse(
        Long id,
        Long workspaceId,
        String fullName,
        String phone,
        String email,
        CustomerStatus status,
        Instant createdAt,
        Instant updatedAt
) {
    public static CustomerResponse from(CustomerEntity customer) {
        return new CustomerResponse(
                customer.getId(),
                customer.getWorkspaceId(),
                customer.getFullName(),
                customer.getPhone(),
                customer.getEmail(),
                customer.getStatus(),
                customer.getCreatedAt(),
                customer.getUpdatedAt()
        );
    }
}
