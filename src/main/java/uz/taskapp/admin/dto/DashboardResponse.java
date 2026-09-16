package uz.taskapp.admin.dto;

import java.math.BigDecimal;
import java.util.List;

public record DashboardResponse(
        int totalWorkspaces,
        int activeCount,
        int expiredCount,
        int neverPaidCount,
        BigDecimal totalRevenue,
        BigDecimal revenueThisMonth,
        List<MonthlyRevenuePoint> revenueByMonth,
        List<WorkspaceSummaryResponse> expiringSoon,
        List<PaymentResponse> recentPayments
) {
    public record MonthlyRevenuePoint(String month, BigDecimal amount) {}
}
