package uz.taskapp.shooting;

import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import uz.taskapp.common.ApiException;
import uz.taskapp.shooting.dto.CreateShootingEventRequest;
import uz.taskapp.shooting.dto.ShootingEventResponse;
import uz.taskapp.shooting.dto.UpdateShootingEventRequest;
import uz.taskapp.workspace.WorkspaceMemberRepository;

import java.time.LocalDate;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Service
public class ShootingEventService {
    private final ShootingEventRepository eventRepository;
    private final ShootingEventTeamMemberRepository teamMemberRepository;
    private final WorkspaceMemberRepository memberRepository;

    public ShootingEventService(ShootingEventRepository eventRepository,
                                 ShootingEventTeamMemberRepository teamMemberRepository,
                                 WorkspaceMemberRepository memberRepository) {
        this.eventRepository = eventRepository;
        this.teamMemberRepository = teamMemberRepository;
        this.memberRepository = memberRepository;
    }

    @Transactional(readOnly = true)
    public List<ShootingEventResponse> list(Long currentUserId, Long workspaceId, LocalDate from, LocalDate to) {
        requireMembership(workspaceId, currentUserId);
        List<ShootingEventEntity> events = from != null && to != null
                ? eventRepository.findAllByWorkspaceIdAndDateBetweenOrderByDateAsc(workspaceId, from, to)
                : eventRepository.findAllByWorkspaceIdOrderByDateAsc(workspaceId);
        Map<Long, List<Long>> teamsByEvent = teamsFor(events.stream().map(ShootingEventEntity::getId).toList());
        return events.stream()
                .map(event -> ShootingEventResponse.from(event, teamsByEvent.getOrDefault(event.getId(), List.of())))
                .toList();
    }

    @Transactional(readOnly = true)
    public ShootingEventResponse detail(Long currentUserId, Long workspaceId, Long eventId) {
        requireMembership(workspaceId, currentUserId);
        ShootingEventEntity event = findWithinWorkspace(eventId, workspaceId);
        return ShootingEventResponse.from(event, teamOf(eventId));
    }

    @Transactional
    public ShootingEventResponse create(Long currentUserId, CreateShootingEventRequest request) {
        requireMembership(request.workspaceId(), currentUserId);
        ShootingEventEntity event = new ShootingEventEntity(request.workspaceId(), request.title(), request.date(),
                request.startTime(), request.endTime(), request.location(), request.type(), request.description());
        event.linkProject(request.projectId());
        event = eventRepository.save(event);
        saveTeam(event.getId(), request.team());
        return ShootingEventResponse.from(event, teamOf(event.getId()));
    }

    @Transactional
    public ShootingEventResponse update(Long currentUserId, Long workspaceId, Long eventId,
                                         UpdateShootingEventRequest request) {
        requireMembership(workspaceId, currentUserId);
        ShootingEventEntity event = findWithinWorkspace(eventId, workspaceId);
        event.update(request.title(), request.date(), request.startTime(), request.endTime(), request.location(),
                request.type(), request.description());
        event.linkProject(request.projectId());
        teamMemberRepository.deleteAllByIdEventId(event.getId());
        saveTeam(event.getId(), request.team());
        return ShootingEventResponse.from(event, teamOf(event.getId()));
    }

    @Transactional
    public ShootingEventResponse changeStatus(Long currentUserId, Long workspaceId, Long eventId,
                                               ShootingEventStatus status) {
        requireMembership(workspaceId, currentUserId);
        ShootingEventEntity event = findWithinWorkspace(eventId, workspaceId);
        event.changeStatus(status);
        return ShootingEventResponse.from(event, teamOf(event.getId()));
    }

    @Transactional
    public void delete(Long currentUserId, Long workspaceId, Long eventId) {
        requireMembership(workspaceId, currentUserId);
        eventRepository.delete(findWithinWorkspace(eventId, workspaceId));
    }

    private void saveTeam(Long eventId, List<Long> team) {
        if (team == null) return;
        for (Long userId : team) {
            teamMemberRepository.save(new ShootingEventTeamMemberEntity(eventId, userId));
        }
    }

    private List<Long> teamOf(Long eventId) {
        return teamMemberRepository.findAllByIdEventIdIn(List.of(eventId)).stream()
                .map(ShootingEventTeamMemberEntity::getUserId)
                .toList();
    }

    private Map<Long, List<Long>> teamsFor(List<Long> eventIds) {
        if (eventIds.isEmpty()) return Map.of();
        return teamMemberRepository.findAllByIdEventIdIn(eventIds).stream()
                .collect(Collectors.groupingBy(ShootingEventTeamMemberEntity::getEventId,
                        Collectors.mapping(ShootingEventTeamMemberEntity::getUserId, Collectors.toList())));
    }

    private ShootingEventEntity findWithinWorkspace(Long eventId, Long workspaceId) {
        return eventRepository.findByIdAndWorkspaceId(eventId, workspaceId)
                .orElseThrow(() -> new ApiException(HttpStatus.NOT_FOUND, "SHOOTING_EVENT_NOT_FOUND",
                        "Syomka topilmadi: " + eventId));
    }

    private void requireMembership(Long workspaceId, Long userId) {
        if (!memberRepository.existsByWorkspaceIdAndUserIdAndActiveTrueAndTemporarilyBlockedFalse(workspaceId, userId)) {
            throw new ApiException(HttpStatus.FORBIDDEN, "WORKSPACE_ACCESS_DENIED", "Ish maydoniga kirishga ruxsat yo'q");
        }
    }
}
