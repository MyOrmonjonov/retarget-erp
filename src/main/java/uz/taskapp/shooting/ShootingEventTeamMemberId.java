package uz.taskapp.shooting;

import jakarta.persistence.Column;
import jakarta.persistence.Embeddable;

import java.io.Serializable;

@Embeddable
public record ShootingEventTeamMemberId(
        @Column(name = "event_id") Long eventId,
        @Column(name = "user_id") Long userId
) implements Serializable {
    public ShootingEventTeamMemberId() {
        this(null, null);
    }
}
