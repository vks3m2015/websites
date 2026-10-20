package com.wellness.platform.professionals.dto;

import com.wellness.platform.professionals.entity.ProfessionalStatus;

import java.math.BigDecimal;
import java.util.UUID;

public record ProfessionalProfileResponse(
        UUID id,
        String name,
        String gender,
        Integer experienceYears,
        String about,
        String languages,
        String areasServed,
        String profilePhotoUrl,
        ProfessionalStatus status,
        BigDecimal averageRating,
        Integer reviewCount
) {}
