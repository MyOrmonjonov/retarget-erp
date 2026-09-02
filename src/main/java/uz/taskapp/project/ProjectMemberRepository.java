package uz.taskapp.project;

import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Collection;
import java.util.List;

public interface ProjectMemberRepository extends JpaRepository<ProjectMemberEntity, ProjectMemberId> {
    List<ProjectMemberEntity> findAllByIdProjectIdIn(Collection<Long> projectIds);
    List<ProjectMemberEntity> findAllByIdProjectId(Long projectId);
    boolean existsByIdProjectIdAndIdUserId(Long projectId, Long userId);
    void deleteByIdProjectIdAndIdUserId(Long projectId, Long userId);
    void deleteAllByIdProjectId(Long projectId);
}
