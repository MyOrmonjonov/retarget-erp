package uz.taskapp.sales;

import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import uz.taskapp.common.ApiException;
import uz.taskapp.sales.dto.TargetResponse;
import uz.taskapp.sales.dto.UpsertTargetRequest;
import uz.taskapp.user.UserEntity;
import uz.taskapp.user.UserRepository;
import uz.taskapp.workspace.WorkspaceMemberRepository;

import java.util.List;

@Service
public class TargetService {
    private final TargetRecordRepository targetRepository;
    private final WorkspaceMemberRepository memberRepository;
    private final UserRepository userRepository;

    public TargetService(TargetRecordRepository targetRepository, WorkspaceMemberRepository memberRepository,
                          UserRepository userRepository) {
        this.targetRepository = targetRepository;
        this.memberRepository = memberRepository;
        this.userRepository = userRepository;
    }

    @Transactional(readOnly = true)
    public List<TargetResponse> listForEmployee(Long currentUserId, Long workspaceId, Long employeeId) {
        requireMembership(workspaceId, currentUserId);
        return targetRepository.findAllByWorkspaceIdAndUserIdOrderByPeriodDesc(workspaceId, employeeId).stream()
                .map(target -> TargetResponse.from(target, displayName(target.getUserId())))
                .toList();
    }

    @Transactional(readOnly = true)
    public List<TargetResponse> listForPeriod(Long currentUserId, Long workspaceId, String period) {
        requireMembership(workspaceId, currentUserId);
        return targetRepository.findAllByWorkspaceIdAndPeriod(workspaceId, period).stream()
                .map(target -> TargetResponse.from(target, displayName(target.getUserId())))
                .toList();
    }

    @Transactional
    public TargetResponse upsert(Long currentUserId, UpsertTargetRequest request) {
        requireMembership(request.workspaceId(), currentUserId);
        requireMembership(request.workspaceId(), request.userId());
        TargetRecordEntity target = targetRepository.findByWorkspaceIdAndUserIdAndPeriod(
                        request.workspaceId(), request.userId(), request.period())
                .orElse(null);
        if (target == null) {
            target = new TargetRecordEntity(request.workspaceId(), request.userId(), request.period(),
                    request.targetAmount(), request.actualAmount(), request.conversionRate(),
                    request.callsCount(), request.meetingsCount(), request.dealsClosed());
            target = targetRepository.save(target);
        } else {
            target.update(request.targetAmount(), request.actualAmount(), request.conversionRate(),
                    request.callsCount(), request.meetingsCount(), request.dealsClosed());
        }
        return TargetResponse.from(target, displayName(target.getUserId()));
    }

    @Transactional
    public void delete(Long currentUserId, Long workspaceId, Long targetId) {
        requireMembership(workspaceId, currentUserId);
        TargetRecordEntity target = targetRepository.findByIdAndWorkspaceId(targetId, workspaceId)
                .orElseThrow(() -> new ApiException(HttpStatus.NOT_FOUND, "TARGET_NOT_FOUND",
                        "Target yozuvi topilmadi: " + targetId));
        targetRepository.delete(target);
    }

    private void requireMembership(Long workspaceId, Long userId) {
        if (!memberRepository.existsByWorkspaceIdAndUserIdAndActiveTrueAndTemporarilyBlockedFalse(workspaceId, userId)) {
            throw new ApiException(HttpStatus.FORBIDDEN, "WORKSPACE_ACCESS_DENIED", "Ish maydoniga kirishga ruxsat yo'q");
        }
    }

    private String displayName(Long userId) {
        return userRepository.findById(userId).map(this::displayName).orElse(null);
    }

    private String displayName(UserEntity user) {
        return user.getLastName() == null || user.getLastName().isBlank()
                ? user.getFirstName()
                : user.getFirstName() + " " + user.getLastName();
    }
}
