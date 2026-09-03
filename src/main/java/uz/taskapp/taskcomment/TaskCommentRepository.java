package uz.taskapp.taskcomment;

import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface TaskCommentRepository extends JpaRepository<TaskCommentEntity, Long> {
    List<TaskCommentEntity> findAllByTaskIdOrderByCreatedAtAsc(Long taskId);
}
