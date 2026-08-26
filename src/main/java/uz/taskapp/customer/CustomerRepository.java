package uz.taskapp.customer;

import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface CustomerRepository extends JpaRepository<CustomerEntity, Long> {

    List<CustomerEntity> findAllByWorkspaceId(Long workspaceId);

    Optional<CustomerEntity> findByIdAndWorkspaceId(Long id, Long workspaceId);

    boolean existsByWorkspaceIdAndPhone(Long workspaceId, String phone);

    Optional<CustomerEntity> findByWorkspaceIdAndTelegramChatId(Long workspaceId, Long telegramChatId);
}
