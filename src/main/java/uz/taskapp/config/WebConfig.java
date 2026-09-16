package uz.taskapp.config;

import org.springframework.context.annotation.Configuration;
import org.springframework.web.servlet.config.annotation.CorsRegistry;
import org.springframework.web.servlet.config.annotation.InterceptorRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;
import uz.taskapp.auth.AdminAuthInterceptor;
import uz.taskapp.auth.AuthInterceptor;

@Configuration
public class WebConfig implements WebMvcConfigurer {
    private final AuthInterceptor authInterceptor;
    private final AdminAuthInterceptor adminAuthInterceptor;
    private final AppProperties appProperties;

    public WebConfig(AuthInterceptor authInterceptor, AdminAuthInterceptor adminAuthInterceptor,
                     AppProperties appProperties) {
        this.authInterceptor = authInterceptor;
        this.adminAuthInterceptor = adminAuthInterceptor;
        this.appProperties = appProperties;
    }

    @Override
    public void addInterceptors(InterceptorRegistry registry) {
        registry.addInterceptor(authInterceptor)
                .addPathPatterns("/api/**")
                .excludePathPatterns("/api/auth/telegram", "/api/health", "/api/admin/**");
        registry.addInterceptor(adminAuthInterceptor)
                .addPathPatterns("/api/admin/**")
                .excludePathPatterns("/api/admin/auth/login");
    }

    @Override
    public void addCorsMappings(CorsRegistry registry) {
        // Even though the frontend is normally served from the same origin as this API (both
        // behind the one deployed domain), Spring's CORS check still evaluates the browser's
        // Origin header for every request that carries one - it doesn't special-case
        // same-origin requests just because the registry has a mapping for this path. So the
        // actually-deployed frontend origin must be allow-listed here too, or every request
        // from it gets rejected with a 403 before it ever reaches a controller.
        String[] origins = appProperties.frontendOrigin() == null || appProperties.frontendOrigin().isBlank()
                ? new String[] {"https://*.telegram.org", "https://*.t.me", "http://localhost:*"}
                : new String[] {"https://*.telegram.org", "https://*.t.me", "http://localhost:*", appProperties.frontendOrigin()};
        registry.addMapping("/api/**")
                .allowedOriginPatterns(origins)
                .allowedMethods("GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS")
                .allowedHeaders("*");
    }
}
