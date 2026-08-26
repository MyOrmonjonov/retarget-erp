package uz.taskapp.finance.dto;

import jakarta.validation.Valid;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.NotNull;

import java.time.LocalDate;
import java.util.List;

public record CreateInvoiceRequest(
        @NotNull Long workspaceId,
        Long clientId,
        @NotBlank String clientName,
        String currency,
        @NotNull LocalDate issueDate,
        @NotNull LocalDate dueDate,
        String notes,
        @NotEmpty @Valid List<InvoiceItemRequest> items
) {
}
