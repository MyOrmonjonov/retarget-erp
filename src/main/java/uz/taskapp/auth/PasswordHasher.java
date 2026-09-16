package uz.taskapp.auth;

import javax.crypto.SecretKeyFactory;
import javax.crypto.spec.PBEKeySpec;
import java.security.MessageDigest;
import java.security.NoSuchAlgorithmException;
import java.security.SecureRandom;
import java.security.spec.InvalidKeySpecException;
import java.util.Base64;

/** PBKDF2-based password hashing for the admin panel - no external crypto dependency needed
 * since the app deliberately dropped Spring Security. Stored as "iterations:saltB64:hashB64". */
public final class PasswordHasher {
    private static final int ITERATIONS = 210_000;
    private static final int KEY_LENGTH_BITS = 256;

    private PasswordHasher() {
    }

    public static String hash(String rawPassword) {
        byte[] salt = new byte[16];
        new SecureRandom().nextBytes(salt);
        byte[] hash = pbkdf2(rawPassword, salt, ITERATIONS);
        return ITERATIONS + ":" + Base64.getEncoder().encodeToString(salt) + ":" + Base64.getEncoder().encodeToString(hash);
    }

    public static boolean matches(String rawPassword, String stored) {
        String[] parts = stored.split(":", 3);
        if (parts.length != 3) return false;
        try {
            int iterations = Integer.parseInt(parts[0]);
            byte[] salt = Base64.getDecoder().decode(parts[1]);
            byte[] expected = Base64.getDecoder().decode(parts[2]);
            byte[] actual = pbkdf2(rawPassword, salt, iterations);
            return MessageDigest.isEqual(expected, actual);
        } catch (RuntimeException exception) {
            return false;
        }
    }

    private static byte[] pbkdf2(String password, byte[] salt, int iterations) {
        try {
            PBEKeySpec spec = new PBEKeySpec(password.toCharArray(), salt, iterations, KEY_LENGTH_BITS);
            SecretKeyFactory factory = SecretKeyFactory.getInstance("PBKDF2WithHmacSHA256");
            return factory.generateSecret(spec).getEncoded();
        } catch (InvalidKeySpecException | NoSuchAlgorithmException exception) {
            throw new IllegalStateException("PBKDF2WithHmacSHA256 mavjud emas", exception);
        }
    }
}
