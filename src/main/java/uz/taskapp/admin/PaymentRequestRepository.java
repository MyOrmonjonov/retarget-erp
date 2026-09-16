package uz.taskapp.admin;

import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface PaymentRequestRepository extends JpaRepository<PaymentRequestEntity, Long> {
    List<PaymentRequestEntity> findAllByStatusOrderByCreatedAtDesc(String status);
    List<PaymentRequestEntity> findAllByOrderByCreatedAtDesc();
}
