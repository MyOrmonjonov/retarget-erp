package uz.taskapp.finance;

import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface InvoiceRepository extends JpaRepository<InvoiceEntity, Long> {

    List<InvoiceEntity> findAllByWorkspaceId(Long workspaceId);

    List<InvoiceEntity> findAllByWorkspaceIdAndStatus(Long workspaceId, InvoiceStatus status);

    Optional<InvoiceEntity> findByIdAndWorkspaceId(Long id, Long workspaceId);

    long countByWorkspaceId(Long workspaceId);
}
