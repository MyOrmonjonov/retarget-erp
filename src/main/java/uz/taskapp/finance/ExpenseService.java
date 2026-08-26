package uz.taskapp.finance;

import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import uz.taskapp.common.ApiException;
import uz.taskapp.finance.dto.CreateExpenseRequest;
import uz.taskapp.finance.dto.ExpenseResponse;
import uz.taskapp.finance.dto.UpdateExpenseRequest;
import uz.taskapp.user.UserEntity;
import uz.taskapp.user.UserRepository;
import uz.taskapp.workspace.WorkspaceMemberRepository;

import java.time.LocalDate;
import java.util.List;

@Service
public class ExpenseService {
    private final ExpenseRepository expenseRepository;
    private final WorkspaceMemberRepository memberRepository;
    private final UserRepository userRepository;

    public ExpenseService(ExpenseRepository expenseRepository, WorkspaceMemberRepository memberRepository,
                           UserRepository userRepository) {
        this.expenseRepository = expenseRepository;
        this.memberRepository = memberRepository;
        this.userRepository = userRepository;
    }

    @Transactional(readOnly = true)
    public List<ExpenseResponse> list(Long currentUserId, Long workspaceId, ExpenseCategory category,
                                       LocalDate from, LocalDate to) {
        requireMembership(workspaceId, currentUserId);
        List<ExpenseEntity> expenses;
        if (from != null && to != null) {
            expenses = expenseRepository.findAllByWorkspaceIdAndDateBetweenOrderByDateDesc(workspaceId, from, to);
        } else if (category != null) {
            expenses = expenseRepository.findAllByWorkspaceIdAndCategoryOrderByDateDesc(workspaceId, category);
        } else {
            expenses = expenseRepository.findAllByWorkspaceIdOrderByDateDesc(workspaceId);
        }
        return expenses.stream().map(expense -> toResponse(expense)).toList();
    }

    @Transactional(readOnly = true)
    public ExpenseResponse detail(Long currentUserId, Long workspaceId, Long expenseId) {
        requireMembership(workspaceId, currentUserId);
        return toResponse(findWithinWorkspace(expenseId, workspaceId));
    }

    @Transactional
    public ExpenseResponse create(Long currentUserId, CreateExpenseRequest request) {
        requireMembership(request.workspaceId(), currentUserId);
        ExpenseEntity expense = new ExpenseEntity(request.workspaceId(), request.title(), request.amount(),
                request.currency(), request.category(), request.date(), request.description(), request.receiptUrl());
        return toResponse(expenseRepository.save(expense));
    }

    @Transactional
    public ExpenseResponse update(Long currentUserId, Long workspaceId, Long expenseId, UpdateExpenseRequest request) {
        requireMembership(workspaceId, currentUserId);
        ExpenseEntity expense = findWithinWorkspace(expenseId, workspaceId);
        expense.update(request.title(), request.amount(), request.currency(), request.category(), request.date(),
                request.description(), request.receiptUrl());
        return toResponse(expense);
    }

    @Transactional
    public ExpenseResponse approve(Long currentUserId, Long workspaceId, Long expenseId) {
        requireMembership(workspaceId, currentUserId);
        ExpenseEntity expense = findWithinWorkspace(expenseId, workspaceId);
        expense.approve(currentUserId);
        return toResponse(expense);
    }

    @Transactional
    public void delete(Long currentUserId, Long workspaceId, Long expenseId) {
        requireMembership(workspaceId, currentUserId);
        expenseRepository.delete(findWithinWorkspace(expenseId, workspaceId));
    }

    private ExpenseResponse toResponse(ExpenseEntity expense) {
        String approvedByName = expense.getApprovedBy() == null ? null
                : userRepository.findById(expense.getApprovedBy()).map(this::displayName).orElse(null);
        return ExpenseResponse.from(expense, approvedByName);
    }

    private String displayName(UserEntity user) {
        return user.getLastName() == null || user.getLastName().isBlank()
                ? user.getFirstName()
                : user.getFirstName() + " " + user.getLastName();
    }

    private ExpenseEntity findWithinWorkspace(Long expenseId, Long workspaceId) {
        return expenseRepository.findByIdAndWorkspaceId(expenseId, workspaceId)
                .orElseThrow(() -> new ApiException(HttpStatus.NOT_FOUND, "EXPENSE_NOT_FOUND",
                        "Xarajat topilmadi: " + expenseId));
    }

    private void requireMembership(Long workspaceId, Long userId) {
        if (!memberRepository.existsByWorkspaceIdAndUserIdAndActiveTrueAndTemporarilyBlockedFalse(workspaceId, userId)) {
            throw new ApiException(HttpStatus.FORBIDDEN, "WORKSPACE_ACCESS_DENIED", "Ish maydoniga kirishga ruxsat yo'q");
        }
    }
}
