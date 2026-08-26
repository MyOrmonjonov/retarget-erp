package org.example.crm.config;

import lombok.RequiredArgsConstructor;
import org.example.crm.auth.AuthService;
import org.springframework.boot.CommandLineRunner;
import org.springframework.context.annotation.Configuration;

@Configuration
@RequiredArgsConstructor
public class DataInitializer implements CommandLineRunner {

    private final AuthService authService;

    @Override
    public void run(String... args) {
        authService.createDefaultUser();
    }
}