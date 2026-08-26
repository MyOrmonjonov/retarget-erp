package uz.taskapp.finance;

import jakarta.servlet.http.HttpServletRequest;
import jakarta.validation.Valid;
import jakarta.validation.constraints.NotNull;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import uz.taskapp.auth.AuthInterceptor;
import uz.taskapp.finance.dto.CreatePaymentRequest;
import uz.taskapp.finance.dto.PaymentResponse;
import uz.taskapp.finance.dto.UpdatePaymentRequest;

import java.util.List;

@RestController
@RequestMapping("/api/payments")
public class PaymentController {
    private final PaymentService paymentService;

    public PaymentController(PaymentService paymentService) {
        this.paymentService = paymentService;
    }

    @GetMapping
    List<PaymentResponse> list(HttpServletRequest request, @RequestParam Long workspaceId,
                                @RequestParam(required = false) PaymentStatus status) {
        return paymentService.list(userId(request), workspaceId, status);
    }

    @GetMapping("/{paymentId}")
    PaymentResponse detail(HttpServletRequest request, @RequestParam Long workspaceId, @PathVariable Long paymentId) {
        return paymentService.detail(userId(request), workspaceId, paymentId);
    }

    @PostMapping
    ResponseEntity<PaymentResponse> create(HttpServletRequest request, @Valid @RequestBody CreatePaymentRequest body) {
        return ResponseEntity.status(HttpStatus.CREATED).body(paymentService.create(userId(request), body));
    }

    @PutMapping("/{paymentId}")
    PaymentResponse update(HttpServletRequest request, @RequestParam Long workspaceId,
                            @PathVariable Long paymentId, @Valid @RequestBody UpdatePaymentRequest body) {
        return paymentService.update(userId(request), workspaceId, paymentId, body);
    }

    @PatchMapping("/{paymentId}/status")
    PaymentResponse changeStatus(HttpServletRequest request, @RequestParam Long workspaceId,
                                  @PathVariable Long paymentId, @Valid @RequestBody ChangeStatusRequest body) {
        return paymentService.changeStatus(userId(request), workspaceId, paymentId, body.status());
    }

    @DeleteMapping("/{paymentId}")
    ResponseEntity<Void> delete(HttpServletRequest request, @RequestParam Long workspaceId, @PathVariable Long paymentId) {
        paymentService.delete(userId(request), workspaceId, paymentId);
        return ResponseEntity.noContent().build();
    }

    private Long userId(HttpServletRequest request) {
        return (Long) request.getAttribute(AuthInterceptor.USER_ID_ATTRIBUTE);
    }

    public record ChangeStatusRequest(@NotNull PaymentStatus status) {}
}
