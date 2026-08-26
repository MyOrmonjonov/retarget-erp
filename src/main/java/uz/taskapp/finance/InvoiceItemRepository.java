package uz.taskapp.finance;

import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface InvoiceItemRepository extends JpaRepository<InvoiceItemEntity, Long> {

    List<InvoiceItemEntity> findAllByInvoiceIdOrderByPositionAsc(Long invoiceId);

    void deleteAllByInvoiceId(Long invoiceId);
}
