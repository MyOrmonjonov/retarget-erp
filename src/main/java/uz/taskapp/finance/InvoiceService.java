package uz.taskapp.finance;

import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import uz.taskapp.common.ApiException;
import uz.taskapp.finance.dto.CreateInvoiceRequest;
import uz.taskapp.finance.dto.InvoiceItemRequest;
import uz.taskapp.finance.dto.InvoiceResponse;
import uz.taskapp.finance.dto.UpdateInvoiceRequest;
import uz.taskapp.workspace.WorkspaceMemberRepository;

import java.math.BigDecimal;
import java.util.List;

@Service
public class InvoiceService {
    private final InvoiceRepository invoiceRepository;
    private final InvoiceItemRepository invoiceItemRepository;
    private final WorkspaceMemberRepository memberRepository;

    public InvoiceService(InvoiceRepository invoiceRepository, InvoiceItemRepository invoiceItemRepository,
                           WorkspaceMemberRepository memberRepository) {
        this.invoiceRepository = invoiceRepository;
        this.invoiceItemRepository = invoiceItemRepository;
        this.memberRepository = memberRepository;
    }

    @Transactional(readOnly = true)
    public List<InvoiceResponse> list(Long currentUserId, Long workspaceId, InvoiceStatus status) {
        requireMembership(workspaceId, currentUserId);
        List<InvoiceEntity> invoices = status == null
                ? invoiceRepository.findAllByWorkspaceId(workspaceId)
                : invoiceRepository.findAllByWorkspaceIdAndStatus(workspaceId, status);
        return invoices.stream().map(this::toResponse).toList();
    }

    @Transactional(readOnly = true)
    public InvoiceResponse detail(Long currentUserId, Long workspaceId, Long invoiceId) {
        requireMembership(workspaceId, currentUserId);
        return toResponse(findWithinWorkspace(invoiceId, workspaceId));
    }

    @Transactional
    public InvoiceResponse create(Long currentUserId, CreateInvoiceRequest request) {
        requireMembership(request.workspaceId(), currentUserId);
        BigDecimal amount = totalOf(request.items());
        InvoiceEntity invoice = new InvoiceEntity(request.workspaceId(), null, request.clientId(),
                request.clientName(), amount, request.currency(), request.issueDate(), request.dueDate(),
                request.notes());
        invoice = invoiceRepository.save(invoice);
        invoice.assignNumber("INV-" + String.format("%04d", invoice.getId()));
        saveItems(invoice.getId(), request.items());
        return toResponse(invoice);
    }

    @Transactional
    public InvoiceResponse update(Long currentUserId, Long workspaceId, Long invoiceId, UpdateInvoiceRequest request) {
        requireMembership(workspaceId, currentUserId);
        InvoiceEntity invoice = findWithinWorkspace(invoiceId, workspaceId);
        BigDecimal amount = totalOf(request.items());
        invoice.update(request.clientId(), request.clientName(), amount, request.currency(), request.issueDate(),
                request.dueDate(), request.notes());
        invoiceItemRepository.deleteAllByInvoiceId(invoice.getId());
        saveItems(invoice.getId(), request.items());
        return toResponse(invoice);
    }

    @Transactional
    public InvoiceResponse changeStatus(Long currentUserId, Long workspaceId, Long invoiceId, InvoiceStatus status) {
        requireMembership(workspaceId, currentUserId);
        InvoiceEntity invoice = findWithinWorkspace(invoiceId, workspaceId);
        invoice.changeStatus(status);
        return toResponse(invoice);
    }

    @Transactional
    public void delete(Long currentUserId, Long workspaceId, Long invoiceId) {
        requireMembership(workspaceId, currentUserId);
        invoiceRepository.delete(findWithinWorkspace(invoiceId, workspaceId));
    }

    private void saveItems(Long invoiceId, List<InvoiceItemRequest> items) {
        int position = 0;
        for (InvoiceItemRequest item : items) {
            invoiceItemRepository.save(new InvoiceItemEntity(invoiceId, item.description(), item.quantity(),
                    item.unitPrice(), position++));
        }
    }

    private BigDecimal totalOf(List<InvoiceItemRequest> items) {
        return items.stream()
                .map(item -> item.quantity().multiply(item.unitPrice()))
                .reduce(BigDecimal.ZERO, BigDecimal::add);
    }

    private InvoiceResponse toResponse(InvoiceEntity invoice) {
        List<InvoiceItemEntity> items = invoiceItemRepository.findAllByInvoiceIdOrderByPositionAsc(invoice.getId());
        return InvoiceResponse.from(invoice, items);
    }

    private InvoiceEntity findWithinWorkspace(Long invoiceId, Long workspaceId) {
        return invoiceRepository.findByIdAndWorkspaceId(invoiceId, workspaceId)
                .orElseThrow(() -> new ApiException(HttpStatus.NOT_FOUND, "INVOICE_NOT_FOUND",
                        "Hisob-faktura topilmadi: " + invoiceId));
    }

    private void requireMembership(Long workspaceId, Long userId) {
        if (!memberRepository.existsByWorkspaceIdAndUserIdAndActiveTrueAndTemporarilyBlockedFalse(workspaceId, userId)) {
            throw new ApiException(HttpStatus.FORBIDDEN, "WORKSPACE_ACCESS_DENIED", "Ish maydoniga kirishga ruxsat yo'q");
        }
    }
}
