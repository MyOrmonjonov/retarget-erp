package uz.taskapp.attendance;

import jakarta.servlet.http.HttpServletRequest;
import jakarta.validation.Valid;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import uz.taskapp.attendance.dto.AttendanceResponse;
import uz.taskapp.attendance.dto.UpsertAttendanceRequest;
import uz.taskapp.auth.AuthInterceptor;

import java.time.LocalDate;
import java.util.List;

@RestController
@RequestMapping("/api/attendance")
public class AttendanceController {
    private final AttendanceService attendanceService;

    public AttendanceController(AttendanceService attendanceService) {
        this.attendanceService = attendanceService;
    }

    @GetMapping
    List<AttendanceResponse> list(HttpServletRequest request, @RequestParam Long workspaceId,
                                   @RequestParam(required = false) Long employeeId,
                                   @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate from,
                                   @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate to) {
        return attendanceService.list(userId(request), workspaceId, employeeId, from, to);
    }

    @PostMapping
    ResponseEntity<AttendanceResponse> upsert(HttpServletRequest request, @Valid @RequestBody UpsertAttendanceRequest body) {
        return ResponseEntity.ok(attendanceService.upsert(userId(request), body));
    }

    @DeleteMapping("/{recordId}")
    ResponseEntity<Void> delete(HttpServletRequest request, @RequestParam Long workspaceId, @PathVariable Long recordId) {
        attendanceService.delete(userId(request), workspaceId, recordId);
        return ResponseEntity.noContent().build();
    }

    private Long userId(HttpServletRequest request) {
        return (Long) request.getAttribute(AuthInterceptor.USER_ID_ATTRIBUTE);
    }
}
