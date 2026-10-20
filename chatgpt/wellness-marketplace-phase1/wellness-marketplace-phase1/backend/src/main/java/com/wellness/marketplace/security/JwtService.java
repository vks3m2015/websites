package com.wellness.marketplace.security;

import io.jsonwebtoken.*;
import io.jsonwebtoken.security.Keys;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import java.nio.charset.StandardCharsets;
import java.security.Key;
import java.util.Date;

@Service
public class JwtService {
    private final Key key;
    private final long expiration;

    public JwtService(@Value("${app.jwt.secret}") String secret,
                      @Value("${app.jwt.expiration-ms}") long expiration) {
        this.key = Keys.hmacShaKeyFor(secret.getBytes(StandardCharsets.UTF_8));
        this.expiration = expiration;
    }

    public String generate(Long userId, String email, String role) {
        Date now = new Date();
        return Jwts.builder().subject(String.valueOf(userId))
                .claim("email", email).claim("role", role)
                .issuedAt(now).expiration(new Date(now.getTime()+expiration))
                .signWith(key).compact();
    }

    public Claims parse(String token) {
        return Jwts.parser().verifyWith((javax.crypto.SecretKey) key).build()
                .parseSignedClaims(token).getPayload();
    }
}
