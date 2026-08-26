package uz.taskapp.customer;

import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import uz.taskapp.common.ApiException;
import uz.taskapp.customer.dto.CreateCustomerRequest;
import uz.taskapp.customer.dto.CustomerResponse;
import uz.taskapp.customer.dto.UpdateCustomerRequest;
import uz.taskapp.workspace.WorkspaceMemberRepository;

import java.util.List;

@Service
public class CustomerService {
    private final CustomerRepository customerRepository;
    private final WorkspaceMemberRepository memberRepository;

    public CustomerService(CustomerRepository customerRepository, WorkspaceMemberRepository memberRepository) {
        this.customerRepository = customerRepository;
        this.memberRepository = memberRepository;
    }

    @Transactional(readOnly = true)
    public List<CustomerResponse> list(Long currentUserId, Long workspaceId) {
        requireMembership(workspaceId, currentUserId);
        return customerRepository.findAllByWorkspaceId(workspaceId).stream()
                .map(CustomerResponse::from)
                .toList();
    }

    @Transactional(readOnly = true)
    public CustomerResponse detail(Long currentUserId, Long workspaceId, Long customerId) {
        requireMembership(workspaceId, currentUserId);
        return CustomerResponse.from(findWithinWorkspace(customerId, workspaceId));
    }

    @Transactional
    public CustomerResponse create(Long currentUserId, CreateCustomerRequest request) {
        requireMembership(request.workspaceId(), currentUserId);
        if (customerRepository.existsByWorkspaceIdAndPhone(request.workspaceId(), request.phone())) {
            throw new ApiException(HttpStatus.CONFLICT, "CUSTOMER_PHONE_TAKEN",
                    "Bu telefon raqami bilan mijoz allaqachon mavjud: " + request.phone());
        }
        CustomerEntity customer = new CustomerEntity(request.workspaceId(), request.fullName(),
                request.phone(), request.email());
        return CustomerResponse.from(customerRepository.save(customer));
    }

    @Transactional
    public CustomerResponse update(Long currentUserId, Long workspaceId, Long customerId, UpdateCustomerRequest request) {
        requireMembership(workspaceId, currentUserId);
        CustomerEntity customer = findWithinWorkspace(customerId, workspaceId);
        customer.update(request.fullName(), request.phone(), request.email());
        return CustomerResponse.from(customer);
    }

    @Transactional
    public CustomerResponse changeStatus(Long currentUserId, Long workspaceId, Long customerId, CustomerStatus status) {
        requireMembership(workspaceId, currentUserId);
        CustomerEntity customer = findWithinWorkspace(customerId, workspaceId);
        customer.changeStatus(status);
        return CustomerResponse.from(customer);
    }

    @Transactional
    public void delete(Long currentUserId, Long workspaceId, Long customerId) {
        requireMembership(workspaceId, currentUserId);
        customerRepository.delete(findWithinWorkspace(customerId, workspaceId));
    }

    private CustomerEntity findWithinWorkspace(Long customerId, Long workspaceId) {
        return customerRepository.findByIdAndWorkspaceId(customerId, workspaceId)
                .orElseThrow(() -> new ApiException(HttpStatus.NOT_FOUND, "CUSTOMER_NOT_FOUND",
                        "Mijoz topilmadi: " + customerId));
    }

    private void requireMembership(Long workspaceId, Long userId) {
        if (!memberRepository.existsByWorkspaceIdAndUserIdAndActiveTrueAndTemporarilyBlockedFalse(workspaceId, userId)) {
            throw new ApiException(HttpStatus.FORBIDDEN, "WORKSPACE_ACCESS_DENIED", "Ish maydoniga kirishga ruxsat yo'q");
        }
    }
}
