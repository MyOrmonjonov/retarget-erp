package uz.taskapp.taskcomment;

import jakarta.servlet.http.HttpServletRequest;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RestController;
import uz.taskapp.auth.AuthInterceptor;

import java.util.List;

@RestController
public class TaskCommentController {
    private final TaskCommentService commentService;

    public TaskCommentController(TaskCommentService commentService) {
        this.commentService = commentService;
    }

    @GetMapping("/api/tasks/{taskId}/comments")
    List<TaskCommentService.CommentResponse> list(HttpServletRequest request, @PathVariable Long taskId) {
        return commentService.list(userId(request), taskId);
    }

    @PostMapping("/api/tasks/{taskId}/comments")
    ResponseEntity<TaskCommentService.CommentResponse> create(HttpServletRequest request, @PathVariable Long taskId,
                                                               @RequestBody CreateCommentRequest body) {
        var created = commentService.create(userId(request), taskId, body.body());
        return ResponseEntity.status(HttpStatus.CREATED).body(created);
    }

    private Long userId(HttpServletRequest request) {
        return (Long) request.getAttribute(AuthInterceptor.USER_ID_ATTRIBUTE);
    }

    public record CreateCommentRequest(String body) {
    }
}
