package com.wellness.platform.customers.dto;

import java.util.UUID;

public record CustomerProfileResponse(
        UUID id,
        String name,
        String profilePhotoUrl,
        String preferredArea
) {}
