package uz.taskapp.project;

import jakarta.persistence.Column;
import jakarta.persistence.Embeddable;

import java.io.Serializable;

@Embeddable
public record ProjectMemberId(
        @Column(name = "project_id") Long projectId,
        @Column(name = "user_id") Long userId
) implements Serializable {
    public ProjectMemberId() {
        this(null, null);
    }
}
