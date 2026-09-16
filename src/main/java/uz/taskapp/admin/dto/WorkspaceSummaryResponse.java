package uz.taskapp.admin.dto;

import java.time.Instant;
import java.time.LocalDate;

public record WorkspaceSummaryResponse(
        Long id,
        String name,
        String ownerName,
        Long ownerTelegramId,
        int memberCount,
        String planCode,
        LocalDate currentPeriodEnd,
        String status,
        Instant createdAt
) {
}
