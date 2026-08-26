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
public class AuthInterceptor implements HandlerInterceptor {
    public static final String USER_ID_ATTRIBUTE = "authenticatedUserId";

    private final AccessTokenService accessTokenService;

    public AuthInterceptor(AccessTokenService accessTokenService) {
        this.accessTokenService = accessTokenService;
    }

    @Override
    public boolean preHandle(HttpServletRequest request, HttpServletResponse response, Object handler) {
        if (HttpMethod.OPTIONS.matches(request.getMethod())) {
            // CORS preflight requests never carry the Authorization header (browsers strip it),
            // so they must pass through untouched or every cross-origin authenticated call breaks.
            return true;
        }
        String header = request.getHeader(HttpHeaders.AUTHORIZATION);
        if (header == null || !header.startsWith("Bearer ")) {
            throw new ApiException(HttpStatus.UNAUTHORIZED, "AUTH_REQUIRED", "Telegram orqali kirish talab qilinadi");
        }
        Long userId = accessTokenService.verify(header.substring(7).trim());
        request.setAttribute(USER_ID_ATTRIBUTE, userId);
        return true;
    }
}
