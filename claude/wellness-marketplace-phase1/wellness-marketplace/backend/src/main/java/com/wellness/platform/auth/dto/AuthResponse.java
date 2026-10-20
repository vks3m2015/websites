package com.wellness.platform.auth.dto;

import java.util.List;
import java.util.UUID;

public record AuthResponse(
        UUID userId,
        String name,
        List<String> roles,
        String accessToken,
        long accessTokenExpiresInSeconds,
        String refreshToken
) {}
