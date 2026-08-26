package uz.taskapp.finance.dto;

import uz.taskapp.finance.InvoiceEntity;
import uz.taskapp.finance.InvoiceItemEntity;
import uz.taskapp.finance.InvoiceStatus;

import java.math.BigDecimal;
import java.time.Instant;
import java.time.LocalDate;
import java.util.List;

public record InvoiceResponse(
        Long id,
        Long workspaceId,
        String number,
        Long clientId,
        String clientName,
        BigDecimal amount,
        String currency,
        InvoiceStatus status,
        LocalDate issueDate,
        LocalDate dueDate,
        List<Item> items,
        String notes,
        Instant createdAt,
        Instant updatedAt
) {
    public record Item(String description, BigDecimal quantity, BigDecimal unitPrice, BigDecimal total) {
        public static Item from(InvoiceItemEntity item) {
            return new Item(item.getDescription(), item.getQuantity(), item.getUnitPrice(), item.getTotal());
        }
    }

    public static InvoiceResponse from(InvoiceEntity invoice, List<InvoiceItemEntity> items) {
        return new InvoiceResponse(
                invoice.getId(),
                invoice.getWorkspaceId(),
                invoice.getNumber(),
                invoice.getClientId(),
                invoice.getClientName(),
                invoice.getAmount(),
                invoice.getCurrency(),
                invoice.getStatus(),
                invoice.getIssueDate(),
                invoice.getDueDate(),
                items.stream().map(Item::from).toList(),
                invoice.getNotes(),
                invoice.getCreatedAt(),
                invoice.getUpdatedAt()
        );
    }
}
