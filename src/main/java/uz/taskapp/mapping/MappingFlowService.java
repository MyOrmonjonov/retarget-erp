package uz.taskapp.mapping;

import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import uz.taskapp.common.ApiException;
import uz.taskapp.mapping.dto.CreateMappingFlowRequest;
import uz.taskapp.mapping.dto.MappingFlowResponse;
import uz.taskapp.mapping.dto.StepInput;
import uz.taskapp.mapping.dto.UpdateMappingFlowRequest;
import uz.taskapp.workspace.WorkspaceMemberRepository;

import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Service
public class MappingFlowService {
    private final MappingFlowRepository flowRepository;
    private final MappingStepRepository stepRepository;
    private final MappingStepDependencyRepository dependencyRepository;
    private final WorkspaceMemberRepository memberRepository;

    public MappingFlowService(MappingFlowRepository flowRepository, MappingStepRepository stepRepository,
                               MappingStepDependencyRepository dependencyRepository,
                               WorkspaceMemberRepository memberRepository) {
        this.flowRepository = flowRepository;
        this.stepRepository = stepRepository;
        this.dependencyRepository = dependencyRepository;
        this.memberRepository = memberRepository;
    }

    @Transactional(readOnly = true)
    public List<MappingFlowResponse> list(Long currentUserId, Long workspaceId) {
        requireMembership(workspaceId, currentUserId);
        List<MappingFlowEntity> flows = flowRepository.findAllByWorkspaceId(workspaceId);
        List<Long> flowIds = flows.stream().map(MappingFlowEntity::getId).toList();
        Map<Long, List<MappingStepEntity>> stepsByFlow = flowIds.isEmpty() ? Map.of()
                : stepRepository.findAllByFlowIdInOrderByPositionAsc(flowIds).stream()
                        .collect(Collectors.groupingBy(MappingStepEntity::getFlowId));
        return flows.stream().map(flow -> toResponse(flow, stepsByFlow.getOrDefault(flow.getId(), List.of()))).toList();
    }

    @Transactional(readOnly = true)
    public MappingFlowResponse detail(Long currentUserId, Long workspaceId, Long flowId) {
        requireMembership(workspaceId, currentUserId);
        MappingFlowEntity flow = findWithinWorkspace(flowId, workspaceId);
        return toResponse(flow, stepRepository.findAllByFlowIdOrderByPositionAsc(flow.getId()));
    }

    @Transactional
    public MappingFlowResponse create(Long currentUserId, CreateMappingFlowRequest request) {
        requireMembership(request.workspaceId(), currentUserId);
        MappingFlowEntity flow = flowRepository.save(
                new MappingFlowEntity(request.workspaceId(), request.name(), request.description()));
        List<MappingStepEntity> steps = saveSteps(flow.getId(), request.steps());
        return toResponse(flow, steps);
    }

    @Transactional
    public MappingFlowResponse update(Long currentUserId, Long workspaceId, Long flowId, UpdateMappingFlowRequest request) {
        requireMembership(workspaceId, currentUserId);
        MappingFlowEntity flow = findWithinWorkspace(flowId, workspaceId);
        flow.update(request.name(), request.description());
        List<Long> existingStepIds = stepRepository.findAllByFlowIdOrderByPositionAsc(flow.getId()).stream()
                .map(MappingStepEntity::getId).toList();
        if (!existingStepIds.isEmpty()) {
            dependencyRepository.deleteAllByIdStepIdIn(existingStepIds);
        }
        stepRepository.deleteAllByFlowId(flow.getId());
        List<MappingStepEntity> steps = saveSteps(flow.getId(), request.steps());
        return toResponse(flow, steps);
    }

    @Transactional
    public MappingFlowResponse setActive(Long currentUserId, Long workspaceId, Long flowId, boolean active) {
        requireMembership(workspaceId, currentUserId);
        MappingFlowEntity flow = findWithinWorkspace(flowId, workspaceId);
        flow.setActive(active);
        return toResponse(flow, stepRepository.findAllByFlowIdOrderByPositionAsc(flow.getId()));
    }

    @Transactional
    public void delete(Long currentUserId, Long workspaceId, Long flowId) {
        requireMembership(workspaceId, currentUserId);
        flowRepository.delete(findWithinWorkspace(flowId, workspaceId));
    }

    private List<MappingStepEntity> saveSteps(Long flowId, List<StepInput> stepInputs) {
        if (stepInputs == null || stepInputs.isEmpty()) return List.of();
        List<MappingStepEntity> created = new ArrayList<>();
        int position = 0;
        for (StepInput input : stepInputs) {
            created.add(stepRepository.save(new MappingStepEntity(flowId, input.name(), input.description(),
                    position++, input.department(), input.responsibleRole(), input.estimatedDays())));
        }
        for (int i = 0; i < stepInputs.size(); i++) {
            List<Integer> dependencyIndexes = stepInputs.get(i).dependencyIndexes();
            if (dependencyIndexes == null) continue;
            for (Integer depIndex : dependencyIndexes) {
                if (depIndex == null || depIndex < 0 || depIndex >= created.size() || depIndex == i) {
                    throw new ApiException(HttpStatus.BAD_REQUEST, "MAPPING_STEP_DEPENDENCY_INVALID",
                            "Noto'g'ri bosqich bog'liqligi: " + depIndex);
                }
                dependencyRepository.save(new MappingStepDependencyEntity(created.get(i).getId(), created.get(depIndex).getId()));
            }
        }
        return created;
    }

    private MappingFlowResponse toResponse(MappingFlowEntity flow, List<MappingStepEntity> steps) {
        List<Long> stepIds = steps.stream().map(MappingStepEntity::getId).toList();
        Map<Long, List<Long>> dependenciesByStep = stepIds.isEmpty() ? Map.of()
                : dependencyRepository.findAllByIdStepIdIn(stepIds).stream()
                        .collect(Collectors.groupingBy(MappingStepDependencyEntity::getStepId,
                                Collectors.mapping(MappingStepDependencyEntity::getDependsOnStepId, Collectors.toList())));
        List<MappingFlowResponse.StepResponse> stepResponses = steps.stream()
                .map(step -> MappingFlowResponse.StepResponse.from(step, dependenciesByStep.getOrDefault(step.getId(), List.of())))
                .toList();
        return MappingFlowResponse.from(flow, stepResponses);
    }

    private MappingFlowEntity findWithinWorkspace(Long flowId, Long workspaceId) {
        return flowRepository.findByIdAndWorkspaceId(flowId, workspaceId)
                .orElseThrow(() -> new ApiException(HttpStatus.NOT_FOUND, "MAPPING_FLOW_NOT_FOUND",
                        "Jarayon sxemasi topilmadi: " + flowId));
    }

    private void requireMembership(Long workspaceId, Long userId) {
        if (!memberRepository.existsByWorkspaceIdAndUserIdAndActiveTrueAndTemporarilyBlockedFalse(workspaceId, userId)) {
            throw new ApiException(HttpStatus.FORBIDDEN, "WORKSPACE_ACCESS_DENIED", "Ish maydoniga kirishga ruxsat yo'q");
        }
    }
}
