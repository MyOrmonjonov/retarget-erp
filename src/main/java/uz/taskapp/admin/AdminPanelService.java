package uz.taskapp.admin;

import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import uz.taskapp.admin.dto.DashboardResponse;
import uz.taskapp.admin.dto.PaymentRequestResponse;
import uz.taskapp.admin.dto.PaymentResponse;
import uz.taskapp.admin.dto.RecordPaymentRequest;
import uz.taskapp.admin.dto.WorkspaceDetailResponse;
import uz.taskapp.admin.dto.WorkspaceSummaryResponse;
import uz.taskapp.common.ApiException;
import uz.taskapp.user.UserEntity;
import uz.taskapp.user.UserRepository;
import uz.taskapp.workspace.WorkspaceEntity;
import uz.taskapp.workspace.WorkspaceMemberEntity;
import uz.taskapp.workspace.WorkspaceMemberRepository;
import uz.taskapp.workspace.WorkspaceRepository;

import java.math.BigDecimal;
import java.time.Instant;
import java.time.LocalDate;
import java.time.YearMonth;
import java.time.ZoneOffset;
import java.time.temporal.ChronoUnit;
import java.util.Comparator;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;

@Service
public class AdminPanelService {
    private final WorkspaceRepository workspaceRepository;
    private final WorkspaceMemberRepository memberRepository;
    private final UserRepository userRepository;
    private final WorkspaceSubscriptionRepository subscriptionRepository;
    private final SubscriptionPaymentRepository paymentRepository;
    private final PaymentRequestRepository paymentRequestRepository;

    public AdminPanelService(WorkspaceRepository workspaceRepository, WorkspaceMemberRepository memberRepository,
                              UserRepository userRepository, WorkspaceSubscriptionRepository subscriptionRepository,
                              SubscriptionPaymentRepository paymentRepository,
                              PaymentRequestRepository paymentRequestRepository) {
        this.workspaceRepository = workspaceRepository;
        this.memberRepository = memberRepository;
        this.userRepository = userRepository;
        this.subscriptionRepository = subscriptionRepository;
        this.paymentRepository = paymentRepository;
        this.paymentRequestRepository = paymentRequestRepository;
    }

    @Transactional(readOnly = true)
    public List<WorkspaceSummaryResponse> listWorkspaces() {
        return workspaceRepository.findAll().stream()
                .map(this::toSummary)
                .sorted(Comparator.comparing(WorkspaceSummaryResponse::createdAt).reversed())
                .toList();
    }

    @Transactional(readOnly = true)
    public WorkspaceDetailResponse workspaceDetail(Long workspaceId) {
        WorkspaceEntity workspace = findWorkspace(workspaceId);
        WorkspaceSummaryResponse summary = toSummary(workspace);
        List<PaymentResponse> payments = paymentRepository.findAllByWorkspaceIdOrderByPaidAtDesc(workspaceId).stream()
                .map(payment -> PaymentResponse.from(payment, workspace.getName()))
                .toList();
        return new WorkspaceDetailResponse(summary.id(), summary.name(), summary.ownerName(), summary.ownerTelegramId(),
                summary.memberCount(), summary.planCode(), summary.currentPeriodEnd(), summary.status(),
                summary.createdAt(), payments);
    }

    @Transactional
    public WorkspaceDetailResponse recordPayment(Long workspaceId, RecordPaymentRequest request, Long adminId) {
        WorkspaceEntity workspace = findWorkspace(workspaceId);
        String currency = (request.currency() == null || request.currency().isBlank()) ? "UZS" : request.currency();
        paymentRepository.save(new SubscriptionPaymentEntity(workspaceId, request.amount(), currency,
                request.planCode(), request.periodMonths(), request.note(), adminId));

        WorkspaceSubscriptionEntity subscription = subscriptionRepository.findByWorkspaceId(workspaceId).orElse(null);
        LocalDate today = LocalDate.now(ZoneOffset.UTC);
        if (subscription == null) {
            subscriptionRepository.save(new WorkspaceSubscriptionEntity(workspaceId, request.planCode(),
                    today.plusMonths(request.periodMonths())));
        } else {
            subscription.extend(request.planCode(), request.periodMonths(), today);
        }
        return workspaceDetail(workspace.getId());
    }

