package org.example.crm.customer;

import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface CustomerRepository extends JpaRepository<Customer, Long> {

    boolean existsByPhone(String phone);

    Optional<Customer> findByTelegramChatId(Long telegramChatId);
}
