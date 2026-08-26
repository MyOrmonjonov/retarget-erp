package uz.taskapp.shooting;

import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Collection;
import java.util.List;

public interface ShootingEventTeamMemberRepository extends JpaRepository<ShootingEventTeamMemberEntity, ShootingEventTeamMemberId> {

    List<ShootingEventTeamMemberEntity> findAllByIdEventIdIn(Collection<Long> eventIds);

    void deleteAllByIdEventId(Long eventId);
}
