package uz.taskapp.admin;

import jakarta.servlet.http.HttpServletRequest;
import jakarta.validation.Valid;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import uz.taskapp.admin.dto.DashboardResponse;
import uz.taskapp.admin.dto.PaymentRequestResponse;
import uz.taskapp.admin.dto.RecordPaymentRequest;
import uz.taskapp.admin.dto.WorkspaceDetailResponse;
import uz.taskapp.admin.dto.WorkspaceSummaryResponse;
import uz.taskapp.auth.AdminAuthInterceptor;

import java.util.List;

@RestController
@RequestMapping("/api/admin")
public class AdminPanelController {
    private final AdminPanelService panelService;

    public AdminPanelController(AdminPanelService panelService) {
        this.panelService = panelService;
    }

    @GetMapping("/dashboard")
    DashboardResponse dashboard() {
        return panelService.dashboard();
    }

    @GetMapping("/workspaces")
    List<WorkspaceSummaryResponse> workspaces() {
        return panelService.listWorkspaces();
    }

    @GetMapping("/workspaces/{workspaceId}")
    WorkspaceDetailResponse workspaceDetail(@PathVariable Long workspaceId) {
        return panelService.workspaceDetail(workspaceId);
    }

    @PostMapping("/workspaces/{workspaceId}/payments")
    WorkspaceDetailResponse recordPayment(HttpServletRequest request, @PathVariable Long workspaceId,
                                           @Valid @RequestBody RecordPaymentRequest body) {
        Long adminId = (Long) request.getAttribute(AdminAuthInterceptor.ADMIN_ID_ATTRIBUTE);
        return panelService.recordPayment(workspaceId, body, adminId);
    }

    @GetMapping("/payment-requests")
    List<PaymentRequestResponse> paymentRequests() {
        return panelService.listPaymentRequests();
    }

    @PostMapping("/payment-requests/{requestId}/confirm")
    PaymentRequestResponse confirmPaymentRequest(HttpServletRequest request, @PathVariable Long requestId) {
        Long adminId = (Long) request.getAttribute(AdminAuthInterceptor.ADMIN_ID_ATTRIBUTE);
        return panelService.confirmPaymentRequest(requestId, adminId);
    }

    @PostMapping("/payment-requests/{requestId}/reject")
    PaymentRequestResponse rejectPaymentRequest(HttpServletRequest request, @PathVariable Long requestId) {
        Long adminId = (Long) request.getAttribute(AdminAuthInterceptor.ADMIN_ID_ATTRIBUTE);
        return panelService.rejectPaymentRequest(requestId, adminId);
    }
}