    /** Workspace owner submits an "I've transferred the money" claim for a card-to-card
     *  payment - stays PENDING until an admin confirms or rejects it in the admin panel. */
    @Transactional
    public PaymentRequestResponse createPaymentRequest(Long userId, Long workspaceId, String planCode,
                                                        int periodMonths, java.math.BigDecimal amount, String currency) {
        WorkspaceMemberEntity membership = memberRepository
                .findByWorkspaceIdAndUserIdAndActiveTrueAndTemporarilyBlockedFalse(workspaceId, userId)
                .orElseThrow(() -> new ApiException(HttpStatus.FORBIDDEN, "WORKSPACE_ACCESS_DENIED",
                        "Ish maydoniga kirishga ruxsat yo'q"));
        if (!"OWNER".equals(membership.getRoleCode())) {
            throw new ApiException(HttpStatus.FORBIDDEN, "PAYMENT_REQUEST_FORBIDDEN",
                    "Faqat ish maydoni egasi to'lov so'rovi yubora oladi");
        }
        WorkspaceEntity workspace = findWorkspace(workspaceId);
        PaymentRequestEntity request = paymentRequestRepository.save(
                new PaymentRequestEntity(workspaceId, userId, planCode, periodMonths, amount, currency));
        UserEntity requester = userRepository.findById(userId).orElse(null);
        return PaymentRequestResponse.from(request, workspace.getName(),
                requester == null ? "—" : displayName(requester));
    }

    @Transactional(readOnly = true)
    public List<PaymentRequestResponse> listPaymentRequests() {
        return paymentRequestRepository.findAllByOrderByCreatedAtDesc().stream()
                .map(this::toPaymentRequestResponse)
                .toList();
    }

    @Transactional
    public PaymentRequestResponse confirmPaymentRequest(Long requestId, Long adminId) {
        PaymentRequestEntity request = paymentRequestRepository.findById(requestId)
                .orElseThrow(() -> new ApiException(HttpStatus.NOT_FOUND, "PAYMENT_REQUEST_NOT_FOUND",
                        "To'lov so'rovi topilmadi"));
        if (!"PENDING".equals(request.getStatus())) {
            throw new ApiException(HttpStatus.CONFLICT, "PAYMENT_REQUEST_ALREADY_DECIDED",
                    "Bu so'rov bo'yicha qaror allaqachon qabul qilingan");
        }
        recordPayment(request.getWorkspaceId(),
                new RecordPaymentRequest(request.getAmount(), request.getCurrency(), request.getPlanCode(),
                        request.getPeriodMonths(), "Karta orqali to'lov tasdiqlandi (so'rov #" + request.getId() + ")"),
                adminId);
        request.confirm(adminId);
        return toPaymentRequestResponse(request);
    }

    @Transactional
    public PaymentRequestResponse rejectPaymentRequest(Long requestId, Long adminId) {
        PaymentRequestEntity request = paymentRequestRepository.findById(requestId)
                .orElseThrow(() -> new ApiException(HttpStatus.NOT_FOUND, "PAYMENT_REQUEST_NOT_FOUND",
                        "To'lov so'rovi topilmadi"));
        if (!"PENDING".equals(request.getStatus())) {
            throw new ApiException(HttpStatus.CONFLICT, "PAYMENT_REQUEST_ALREADY_DECIDED",
                    "Bu so'rov bo'yicha qaror allaqachon qabul qilingan");
        }
        request.reject(adminId);
        return toPaymentRequestResponse(request);
    }

    private PaymentRequestResponse toPaymentRequestResponse(PaymentRequestEntity request) {
        WorkspaceEntity workspace = workspaceRepository.findById(request.getWorkspaceId()).orElse(null);
        UserEntity requester = userRepository.findById(request.getRequestedByUserId()).orElse(null);
        return PaymentRequestResponse.from(request, workspace == null ? "—" : workspace.getName(),
                requester == null ? "—" : displayName(requester));
    }

