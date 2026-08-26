package uz.taskapp.sales;

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
import uz.taskapp.sales.dto.CreateDealRequest;
import uz.taskapp.sales.dto.DealResponse;
import uz.taskapp.sales.dto.UpdateDealRequest;

import java.util.List;

@RestController
@RequestMapping("/api/deals")
public class DealController {
    private final DealService dealService;

    public DealController(DealService dealService) {
        this.dealService = dealService;
    }

    @GetMapping
    List<DealResponse> list(HttpServletRequest request, @RequestParam Long workspaceId,
                             @RequestParam(required = false) DealStage stage) {
        return dealService.list(userId(request), workspaceId, stage);
    }

    @GetMapping("/{dealId}")
    DealResponse detail(HttpServletRequest request, @RequestParam Long workspaceId, @PathVariable Long dealId) {
        return dealService.detail(userId(request), workspaceId, dealId);
    }

    @PostMapping
    ResponseEntity<DealResponse> create(HttpServletRequest request, @Valid @RequestBody CreateDealRequest body) {
        return ResponseEntity.status(HttpStatus.CREATED).body(dealService.create(userId(request), body));
    }

    @PutMapping("/{dealId}")
    DealResponse update(HttpServletRequest request, @RequestParam Long workspaceId,
                         @PathVariable Long dealId, @Valid @RequestBody UpdateDealRequest body) {
        return dealService.update(userId(request), workspaceId, dealId, body);
    }

    @PatchMapping("/{dealId}/stage")
    DealResponse changeStage(HttpServletRequest request, @RequestParam Long workspaceId,
                              @PathVariable Long dealId, @Valid @RequestBody ChangeStageRequest body) {
        return dealService.changeStage(userId(request), workspaceId, dealId, body.stage());
    }

    @DeleteMapping("/{dealId}")
    ResponseEntity<Void> delete(HttpServletRequest request, @RequestParam Long workspaceId, @PathVariable Long dealId) {
        dealService.delete(userId(request), workspaceId, dealId);
        return ResponseEntity.noContent().build();
    }

    private Long userId(HttpServletRequest request) {
        return (Long) request.getAttribute(AuthInterceptor.USER_ID_ATTRIBUTE);
    }

    public record ChangeStageRequest(@NotNull DealStage stage) {}
}
