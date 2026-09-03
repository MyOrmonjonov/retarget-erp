package uz.taskapp.contentplan;

import jakarta.servlet.http.HttpServletRequest;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import uz.taskapp.auth.AuthInterceptor;

import java.util.List;

@RestController
public class ContentPlanController {
    private final ContentPlanService contentPlanService;

    public ContentPlanController(ContentPlanService contentPlanService) {
        this.contentPlanService = contentPlanService;
    }

    @GetMapping("/api/projects/{projectId}/content-plan")
    List<ContentPlanService.ContentPlanItemResponse> list(HttpServletRequest request, @RequestParam Long workspaceId,
                                                           @PathVariable Long projectId) {
        return contentPlanService.list(userId(request), workspaceId, projectId);
    }

    @PostMapping("/api/projects/{projectId}/content-plan")
    ResponseEntity<ContentPlanService.ContentPlanItemResponse> create(
            HttpServletRequest request, @RequestParam Long workspaceId, @PathVariable Long projectId,
            @RequestBody ContentPlanService.ContentPlanItemRequest body) {
        var created = contentPlanService.create(userId(request), workspaceId, projectId, body);
        return ResponseEntity.status(HttpStatus.CREATED).body(created);
    }

    @PutMapping("/api/projects/{projectId}/content-plan/{itemId}")
    ContentPlanService.ContentPlanItemResponse update(
            HttpServletRequest request, @RequestParam Long workspaceId, @PathVariable Long projectId,
            @PathVariable Long itemId, @RequestBody ContentPlanService.ContentPlanItemRequest body) {
        return contentPlanService.update(userId(request), workspaceId, projectId, itemId, body);
    }

    @DeleteMapping("/api/projects/{projectId}/content-plan/{itemId}")
    ResponseEntity<Void> delete(HttpServletRequest request, @RequestParam Long workspaceId,
                                 @PathVariable Long projectId, @PathVariable Long itemId) {
        contentPlanService.delete(userId(request), workspaceId, projectId, itemId);
        return ResponseEntity.noContent().build();
    }

    private Long userId(HttpServletRequest request) {
        return (Long) request.getAttribute(AuthInterceptor.USER_ID_ATTRIBUTE);
    }
}
