package uz.taskapp.admin;

import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import uz.taskapp.auth.AdminAccessTokenService;
import uz.taskapp.auth.PasswordHasher;
import uz.taskapp.common.ApiException;

@Service
public class AdminAuthService {
    private final AdminUserRepository adminUserRepository;
    private final AdminAccessTokenService tokenService;

    public AdminAuthService(AdminUserRepository adminUserRepository, AdminAccessTokenService tokenService) {
        this.adminUserRepository = adminUserRepository;
        this.tokenService = tokenService;
    }

    public LoginResponse login(String username, String password) {
        AdminUserEntity admin = adminUserRepository.findByUsername(username)
                .orElseThrow(this::invalidCredentials);
        if (!PasswordHasher.matches(password, admin.getPasswordHash())) {
            throw invalidCredentials();
        }
        return new LoginResponse(tokenService.issue(admin.getId()), admin.getUsername());
    }

    private ApiException invalidCredentials() {
        return new ApiException(HttpStatus.UNAUTHORIZED, "ADMIN_INVALID_CREDENTIALS", "Login yoki parol noto'g'ri");
    }

    public record LoginResponse(String accessToken, String username) {}
}
