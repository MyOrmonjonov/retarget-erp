package uz.taskapp.finance.dto;

import uz.taskapp.finance.ExpenseCategory;
import uz.taskapp.finance.ExpenseEntity;

import java.math.BigDecimal;
import java.time.Instant;
import java.time.LocalDate;

public record ExpenseResponse(
        Long id,
        Long workspaceId,
        String title,
        BigDecimal amount,
        String currency,
        ExpenseCategory category,
        LocalDate date,
        String description,
        String receiptUrl,
        Long approvedBy,
        String approvedByName,
        Instant approvedAt,
        Instant createdAt,
        Instant updatedAt
) {
    public static ExpenseResponse from(ExpenseEntity expense, String approvedByName) {
        return new ExpenseResponse(
                expense.getId(),
                expense.getWorkspaceId(),
                expense.getTitle(),
                expense.getAmount(),
                expense.getCurrency(),
                expense.getCategory(),
                expense.getDate(),
                expense.getDescription(),
                expense.getReceiptUrl(),
                expense.getApprovedBy(),
                approvedByName,
                expense.getApprovedAt(),
                expense.getCreatedAt(),
                expense.getUpdatedAt()
        );
    }
}
