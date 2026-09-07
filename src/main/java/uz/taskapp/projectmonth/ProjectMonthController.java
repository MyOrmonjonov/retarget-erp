package uz.taskapp.projectmonth;

import jakarta.servlet.http.HttpServletRequest;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import uz.taskapp.auth.AuthInterceptor;

import java.util.List;

@RestController
public class ProjectMonthController {
    private final ProjectMonthService monthService;

    public ProjectMonthController(ProjectMonthService monthService) {
        this.monthService = monthService;
    }

    @GetMapping("/api/projects/{projectId}/months")
    List<ProjectMonthService.ProjectMonthResponse> list(HttpServletRequest request, @RequestParam Long workspaceId,
                                                          @PathVariable Long projectId) {
        return monthService.list(userId(request), workspaceId, projectId);
    }

    @PutMapping("/api/projects/{projectId}/months/{monthKey}")
    ResponseEntity<ProjectMonthService.ProjectMonthResponse> upsert(
            HttpServletRequest request, @RequestParam Long workspaceId, @PathVariable Long projectId,
            @PathVariable String monthKey, @RequestBody(required = false) ProjectMonthService.ProjectMonthUpsertRequest body) {
        var result = monthService.upsert(userId(request), workspaceId, projectId, monthKey, body);
        return ResponseEntity.status(HttpStatus.OK).body(result);
    }

    @DeleteMapping("/api/projects/{projectId}/months/{monthKey}")
    ResponseEntity<Void> delete(HttpServletRequest request, @RequestParam Long workspaceId,
                                 @PathVariable Long projectId, @PathVariable String monthKey) {
        monthService.delete(userId(request), workspaceId, projectId, monthKey);
        return ResponseEntity.noContent().build();
    }

    private Long userId(HttpServletRequest request) {
        return (Long) request.getAttribute(AuthInterceptor.USER_ID_ATTRIBUTE);
    }
}
