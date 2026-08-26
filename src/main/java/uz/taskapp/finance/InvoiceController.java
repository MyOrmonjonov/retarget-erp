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
import uz.taskapp.finance.dto.CreateInvoiceRequest;
import uz.taskapp.finance.dto.InvoiceResponse;
import uz.taskapp.finance.dto.UpdateInvoiceRequest;

import java.util.List;

@RestController
@RequestMapping("/api/invoices")
public class InvoiceController {
    private final InvoiceService invoiceService;

    public InvoiceController(InvoiceService invoiceService) {
        this.invoiceService = invoiceService;
    }

    @GetMapping
    List<InvoiceResponse> list(HttpServletRequest request, @RequestParam Long workspaceId,
                                @RequestParam(required = false) InvoiceStatus status) {
        return invoiceService.list(userId(request), workspaceId, status);
    }

    @GetMapping("/{invoiceId}")
    InvoiceResponse detail(HttpServletRequest request, @RequestParam Long workspaceId, @PathVariable Long invoiceId) {
        return invoiceService.detail(userId(request), workspaceId, invoiceId);
    }

    @PostMapping
    ResponseEntity<InvoiceResponse> create(HttpServletRequest request, @Valid @RequestBody CreateInvoiceRequest body) {
        return ResponseEntity.status(HttpStatus.CREATED).body(invoiceService.create(userId(request), body));
    }

    @PutMapping("/{invoiceId}")
    InvoiceResponse update(HttpServletRequest request, @RequestParam Long workspaceId,
                            @PathVariable Long invoiceId, @Valid @RequestBody UpdateInvoiceRequest body) {
        return invoiceService.update(userId(request), workspaceId, invoiceId, body);
    }

    @PatchMapping("/{invoiceId}/status")
    InvoiceResponse changeStatus(HttpServletRequest request, @RequestParam Long workspaceId,
                                  @PathVariable Long invoiceId, @Valid @RequestBody ChangeStatusRequest body) {
        return invoiceService.changeStatus(userId(request), workspaceId, invoiceId, body.status());
    }

    @DeleteMapping("/{invoiceId}")
    ResponseEntity<Void> delete(HttpServletRequest request, @RequestParam Long workspaceId, @PathVariable Long invoiceId) {
        invoiceService.delete(userId(request), workspaceId, invoiceId);
        return ResponseEntity.noContent().build();
    }

    private Long userId(HttpServletRequest request) {
        return (Long) request.getAttribute(AuthInterceptor.USER_ID_ATTRIBUTE);
    }

    public record ChangeStatusRequest(@NotNull InvoiceStatus status) {}
}
