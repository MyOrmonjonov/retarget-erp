package uz.taskapp.kpi;

import jakarta.servlet.http.HttpServletRequest;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
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
import uz.taskapp.kpi.dto.KpiResponse;
import uz.taskapp.kpi.dto.UpsertKpiRequest;

import java.util.List;

@RestController
@RequestMapping("/api/kpi")
public class KpiController {
    private final KpiService kpiService;

    public KpiController(KpiService kpiService) {
        this.kpiService = kpiService;
    }

    @GetMapping
    List<KpiResponse> list(HttpServletRequest request, @RequestParam Long workspaceId,
                            @RequestParam(required = false) Long employeeId,
                            @RequestParam(required = false) String period) {
        if (employeeId != null) {
            return kpiService.listForEmployee(userId(request), workspaceId, employeeId);
        }
        return kpiService.listForPeriod(userId(request), workspaceId, period);
    }

    @PostMapping
    ResponseEntity<KpiResponse> upsert(HttpServletRequest request, @Valid @RequestBody UpsertKpiRequest body) {
        return ResponseEntity.status(HttpStatus.OK).body(kpiService.upsert(userId(request), body));
    }

    @DeleteMapping("/{kpiId}")
    ResponseEntity<Void> delete(HttpServletRequest request, @RequestParam Long workspaceId, @PathVariable Long kpiId) {
        kpiService.delete(userId(request), workspaceId, kpiId);
        return ResponseEntity.noContent().build();
    }

    private Long userId(HttpServletRequest request) {
        return (Long) request.getAttribute(AuthInterceptor.USER_ID_ATTRIBUTE);
    }
}
