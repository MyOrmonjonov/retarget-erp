package uz.taskapp.employee;

import jakarta.servlet.http.HttpServletRequest;
import jakarta.validation.Valid;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.PositiveOrZero;
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
import uz.taskapp.employee.dto.CreateEmployeeRequest;
import uz.taskapp.employee.dto.EmployeeResponse;
import uz.taskapp.employee.dto.UpdateEmployeeRequest;

import java.util.List;

@RestController
@RequestMapping("/api/employees")
public class EmployeeController {
    private final EmployeeService employeeService;

    public EmployeeController(EmployeeService employeeService) {
        this.employeeService = employeeService;
    }

    @GetMapping
    List<EmployeeResponse> list(HttpServletRequest request, @RequestParam Long workspaceId) {
        return employeeService.list(userId(request), workspaceId);
    }

    @GetMapping("/{employeeId}")
    EmployeeResponse detail(HttpServletRequest request, @RequestParam Long workspaceId, @PathVariable Long employeeId) {
        return employeeService.detail(userId(request), workspaceId, employeeId);
    }

    @PostMapping
    ResponseEntity<EmployeeResponse> create(HttpServletRequest request, @Valid @RequestBody CreateEmployeeRequest body) {
        EmployeeResponse created = employeeService.create(userId(request), body);
        return ResponseEntity.status(HttpStatus.CREATED).body(created);
    }

    @PutMapping("/{employeeId}")
    EmployeeResponse update(HttpServletRequest request, @RequestParam Long workspaceId,
                             @PathVariable Long employeeId, @Valid @RequestBody UpdateEmployeeRequest body) {
        return employeeService.update(userId(request), workspaceId, employeeId, body);
    }

    @PatchMapping("/{employeeId}/status")
    EmployeeResponse changeStatus(HttpServletRequest request, @RequestParam Long workspaceId,
                                   @PathVariable Long employeeId, @Valid @RequestBody ChangeStatusRequest body) {
        return employeeService.changeStatus(userId(request), workspaceId, employeeId, body.status());
    }

    @PatchMapping("/{employeeId}/salary")
    EmployeeResponse updateSalary(HttpServletRequest request, @RequestParam Long workspaceId,
                                   @PathVariable Long employeeId, @Valid @RequestBody UpdateSalaryRequest body) {
        return employeeService.updateSalary(userId(request), workspaceId, employeeId, body.baseSalary());
    }

    @DeleteMapping("/{employeeId}")
    ResponseEntity<Void> delete(HttpServletRequest request, @RequestParam Long workspaceId, @PathVariable Long employeeId) {
        employeeService.delete(userId(request), workspaceId, employeeId);
        return ResponseEntity.noContent().build();
    }

    private Long userId(HttpServletRequest request) {
        return (Long) request.getAttribute(AuthInterceptor.USER_ID_ATTRIBUTE);
    }

    public record ChangeStatusRequest(@NotNull EmployeeStatus status) {}

    public record UpdateSalaryRequest(@NotNull @PositiveOrZero java.math.BigDecimal baseSalary) {}
}
