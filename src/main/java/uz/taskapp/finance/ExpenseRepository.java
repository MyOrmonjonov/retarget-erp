package uz.taskapp.finance;

import org.springframework.data.jpa.repository.JpaRepository;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

public interface ExpenseRepository extends JpaRepository<ExpenseEntity, Long> {

    List<ExpenseEntity> findAllByWorkspaceIdOrderByDateDesc(Long workspaceId);

    List<ExpenseEntity> findAllByWorkspaceIdAndCategoryOrderByDateDesc(Long workspaceId, ExpenseCategory category);

    List<ExpenseEntity> findAllByWorkspaceIdAndDateBetweenOrderByDateDesc(Long workspaceId, LocalDate from, LocalDate to);

    Optional<ExpenseEntity> findByIdAndWorkspaceId(Long id, Long workspaceId);
}
