package com.wellness.platform.auth.security;

import com.wellness.platform.common.exception.ApiException;
import com.wellness.platform.users.entity.User;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.crypto.bcrypt.BCrypt;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.security.SecureRandom;
import java.time.Instant;
import java.time.temporal.ChronoUnit;
import java.util.Base64;
import java.util.UUID;

/**
 * Refresh tokens are opaque and single-use, rotated on every use.
 * Raw token format returned to the client: "<tokenId>.<secret>".
 * We store the tokenId (for O(1) lookup) and a BCrypt hash of the secret (never the raw secret).
 */
@Service
@RequiredArgsConstructor
public class RefreshTokenService {

    private final RefreshTokenRepository repository;
    private final SecureRandom secureRandom = new SecureRandom();

    @Value("${app.jwt.refresh-token-ttl-days}")
    private long refreshTokenTtlDays;

    public String issue(User user) {
        String secret = generateSecret();
        RefreshToken entity = new RefreshToken();
        entity.setUser(user);
        entity.setTokenHash(BCrypt.hashpw(secret, BCrypt.gensalt()));
        entity.setExpiresAt(Instant.now().plus(refreshTokenTtlDays, ChronoUnit.DAYS));
        entity = repository.save(entity);
        return entity.getId() + "." + secret;
    }

    @Transactional
    public RotationResult rotate(String rawToken) {
        UUID tokenId;
        String secret;
        try {
            int dot = rawToken.indexOf('.');
            tokenId = UUID.fromString(rawToken.substring(0, dot));
            secret = rawToken.substring(dot + 1);
        } catch (Exception e) {
            throw ApiException.unauthorized("INVALID_REFRESH_TOKEN", "Refresh token is malformed");
        }

        RefreshToken existing = repository.findById(tokenId)
                .filter(t -> !t.isRevoked())
                .orElseThrow(() -> ApiException.unauthorized("INVALID_REFRESH_TOKEN", "Refresh token is invalid or already used"));

        if (existing.getExpiresAt().isBefore(Instant.now())) {
            throw ApiException.unauthorized("REFRESH_TOKEN_EXPIRED", "Refresh token has expired, please log in again");
        }
        if (!BCrypt.checkpw(secret, existing.getTokenHash())) {
            existing.setRevoked(true);
            repository.save(existing);
            throw ApiException.unauthorized("INVALID_REFRESH_TOKEN", "Refresh token is invalid");
        }

        existing.setRevoked(true);
        repository.save(existing);

        String newRaw = issue(existing.getUser());
        return new RotationResult(existing.getUser(), newRaw);
    }

    /** Revokes a refresh token on logout so it can no longer be used to mint new access tokens. */
    @Transactional
    public void revoke(String rawToken) {
        try {
            int dot = rawToken.indexOf('.');
            UUID tokenId = UUID.fromString(rawToken.substring(0, dot));
            repository.findById(tokenId).ifPresent(t -> {
                t.setRevoked(true);
                repository.save(t);
            });
        } catch (Exception ignored) {
            // Malformed/unknown token on logout is a no-op, not an error - the goal (no longer usable) already holds.
        }
    }

    private String generateSecret() {
        byte[] bytes = new byte[48];
        secureRandom.nextBytes(bytes);
        return Base64.getUrlEncoder().withoutPadding().encodeToString(bytes);
    }

    public record RotationResult(User user, String newRawRefreshToken) {}
}
