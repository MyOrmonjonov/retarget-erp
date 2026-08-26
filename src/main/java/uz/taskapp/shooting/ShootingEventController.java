package uz.taskapp.shooting;

import jakarta.servlet.http.HttpServletRequest;
import jakarta.validation.Valid;
import jakarta.validation.constraints.NotNull;
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
import uz.taskapp.shooting.dto.CreateShootingEventRequest;
import uz.taskapp.shooting.dto.ShootingEventResponse;
import uz.taskapp.shooting.dto.UpdateShootingEventRequest;

import java.time.LocalDate;
import java.util.List;

@RestController
@RequestMapping("/api/shooting-events")
public class ShootingEventController {
    private final ShootingEventService eventService;

    public ShootingEventController(ShootingEventService eventService) {
        this.eventService = eventService;
    }

    @GetMapping
    List<ShootingEventResponse> list(HttpServletRequest request, @RequestParam Long workspaceId,
                                      @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate from,
                                      @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate to) {
        return eventService.list(userId(request), workspaceId, from, to);
    }

    @GetMapping("/{eventId}")
    ShootingEventResponse detail(HttpServletRequest request, @RequestParam Long workspaceId, @PathVariable Long eventId) {
        return eventService.detail(userId(request), workspaceId, eventId);
    }

    @PostMapping
    ResponseEntity<ShootingEventResponse> create(HttpServletRequest request,
                                                  @Valid @RequestBody CreateShootingEventRequest body) {
        return ResponseEntity.status(HttpStatus.CREATED).body(eventService.create(userId(request), body));
    }

    @PutMapping("/{eventId}")
    ShootingEventResponse update(HttpServletRequest request, @RequestParam Long workspaceId,
                                  @PathVariable Long eventId, @Valid @RequestBody UpdateShootingEventRequest body) {
        return eventService.update(userId(request), workspaceId, eventId, body);
    }

    @PatchMapping("/{eventId}/status")
    ShootingEventResponse changeStatus(HttpServletRequest request, @RequestParam Long workspaceId,
                                        @PathVariable Long eventId, @Valid @RequestBody ChangeStatusRequest body) {
        return eventService.changeStatus(userId(request), workspaceId, eventId, body.status());
    }

    @DeleteMapping("/{eventId}")
    ResponseEntity<Void> delete(HttpServletRequest request, @RequestParam Long workspaceId, @PathVariable Long eventId) {
        eventService.delete(userId(request), workspaceId, eventId);
        return ResponseEntity.noContent().build();
    }

    private Long userId(HttpServletRequest request) {
        return (Long) request.getAttribute(AuthInterceptor.USER_ID_ATTRIBUTE);
    }

    public record ChangeStatusRequest(@NotNull ShootingEventStatus status) {}
}
