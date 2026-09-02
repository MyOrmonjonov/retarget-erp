package uz.taskapp.finance;

import jakarta.servlet.http.HttpServletRequest;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import uz.taskapp.auth.AuthInterceptor;

import java.time.YearMonth;

@RestController
@RequestMapping("/api/finance/dashboard")
public class FinanceDashboardController {
    private final FinanceDashboardService financeDashboardService;

    public FinanceDashboardController(FinanceDashboardService financeDashboardService) {
        this.financeDashboardService = financeDashboardService;
    }

    @GetMapping
    FinanceDashboardService.FinanceDashboardResponse overview(HttpServletRequest request, @RequestParam Long workspaceId,
                                                                @RequestParam(required = false) String month) {
        Long userId = (Long) request.getAttribute(AuthInterceptor.USER_ID_ATTRIBUTE);
        YearMonth parsedMonth = month == null || month.isBlank() ? null : YearMonth.parse(month);
        return financeDashboardService.compute(userId, workspaceId, parsedMonth);
    }
}
