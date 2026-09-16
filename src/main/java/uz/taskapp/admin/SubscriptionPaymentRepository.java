package uz.taskapp.admin;

import org.springframework.data.jpa.repository.JpaRepository;

import java.time.Instant;
import java.util.List;

public interface SubscriptionPaymentRepository extends JpaRepository<SubscriptionPaymentEntity, Long> {
    List<SubscriptionPaymentEntity> findAllByWorkspaceIdOrderByPaidAtDesc(Long workspaceId);
    List<SubscriptionPaymentEntity> findAllByOrderByPaidAtDesc();
    List<SubscriptionPaymentEntity> findAllByPaidAtAfter(Instant since);
}
