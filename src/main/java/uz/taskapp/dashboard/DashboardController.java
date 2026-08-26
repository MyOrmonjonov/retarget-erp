package uz.taskapp.dashboard;

import jakarta.servlet.http.HttpServletRequest;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import uz.taskapp.auth.AuthInterceptor;

@RestController
@RequestMapping("/api/dashboard")
public class DashboardController {
    private final DashboardService dashboardService;

    public DashboardController(DashboardService dashboardService) {
        this.dashboardService = dashboardService;
    }

    @GetMapping
    DashboardService.DashboardResponse overview(HttpServletRequest request, @RequestParam Long workspaceId) {
        Long userId = (Long) request.getAttribute(AuthInterceptor.USER_ID_ATTRIBUTE);
        return dashboardService.compute(userId, workspaceId);
    }
}
