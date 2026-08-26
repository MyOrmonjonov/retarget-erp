package uz.taskapp.attendance;

import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import uz.taskapp.attendance.dto.AttendanceResponse;
import uz.taskapp.attendance.dto.UpsertAttendanceRequest;
import uz.taskapp.common.ApiException;
import uz.taskapp.workspace.WorkspaceMemberRepository;

import java.time.LocalDate;
import java.util.List;

@Service
public class AttendanceService {
    private final AttendanceRecordRepository attendanceRepository;
    private final WorkspaceMemberRepository memberRepository;

    public AttendanceService(AttendanceRecordRepository attendanceRepository, WorkspaceMemberRepository memberRepository) {
        this.attendanceRepository = attendanceRepository;
        this.memberRepository = memberRepository;
    }

    @Transactional(readOnly = true)
    public List<AttendanceResponse> list(Long currentUserId, Long workspaceId, Long employeeId,
                                          LocalDate from, LocalDate to) {
        requireMembership(workspaceId, currentUserId);
        LocalDate rangeFrom = from == null ? LocalDate.now().withDayOfMonth(1) : from;
        LocalDate rangeTo = to == null ? LocalDate.now() : to;
        List<AttendanceRecordEntity> records = employeeId == null
                ? attendanceRepository.findAllByWorkspaceIdAndDateBetweenOrderByDateDesc(workspaceId, rangeFrom, rangeTo)
                : attendanceRepository.findAllByWorkspaceIdAndUserIdAndDateBetweenOrderByDateDesc(
                        workspaceId, employeeId, rangeFrom, rangeTo);
        return records.stream().map(AttendanceResponse::from).toList();
    }

    @Transactional
    public AttendanceResponse upsert(Long currentUserId, UpsertAttendanceRequest request) {
        requireMembership(request.workspaceId(), currentUserId);
        requireMembership(request.workspaceId(), request.userId());
        AttendanceRecordEntity record = attendanceRepository
                .findByWorkspaceIdAndUserIdAndDate(request.workspaceId(), request.userId(), request.date())
                .orElse(null);
        if (record == null) {
            record = new AttendanceRecordEntity(request.workspaceId(), request.userId(), request.date(),
                    request.checkIn(), request.checkOut(), request.status(), request.notes());
            record = attendanceRepository.save(record);
        } else {
            record.update(request.checkIn(), request.checkOut(), request.status(), request.notes());
        }
        return AttendanceResponse.from(record);
    }

    @Transactional
    public void delete(Long currentUserId, Long workspaceId, Long recordId) {
        requireMembership(workspaceId, currentUserId);
        AttendanceRecordEntity record = attendanceRepository.findByIdAndWorkspaceId(recordId, workspaceId)
                .orElseThrow(() -> new ApiException(HttpStatus.NOT_FOUND, "ATTENDANCE_NOT_FOUND",
                        "Davomat yozuvi topilmadi: " + recordId));
        attendanceRepository.delete(record);
    }

    private void requireMembership(Long workspaceId, Long userId) {
        if (!memberRepository.existsByWorkspaceIdAndUserIdAndActiveTrueAndTemporarilyBlockedFalse(workspaceId, userId)) {
            throw new ApiException(HttpStatus.FORBIDDEN, "WORKSPACE_ACCESS_DENIED", "Ish maydoniga kirishga ruxsat yo'q");
        }
    }
}
