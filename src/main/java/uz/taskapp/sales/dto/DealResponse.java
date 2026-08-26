package uz.taskapp.sales.dto;

import uz.taskapp.sales.DealEntity;
import uz.taskapp.sales.DealStage;

import java.math.BigDecimal;
import java.time.Instant;
import java.time.LocalDate;

public record DealResponse(
        Long id,
        Long workspaceId,
        String title,
        String client,
        BigDecimal value,
        DealStage stage,
        int probability,
        Long ownerId,
        String ownerName,
        LocalDate expectedCloseDate,
        String description,
        String contactPerson,
        String contactPhone,
        String contactEmail,
        Instant createdAt,
        Instant updatedAt
) {
    public static DealResponse from(DealEntity deal, String ownerName) {
        return new DealResponse(
                deal.getId(),
                deal.getWorkspaceId(),
                deal.getTitle(),
                deal.getClient(),
                deal.getValue(),
                deal.getStage(),
                deal.getProbability(),
                deal.getOwnerId(),
                ownerName,
                deal.getExpectedCloseDate(),
                deal.getDescription(),
                deal.getContactPerson(),
                deal.getContactPhone(),
                deal.getContactEmail(),
                deal.getCreatedAt(),
                deal.getUpdatedAt()
        );
    }
}
