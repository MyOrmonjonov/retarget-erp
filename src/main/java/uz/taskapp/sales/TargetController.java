package uz.taskapp.sales;

import jakarta.servlet.http.HttpServletRequest;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import uz.taskapp.auth.AuthInterceptor;
import uz.taskapp.sales.dto.TargetResponse;
import uz.taskapp.sales.dto.UpsertTargetRequest;

import java.util.List;

@RestController
@RequestMapping("/api/targets")
public class TargetController {
    private final TargetService targetService;

    public TargetController(TargetService targetService) {
        this.targetService = targetService;
    }

    @GetMapping
    List<TargetResponse> list(HttpServletRequest request, @RequestParam Long workspaceId,
                               @RequestParam(required = false) Long employeeId,
                               @RequestParam(required = false) String period) {
        if (employeeId != null) {
            return targetService.listForEmployee(userId(request), workspaceId, employeeId);
        }
        return targetService.listForPeriod(userId(request), workspaceId, period);
    }

    @PostMapping
    ResponseEntity<TargetResponse> upsert(HttpServletRequest request, @Valid @RequestBody UpsertTargetRequest body) {
        return ResponseEntity.ok(targetService.upsert(userId(request), body));
    }

    @DeleteMapping("/{targetId}")
    ResponseEntity<Void> delete(HttpServletRequest request, @RequestParam Long workspaceId, @PathVariable Long targetId) {
        targetService.delete(userId(request), workspaceId, targetId);
        return ResponseEntity.noContent().build();
    }

    private Long userId(HttpServletRequest request) {
        return (Long) request.getAttribute(AuthInterceptor.USER_ID_ATTRIBUTE);
    }
}
