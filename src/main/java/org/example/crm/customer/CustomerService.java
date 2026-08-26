package org.example.crm.customer;

import lombok.RequiredArgsConstructor;
import org.example.crm.common.exception.ApiException;
import org.example.crm.customer.dto.CustomerRequest;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class CustomerService {

    private final CustomerRepository customerRepository;

    public List<Customer> findAll() {
        return customerRepository.findAll();
    }

    public Customer findById(Long id) {
        return customerRepository.findById(id)
                .orElseThrow(() -> ApiException.notFound("Customer not found: " + id));
    }

    @Transactional
    public Customer create(CustomerRequest request) {
        if (customerRepository.existsByPhone(request.phone())) {
            throw ApiException.conflict("Customer with this phone already exists: " + request.phone());
        }
        Customer customer = new Customer();
        customer.setFullName(request.fullName());
        customer.setPhone(request.phone());
        customer.setEmail(request.email());
        return customerRepository.save(customer);
    }

    @Transactional
    public Customer update(Long id, CustomerRequest request) {
        Customer customer = findById(id);
        customer.setFullName(request.fullName());
        customer.setPhone(request.phone());
        customer.setEmail(request.email());
        return customer;
    }

    @Transactional
    public void delete(Long id) {
        Customer customer = findById(id);
        customerRepository.delete(customer);
    }
}
