package uz.taskapp.customer;

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
import uz.taskapp.customer.dto.CreateCustomerRequest;
import uz.taskapp.customer.dto.CustomerResponse;
import uz.taskapp.customer.dto.UpdateCustomerRequest;

import java.util.List;

@RestController
@RequestMapping("/api/customers")
public class CustomerController {
    private final CustomerService customerService;

    public CustomerController(CustomerService customerService) {
        this.customerService = customerService;
    }

    @GetMapping
    List<CustomerResponse> list(HttpServletRequest request, @RequestParam Long workspaceId) {
        return customerService.list(userId(request), workspaceId);
    }

    @GetMapping("/{customerId}")
    CustomerResponse detail(HttpServletRequest request, @RequestParam Long workspaceId, @PathVariable Long customerId) {
        return customerService.detail(userId(request), workspaceId, customerId);
    }

    @PostMapping
    ResponseEntity<CustomerResponse> create(HttpServletRequest request, @Valid @RequestBody CreateCustomerRequest body) {
        CustomerResponse created = customerService.create(userId(request), body);
        return ResponseEntity.status(HttpStatus.CREATED).body(created);
    }

    @PutMapping("/{customerId}")
    CustomerResponse update(HttpServletRequest request, @RequestParam Long workspaceId,
                             @PathVariable Long customerId, @Valid @RequestBody UpdateCustomerRequest body) {
        return customerService.update(userId(request), workspaceId, customerId, body);
    }

    @PatchMapping("/{customerId}/status")
    CustomerResponse changeStatus(HttpServletRequest request, @RequestParam Long workspaceId,
                                   @PathVariable Long customerId, @Valid @RequestBody ChangeStatusRequest body) {
        return customerService.changeStatus(userId(request), workspaceId, customerId, body.status());
    }

    @DeleteMapping("/{customerId}")
    ResponseEntity<Void> delete(HttpServletRequest request, @RequestParam Long workspaceId, @PathVariable Long customerId) {
        customerService.delete(userId(request), workspaceId, customerId);
        return ResponseEntity.noContent().build();
    }

    private Long userId(HttpServletRequest request) {
        return (Long) request.getAttribute(AuthInterceptor.USER_ID_ATTRIBUTE);
    }

    public record ChangeStatusRequest(@NotNull CustomerStatus status) {}
}
