package uz.taskapp.project;

import jakarta.servlet.http.HttpServletRequest;
import jakarta.validation.Valid;
import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
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
import uz.taskapp.project.dto.CreateProjectRequest;
import uz.taskapp.project.dto.ProjectResponse;
import uz.taskapp.project.dto.UpdateProjectRequest;

import java.util.List;

@RestController
@RequestMapping("/api/projects")
public class ProjectController {
    private final ProjectService projectService;

    public ProjectController(ProjectService projectService) {
        this.projectService = projectService;
    }

    @GetMapping
    List<ProjectResponse> list(HttpServletRequest request, @RequestParam Long workspaceId,
                                @RequestParam(required = false) ProjectStatus status) {
        return projectService.list(userId(request), workspaceId, status);
    }

    @GetMapping("/{projectId}")
    ProjectResponse detail(HttpServletRequest request, @RequestParam Long workspaceId, @PathVariable Long projectId) {
        return projectService.detail(userId(request), workspaceId, projectId);
    }

    @PostMapping
    ResponseEntity<ProjectResponse> create(HttpServletRequest request, @Valid @RequestBody CreateProjectRequest body) {
        ProjectResponse created = projectService.create(userId(request), body);
        return ResponseEntity.status(HttpStatus.CREATED).body(created);
    }

    @PutMapping("/{projectId}")
    ProjectResponse update(HttpServletRequest request, @RequestParam Long workspaceId,
                            @PathVariable Long projectId, @Valid @RequestBody UpdateProjectRequest body) {
        return projectService.update(userId(request), workspaceId, projectId, body);
    }

    @PatchMapping("/{projectId}/status")
    ProjectResponse changeStatus(HttpServletRequest request, @RequestParam Long workspaceId,
                                  @PathVariable Long projectId, @Valid @RequestBody ChangeStatusRequest body) {
        return projectService.changeStatus(userId(request), workspaceId, projectId, body.status());
    }

    @PatchMapping("/{projectId}/progress")
    ProjectResponse updateProgress(HttpServletRequest request, @RequestParam Long workspaceId,
                                    @PathVariable Long projectId, @Valid @RequestBody UpdateProgressRequest body) {
        return projectService.updateProgress(userId(request), workspaceId, projectId, body.progress());
    }

    @PatchMapping("/{projectId}/report")
    ProjectResponse updateReport(HttpServletRequest request, @RequestParam Long workspaceId,
                                  @PathVariable Long projectId, @RequestBody UpdateReportRequest body) {
        return projectService.updateReport(userId(request), workspaceId, projectId,
                body.reportBudget(), body.reportLeads(), body.reportCpl(), body.reportSales(), body.reportRoi());
    }

    @DeleteMapping("/{projectId}")
    ResponseEntity<Void> delete(HttpServletRequest request, @RequestParam Long workspaceId, @PathVariable Long projectId) {
        projectService.delete(userId(request), workspaceId, projectId);
        return ResponseEntity.noContent().build();
    }

    private Long userId(HttpServletRequest request) {
        return (Long) request.getAttribute(AuthInterceptor.USER_ID_ATTRIBUTE);
    }

    public record UpdateReportRequest(java.math.BigDecimal reportBudget, Integer reportLeads,
                                       java.math.BigDecimal reportCpl, Integer reportSales,
                                       java.math.BigDecimal reportRoi) {}

    public record ChangeStatusRequest(@NotNull ProjectStatus status) {}
    public record UpdateProgressRequest(@NotNull @Min(0) @Max(100) Integer progress) {}
}
