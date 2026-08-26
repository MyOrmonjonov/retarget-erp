package uz.taskapp.finance;

import jakarta.servlet.http.HttpServletRequest;
import jakarta.validation.Valid;
import org.springframework.format.annotation.DateTimeFormat;
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
import uz.taskapp.finance.dto.CreateExpenseRequest;
import uz.taskapp.finance.dto.ExpenseResponse;
import uz.taskapp.finance.dto.UpdateExpenseRequest;

import java.time.LocalDate;
import java.util.List;

@RestController
@RequestMapping("/api/expenses")
public class ExpenseController {
    private final ExpenseService expenseService;

    public ExpenseController(ExpenseService expenseService) {
        this.expenseService = expenseService;
    }

    @GetMapping
    List<ExpenseResponse> list(HttpServletRequest request, @RequestParam Long workspaceId,
                                @RequestParam(required = false) ExpenseCategory category,
                                @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate from,
                                @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate to) {
        return expenseService.list(userId(request), workspaceId, category, from, to);
    }

    @GetMapping("/{expenseId}")
    ExpenseResponse detail(HttpServletRequest request, @RequestParam Long workspaceId, @PathVariable Long expenseId) {
        return expenseService.detail(userId(request), workspaceId, expenseId);
    }

    @PostMapping
    ResponseEntity<ExpenseResponse> create(HttpServletRequest request, @Valid @RequestBody CreateExpenseRequest body) {
        return ResponseEntity.status(HttpStatus.CREATED).body(expenseService.create(userId(request), body));
    }

    @PutMapping("/{expenseId}")
    ExpenseResponse update(HttpServletRequest request, @RequestParam Long workspaceId,
                            @PathVariable Long expenseId, @Valid @RequestBody UpdateExpenseRequest body) {
        return expenseService.update(userId(request), workspaceId, expenseId, body);
    }

    @PatchMapping("/{expenseId}/approve")
    ExpenseResponse approve(HttpServletRequest request, @RequestParam Long workspaceId, @PathVariable Long expenseId) {
        return expenseService.approve(userId(request), workspaceId, expenseId);
    }

    @DeleteMapping("/{expenseId}")
    ResponseEntity<Void> delete(HttpServletRequest request, @RequestParam Long workspaceId, @PathVariable Long expenseId) {
        expenseService.delete(userId(request), workspaceId, expenseId);
        return ResponseEntity.noContent().build();
    }

    private Long userId(HttpServletRequest request) {
        return (Long) request.getAttribute(AuthInterceptor.USER_ID_ATTRIBUTE);
    }
}
