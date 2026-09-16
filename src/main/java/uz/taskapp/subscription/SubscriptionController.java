package uz.taskapp.subscription;

import jakarta.servlet.http.HttpServletRequest;
import jakarta.validation.Valid;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import uz.taskapp.admin.AdminPanelService;
import uz.taskapp.admin.dto.PaymentRequestResponse;
import uz.taskapp.auth.AuthInterceptor;

import java.math.BigDecimal;

/** Customer-facing side of the card-to-card payment flow - the admin-facing list/confirm/reject
 * endpoints live under /api/admin (see AdminPanelController), gated by the admin session
 * instead of a regular workspace one. */
@RestController
@RequestMapping("/api/subscription")
public class SubscriptionController {
    private final AdminPanelService panelService;

    public SubscriptionController(AdminPanelService panelService) {
        this.panelService = panelService;
    }

    @PostMapping("/payment-requests")
    ResponseEntity<PaymentRequestResponse> createPaymentRequest(HttpServletRequest request,
                                                                  @RequestParam Long workspaceId,
                                                                  @Valid @RequestBody CreatePaymentRequestRequest body) {
        Long userId = (Long) request.getAttribute(AuthInterceptor.USER_ID_ATTRIBUTE);
        PaymentRequestResponse response = panelService.createPaymentRequest(
                userId, workspaceId, body.planCode(), body.periodMonths(), body.amount(), body.currency());
        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }

    public record CreatePaymentRequestRequest(
            @NotBlank String planCode,
            @Min(1) int periodMonths,
            @NotNull @Positive BigDecimal amount,
            String currency
    ) {
    }
}
