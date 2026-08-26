package uz.taskapp.finance;

import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface PaymentRepository extends JpaRepository<PaymentEntity, Long> {

    List<PaymentEntity> findAllByWorkspaceId(Long workspaceId);

    List<PaymentEntity> findAllByWorkspaceIdAndStatus(Long workspaceId, PaymentStatus status);

    Optional<PaymentEntity> findByIdAndWorkspaceId(Long id, Long workspaceId);
}
