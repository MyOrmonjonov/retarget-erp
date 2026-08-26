package uz.taskapp.mapping;

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
import uz.taskapp.mapping.dto.CreateMappingFlowRequest;
import uz.taskapp.mapping.dto.MappingFlowResponse;
import uz.taskapp.mapping.dto.UpdateMappingFlowRequest;

import java.util.List;

@RestController
@RequestMapping("/api/mapping-flows")
public class MappingFlowController {
    private final MappingFlowService flowService;

    public MappingFlowController(MappingFlowService flowService) {
        this.flowService = flowService;
    }

    @GetMapping
    List<MappingFlowResponse> list(HttpServletRequest request, @RequestParam Long workspaceId) {
        return flowService.list(userId(request), workspaceId);
    }

    @GetMapping("/{flowId}")
    MappingFlowResponse detail(HttpServletRequest request, @RequestParam Long workspaceId, @PathVariable Long flowId) {
        return flowService.detail(userId(request), workspaceId, flowId);
    }

    @PostMapping
    ResponseEntity<MappingFlowResponse> create(HttpServletRequest request,
                                                @Valid @RequestBody CreateMappingFlowRequest body) {
        return ResponseEntity.status(HttpStatus.CREATED).body(flowService.create(userId(request), body));
    }

    @PutMapping("/{flowId}")
    MappingFlowResponse update(HttpServletRequest request, @RequestParam Long workspaceId,
                                @PathVariable Long flowId, @Valid @RequestBody UpdateMappingFlowRequest body) {
        return flowService.update(userId(request), workspaceId, flowId, body);
    }

    @PatchMapping("/{flowId}/active")
    MappingFlowResponse setActive(HttpServletRequest request, @RequestParam Long workspaceId,
                                   @PathVariable Long flowId, @Valid @RequestBody SetActiveRequest body) {
        return flowService.setActive(userId(request), workspaceId, flowId, body.isActive());
    }

    @DeleteMapping("/{flowId}")
    ResponseEntity<Void> delete(HttpServletRequest request, @RequestParam Long workspaceId, @PathVariable Long flowId) {
        flowService.delete(userId(request), workspaceId, flowId);
        return ResponseEntity.noContent().build();
    }

    private Long userId(HttpServletRequest request) {
        return (Long) request.getAttribute(AuthInterceptor.USER_ID_ATTRIBUTE);
    }

    public record SetActiveRequest(@NotNull Boolean isActive) {}
}
