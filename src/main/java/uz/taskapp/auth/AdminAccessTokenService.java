package uz.taskapp.auth;

import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import uz.taskapp.common.ApiException;
import uz.taskapp.config.AppProperties;

import java.nio.charset.StandardCharsets;
import java.time.Clock;
import java.time.Duration;
import java.time.Instant;
import java.util.Base64;

/** Separate token namespace from the Telegram-tenant AccessTokenService so a superadmin token
 * can never be replayed against tenant-workspace endpoints or vice versa - the signing key is
 * derived from APP_AUTH_SECRET with an "admin" namespace, and the payload always starts with
 * the literal "admin:" prefix, checked on verify. */
@Service
public class AdminAccessTokenService {
    private static final String NAMESPACE = "admin-panel";
    private final AppProperties properties;
    private final Clock clock = Clock.systemUTC();

    public AdminAccessTokenService(AppProperties properties) {
        this.properties = properties;
    }

    public String issue(Long adminId) {
        String payload = "admin:" + adminId + ":" + clock.instant().plus(Duration.ofDays(1)).getEpochSecond();
        String encodedPayload = encode(payload.getBytes(StandardCharsets.UTF_8));
        String signature = encode(CryptoSupport.hmacSha256(secret(), encodedPayload));
        return encodedPayload + "." + signature;
    }

    public Long verify(String token) {
        try {
            String[] parts = token.split("\\.", 2);
            if (parts.length != 2) throw unauthorized();
            byte[] expected = CryptoSupport.hmacSha256(secret(), parts[0]);
            byte[] actual = Base64.getUrlDecoder().decode(parts[1]);
            if (!java.security.MessageDigest.isEqual(expected, actual)) throw unauthorized();
            String payload = new String(Base64.getUrlDecoder().decode(parts[0]), StandardCharsets.UTF_8);
            String[] values = payload.split(":", 3);
            if (values.length != 3 || !"admin".equals(values[0])) throw unauthorized();
            long adminId = Long.parseLong(values[1]);
            Instant expiresAt = Instant.ofEpochSecond(Long.parseLong(values[2]));
            if (!expiresAt.isAfter(clock.instant())) throw unauthorized();
            return adminId;
        } catch (ApiException exception) {
            throw exception;
        } catch (RuntimeException exception) {
            throw unauthorized();
        }
    }

    private byte[] secret() {
        return CryptoSupport.hmacSha256(properties.authSecret().getBytes(StandardCharsets.UTF_8), NAMESPACE);
    }

    private String encode(byte[] value) {
        return Base64.getUrlEncoder().withoutPadding().encodeToString(value);
    }

    private ApiException unauthorized() {
        return new ApiException(HttpStatus.UNAUTHORIZED, "ADMIN_TOKEN_INVALID", "Admin sessiyasi yaroqsiz yoki muddati tugagan");
    }
}
