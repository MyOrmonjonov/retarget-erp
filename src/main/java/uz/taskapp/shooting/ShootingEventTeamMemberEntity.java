package uz.taskapp.shooting;

import jakarta.persistence.EmbeddedId;
import jakarta.persistence.Entity;
import jakarta.persistence.Table;

@Entity
@Table(name = "shooting_event_team_members")
public class ShootingEventTeamMemberEntity {
    @EmbeddedId
    private ShootingEventTeamMemberId id;

    protected ShootingEventTeamMemberEntity() {
    }

    public ShootingEventTeamMemberEntity(Long eventId, Long userId) {
        this.id = new ShootingEventTeamMemberId(eventId, userId);
    }

    public Long getEventId() { return id.eventId(); }
    public Long getUserId() { return id.userId(); }
}
