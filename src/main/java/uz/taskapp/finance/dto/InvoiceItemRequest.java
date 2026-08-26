package uz.taskapp.finance.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

import java.math.BigDecimal;

public record InvoiceItemRequest(
        @NotBlank String description,
        @NotNull BigDecimal quantity,
        @NotNull BigDecimal unitPrice
) {
}
