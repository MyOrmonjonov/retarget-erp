package uz.taskapp.admin;

import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface AdminUserRepository extends JpaRepository<AdminUserEntity, Long> {
    Optional<AdminUserEntity> findByUsername(String username);
    boolean existsByUsername(String username);
}
