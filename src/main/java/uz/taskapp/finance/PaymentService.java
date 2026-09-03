package uz.taskapp.finance;

import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import uz.taskapp.common.ApiException;
import uz.taskapp.finance.dto.CreatePaymentRequest;
import uz.taskapp.finance.dto.PaymentResponse;
import uz.taskapp.finance.dto.UpdatePaymentRequest;
import uz.taskapp.workspace.WorkspaceMemberRepository;

import java.time.LocalDate;
import java.util.List;

@Service
public class PaymentService {
    private final PaymentRepository paymentRepository;
    private final InvoiceRepository invoiceRepository;
    private final WorkspaceMemberRepository memberRepository;

    public PaymentService(PaymentRepository paymentRepository, InvoiceRepository invoiceRepository,
                           WorkspaceMemberRepository memberRepository) {
        this.paymentRepository = paymentRepository;
        this.invoiceRepository = invoiceRepository;
        this.memberRepository = memberRepository;
    }

    @Transactional(readOnly = true)
    public List<PaymentResponse> list(Long currentUserId, Long workspaceId, PaymentStatus status) {
        requireMembership(workspaceId, currentUserId);
        List<PaymentEntity> payments = status == null
                ? paymentRepository.findAllByWorkspaceId(workspaceId)
                : paymentRepository.findAllByWorkspaceIdAndStatus(workspaceId, status);
        return payments.stream().map(PaymentResponse::from).toList();
    }

    @Transactional(readOnly = true)
    public PaymentResponse detail(Long currentUserId, Long workspaceId, Long paymentId) {
        requireMembership(workspaceId, currentUserId);
        return PaymentResponse.from(findWithinWorkspace(paymentId, workspaceId));
    }

    @Transactional
    public PaymentResponse create(Long currentUserId, CreatePaymentRequest request) {
        requireMembership(request.workspaceId(), currentUserId);
        if (request.invoiceId() != null) {
            invoiceRepository.findByIdAndWorkspaceId(request.invoiceId(), request.workspaceId())
                    .orElseThrow(() -> new ApiException(HttpStatus.NOT_FOUND, "INVOICE_NOT_FOUND",
                            "Hisob-faktura topilmadi: " + request.invoiceId()));
        }
        PaymentEntity payment = new PaymentEntity(request.workspaceId(), request.invoiceId(), request.clientId(),
                request.clientName(), request.amount(), request.currency(), request.dueDate(), request.method(),
                request.description());
        return PaymentResponse.from(paymentRepository.save(payment));
    }

    @Transactional
    public PaymentResponse update(Long currentUserId, Long workspaceId, Long paymentId, UpdatePaymentRequest request) {
        requireMembership(workspaceId, currentUserId);
        PaymentEntity payment = findWithinWorkspace(paymentId, workspaceId);
        payment.update(request.clientId(), request.clientName(), request.amount(), request.currency(),
                request.dueDate(), request.method(), request.description());
        return PaymentResponse.from(payment);
    }

    @Transactional
    public PaymentResponse changeStatus(Long currentUserId, Long workspaceId, Long paymentId, PaymentStatus status) {
        requireMembership(workspaceId, currentUserId);
        PaymentEntity payment = findWithinWorkspace(paymentId, workspaceId);
        LocalDate paidDate = status == PaymentStatus.PAID ? LocalDate.now() : payment.getPaidDate();
        payment.changeStatus(status, paidDate);
        return PaymentResponse.from(payment);
    }

    @Transactional
    public void delete(Long currentUserId, Long workspaceId, Long paymentId) {
        requireMembership(workspaceId, currentUserId);
        paymentRepository.delete(findWithinWorkspace(paymentId, workspaceId));
    }

    private PaymentEntity findWithinWorkspace(Long paymentId, Long workspaceId) {
        return paymentRepository.findByIdAndWorkspaceId(paymentId, workspaceId)
                .orElseThrow(() -> new ApiException(HttpStatus.NOT_FOUND, "PAYMENT_NOT_FOUND",
                        "To'lov topilmadi: " + paymentId));
    }

    private void requireMembership(Long workspaceId, Long userId) {
        if (!memberRepository.existsByWorkspaceIdAndUserIdAndActiveTrueAndTemporarilyBlockedFalse(workspaceId, userId)) {
            throw new ApiException(HttpStatus.FORBIDDEN, "WORKSPACE_ACCESS_DENIED", "Ish maydoniga kirishga ruxsat yo'q");
        }
    }
}
