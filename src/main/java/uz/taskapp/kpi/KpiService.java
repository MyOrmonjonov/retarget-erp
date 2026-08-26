package uz.taskapp.kpi;

import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import uz.taskapp.common.ApiException;
import uz.taskapp.kpi.dto.KpiResponse;
import uz.taskapp.kpi.dto.UpsertKpiRequest;
import uz.taskapp.workspace.WorkspaceMemberRepository;

import java.util.List;

@Service
public class KpiService {
    private final KpiRecordRepository kpiRepository;
    private final WorkspaceMemberRepository memberRepository;

    public KpiService(KpiRecordRepository kpiRepository, WorkspaceMemberRepository memberRepository) {
        this.kpiRepository = kpiRepository;
        this.memberRepository = memberRepository;
    }

    @Transactional(readOnly = true)
    public List<KpiResponse> listForEmployee(Long currentUserId, Long workspaceId, Long employeeId) {
        requireMembership(workspaceId, currentUserId);
        return kpiRepository.findAllByWorkspaceIdAndUserIdOrderByPeriodDesc(workspaceId, employeeId).stream()
                .map(KpiResponse::from)
                .toList();
    }

    @Transactional(readOnly = true)
    public List<KpiResponse> listForPeriod(Long currentUserId, Long workspaceId, String period) {
        requireMembership(workspaceId, currentUserId);
        return kpiRepository.findAllByWorkspaceIdAndPeriod(workspaceId, period).stream()
                .map(KpiResponse::from)
                .toList();
    }

    @Transactional
    public KpiResponse upsert(Long currentUserId, UpsertKpiRequest request) {
        requireMembership(request.workspaceId(), currentUserId);
        requireMembership(request.workspaceId(), request.userId());
        KpiRecordEntity kpi = kpiRepository.findByWorkspaceIdAndUserIdAndPeriod(
                        request.workspaceId(), request.userId(), request.period())
                .orElse(null);
        if (kpi == null) {
            kpi = new KpiRecordEntity(request.workspaceId(), request.userId(), request.period(),
                    request.target(), request.actual(), request.score(), request.tasksCompleted(),
                    request.tasksOnTime(), request.qualityScore(), request.collaborationScore());
            kpi = kpiRepository.save(kpi);
        } else {
            kpi.update(request.target(), request.actual(), request.score(), request.tasksCompleted(),
                    request.tasksOnTime(), request.qualityScore(), request.collaborationScore());
        }
        return KpiResponse.from(kpi);
    }

    @Transactional
    public void delete(Long currentUserId, Long workspaceId, Long kpiId) {
        requireMembership(workspaceId, currentUserId);
        KpiRecordEntity kpi = kpiRepository.findByIdAndWorkspaceId(kpiId, workspaceId)
                .orElseThrow(() -> new ApiException(HttpStatus.NOT_FOUND, "KPI_NOT_FOUND", "KPI yozuvi topilmadi: " + kpiId));
        kpiRepository.delete(kpi);
    }

    private void requireMembership(Long workspaceId, Long userId) {
        if (!memberRepository.existsByWorkspaceIdAndUserIdAndActiveTrueAndTemporarilyBlockedFalse(workspaceId, userId)) {
            throw new ApiException(HttpStatus.FORBIDDEN, "WORKSPACE_ACCESS_DENIED", "Ish maydoniga kirishga ruxsat yo'q");
        }
    }
}
