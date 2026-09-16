package uz.taskapp.admin;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.CommandLineRunner;
import org.springframework.stereotype.Component;
import uz.taskapp.auth.PasswordHasher;

/** Seeds the first admin-panel login from env vars on startup, once, if no admin exists yet -
 * mirrors how the app already bootstraps its first Telegram workspace owner. Without this
 * there would be no way to create the very first admin account (the login endpoint can only
 * verify existing ones, and there is no self-service admin signup by design). */
@Component
public class AdminBootstrapRunner implements CommandLineRunner {
    private static final Logger log = LoggerFactory.getLogger(AdminBootstrapRunner.class);

    private final AdminUserRepository adminUserRepository;
    private final String bootstrapUsername;
    private final String bootstrapPassword;

    public AdminBootstrapRunner(AdminUserRepository adminUserRepository,
                                 @Value("${ADMIN_BOOTSTRAP_USERNAME:}") String bootstrapUsername,
                                 @Value("${ADMIN_BOOTSTRAP_PASSWORD:}") String bootstrapPassword) {
        this.adminUserRepository = adminUserRepository;
        this.bootstrapUsername = bootstrapUsername;
        this.bootstrapPassword = bootstrapPassword;
    }

    @Override
    public void run(String... args) {
        if (adminUserRepository.count() > 0) return;
        if (bootstrapUsername.isBlank() || bootstrapPassword.isBlank()) return;
        adminUserRepository.save(new AdminUserEntity(bootstrapUsername, PasswordHasher.hash(bootstrapPassword)));
        log.info("Admin panel: bootstrapped first admin user '{}'", bootstrapUsername);
    }
}
