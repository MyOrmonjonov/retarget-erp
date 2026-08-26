package uz.taskapp.sales;

import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import uz.taskapp.common.ApiException;
import uz.taskapp.sales.dto.CreateDealRequest;
import uz.taskapp.sales.dto.DealResponse;
import uz.taskapp.sales.dto.UpdateDealRequest;
import uz.taskapp.user.UserEntity;
import uz.taskapp.user.UserRepository;
import uz.taskapp.workspace.WorkspaceMemberRepository;

import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Service
public class DealService {
    private final DealRepository dealRepository;
    private final WorkspaceMemberRepository memberRepository;
    private final UserRepository userRepository;

    public DealService(DealRepository dealRepository, WorkspaceMemberRepository memberRepository,
                        UserRepository userRepository) {
        this.dealRepository = dealRepository;
        this.memberRepository = memberRepository;
        this.userRepository = userRepository;
    }

    @Transactional(readOnly = true)
    public List<DealResponse> list(Long currentUserId, Long workspaceId, DealStage stage) {
        requireMembership(workspaceId, currentUserId);
        List<DealEntity> deals = stage == null
                ? dealRepository.findAllByWorkspaceId(workspaceId)
                : dealRepository.findAllByWorkspaceIdAndStage(workspaceId, stage);
        Map<Long, String> ownerNames = ownerNames(deals);
        return deals.stream().map(deal -> DealResponse.from(deal, ownerNames.get(deal.getOwnerId()))).toList();
    }

    @Transactional(readOnly = true)
    public DealResponse detail(Long currentUserId, Long workspaceId, Long dealId) {
        requireMembership(workspaceId, currentUserId);
        DealEntity deal = findWithinWorkspace(dealId, workspaceId);
        return DealResponse.from(deal, displayName(deal.getOwnerId()));
    }

    @Transactional
    public DealResponse create(Long currentUserId, CreateDealRequest request) {
        requireMembership(request.workspaceId(), currentUserId);
        requireMembership(request.workspaceId(), request.ownerId());
        DealEntity deal = new DealEntity(request.workspaceId(), request.title(), request.client(), request.value(),
                request.probability(), request.ownerId(), request.expectedCloseDate(), request.description(),
                request.contactPerson(), request.contactPhone(), request.contactEmail());
        deal = dealRepository.save(deal);
        return DealResponse.from(deal, displayName(deal.getOwnerId()));
    }

    @Transactional
    public DealResponse update(Long currentUserId, Long workspaceId, Long dealId, UpdateDealRequest request) {
        requireMembership(workspaceId, currentUserId);
        requireMembership(workspaceId, request.ownerId());
        DealEntity deal = findWithinWorkspace(dealId, workspaceId);
        deal.update(request.title(), request.client(), request.value(), request.probability(), request.ownerId(),
                request.expectedCloseDate(), request.description(), request.contactPerson(), request.contactPhone(),
                request.contactEmail());
        return DealResponse.from(deal, displayName(deal.getOwnerId()));
    }

    @Transactional
    public DealResponse changeStage(Long currentUserId, Long workspaceId, Long dealId, DealStage stage) {
        requireMembership(workspaceId, currentUserId);
        DealEntity deal = findWithinWorkspace(dealId, workspaceId);
        deal.changeStage(stage);
        return DealResponse.from(deal, displayName(deal.getOwnerId()));
    }

    @Transactional
    public void delete(Long currentUserId, Long workspaceId, Long dealId) {
        requireMembership(workspaceId, currentUserId);
        dealRepository.delete(findWithinWorkspace(dealId, workspaceId));
    }

    private DealEntity findWithinWorkspace(Long dealId, Long workspaceId) {
        return dealRepository.findByIdAndWorkspaceId(dealId, workspaceId)
                .orElseThrow(() -> new ApiException(HttpStatus.NOT_FOUND, "DEAL_NOT_FOUND", "Bitim topilmadi: " + dealId));
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

    private Map<Long, String> ownerNames(List<DealEntity> deals) {
        List<Long> ownerIds = deals.stream().map(DealEntity::getOwnerId).distinct().toList();
        if (ownerIds.isEmpty()) return Map.of();
        return userRepository.findAllById(ownerIds).stream()
                .collect(Collectors.toMap(UserEntity::getId, this::displayName));
    }
}