    @Transactional(readOnly = true)
    public DashboardResponse dashboard() {
        List<WorkspaceSummaryResponse> all = listWorkspaces();
        int active = 0, expired = 0, neverPaid = 0;
        for (WorkspaceSummaryResponse w : all) {
            switch (w.status()) {
                case "ACTIVE" -> active++;
                case "EXPIRED" -> expired++;
                default -> neverPaid++;
            }
        }

        LocalDate today = LocalDate.now(ZoneOffset.UTC);
        List<WorkspaceSummaryResponse> expiringSoon = all.stream()
                .filter(w -> "ACTIVE".equals(w.status()) && !w.currentPeriodEnd().isAfter(today.plusDays(7)))
                .sorted(Comparator.comparing(WorkspaceSummaryResponse::currentPeriodEnd))
                .toList();

        Instant sixMonthsAgo = Instant.now().minus(180, ChronoUnit.DAYS);
        List<SubscriptionPaymentEntity> recentWindowPayments = paymentRepository.findAllByPaidAtAfter(sixMonthsAgo);

        Map<Long, String> workspaceNames = new LinkedHashMap<>();
        for (WorkspaceSummaryResponse w : all) workspaceNames.put(w.id(), w.name());

        BigDecimal totalRevenue = paymentRepository.findAllByOrderByPaidAtDesc().stream()
                .map(SubscriptionPaymentEntity::getAmount).reduce(BigDecimal.ZERO, BigDecimal::add);

        YearMonth thisMonth = YearMonth.now(ZoneOffset.UTC);
        BigDecimal revenueThisMonth = recentWindowPayments.stream()
                .filter(p -> YearMonth.from(p.getPaidAt().atZone(ZoneOffset.UTC)).equals(thisMonth))
                .map(SubscriptionPaymentEntity::getAmount).reduce(BigDecimal.ZERO, BigDecimal::add);

        Map<YearMonth, BigDecimal> byMonth = new LinkedHashMap<>();
        for (int i = 5; i >= 0; i--) byMonth.put(thisMonth.minusMonths(i), BigDecimal.ZERO);
        for (SubscriptionPaymentEntity payment : recentWindowPayments) {
            YearMonth month = YearMonth.from(payment.getPaidAt().atZone(ZoneOffset.UTC));
            byMonth.computeIfPresent(month, (key, existing) -> existing.add(payment.getAmount()));
        }
        List<DashboardResponse.MonthlyRevenuePoint> revenueByMonth = byMonth.entrySet().stream()
                .map(e -> new DashboardResponse.MonthlyRevenuePoint(e.getKey().toString(), e.getValue()))
                .toList();

        List<PaymentResponse> recentPayments = paymentRepository.findAllByOrderByPaidAtDesc().stream()
                .limit(10)
                .map(payment -> PaymentResponse.from(payment, workspaceNames.getOrDefault(payment.getWorkspaceId(), "—")))
                .toList();

        return new DashboardResponse(all.size(), active, expired, neverPaid, totalRevenue, revenueThisMonth,
                revenueByMonth, expiringSoon, recentPayments);
    }

    private WorkspaceSummaryResponse toSummary(WorkspaceEntity workspace) {
        List<WorkspaceMemberEntity> members = memberRepository.findAllByWorkspaceIdAndActiveTrue(workspace.getId());
        UserEntity owner = userRepository.findById(workspace.getOwnerId()).orElse(null);
        WorkspaceSubscriptionEntity subscription = subscriptionRepository.findByWorkspaceId(workspace.getId()).orElse(null);

        LocalDate today = LocalDate.now(ZoneOffset.UTC);
        String status;
        String planCode = null;
        LocalDate currentPeriodEnd = null;
        if (subscription == null) {
            status = "NEW";
        } else {
            planCode = subscription.getPlanCode();
            currentPeriodEnd = subscription.getCurrentPeriodEnd();
            status = currentPeriodEnd.isBefore(today) ? "EXPIRED" : "ACTIVE";
        }

        return new WorkspaceSummaryResponse(
                workspace.getId(),
                workspace.getName(),
                owner == null ? "—" : (owner.getFirstName() + (owner.getLastName() != null ? " " + owner.getLastName() : "")),
                owner == null ? null : owner.getTelegramId(),
                members.size(),
                planCode,
                currentPeriodEnd,
                status,
                // workspaces has no createdAt getter exposed today's summary needs; fall back to
                // "now" ordering is handled by DB id order via findAll(), so use epoch here only
                // if truly absent - see WorkspaceEntity.
                workspaceCreatedAt(workspace)
        );
    }

    private Instant workspaceCreatedAt(WorkspaceEntity workspace) {
        return workspace.getCreatedAt();
    }

    private String displayName(UserEntity user) {
        return user.getFirstName() + (user.getLastName() != null ? " " + user.getLastName() : "");
    }

    private WorkspaceEntity findWorkspace(Long workspaceId) {
        return workspaceRepository.findById(workspaceId)
                .orElseThrow(() -> new ApiException(HttpStatus.NOT_FOUND, "WORKSPACE_NOT_FOUND", "Ish maydoni topilmadi: " + workspaceId));
    }
}
