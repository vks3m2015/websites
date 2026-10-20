package com.wellness.platform.professionals.dto;

import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.Size;

public record UpdateProfessionalProfileRequest(
        @Size(max = 150) String name,
        @Size(max = 20) String gender,
        @Min(0) Integer experienceYears,
        @Size(max = 4000) String about,
        @Size(max = 255) String languages,
        @Size(max = 500) String areasServed
) {}
