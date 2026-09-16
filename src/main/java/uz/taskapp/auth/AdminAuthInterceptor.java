package uz.taskapp.auth;

import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpMethod;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Component;
import org.springframework.web.servlet.HandlerInterceptor;
import uz.taskapp.common.ApiException;

@Component
public class AdminAuthInterceptor implements HandlerInterceptor {
    public static final String ADMIN_ID_ATTRIBUTE = "authenticatedAdminId";

    private final AdminAccessTokenService tokenService;

    public AdminAuthInterceptor(AdminAccessTokenService tokenService) {
        this.tokenService = tokenService;
    }

    @Override
    public boolean preHandle(HttpServletRequest request, HttpServletResponse response, Object handler) {
        if (HttpMethod.OPTIONS.matches(request.getMethod())) {
            return true;
        }
        String header = request.getHeader(HttpHeaders.AUTHORIZATION);
        if (header == null || !header.startsWith("Bearer ")) {
            throw new ApiException(HttpStatus.UNAUTHORIZED, "ADMIN_AUTH_REQUIRED", "Admin sifatida kirish talab qilinadi");
        }
        Long adminId = tokenService.verify(header.substring(7).trim());
        request.setAttribute(ADMIN_ID_ATTRIBUTE, adminId);
        return true;
    }
}
