package com.wellness.platform.professionals.controller;

import com.wellness.platform.auth.security.AuthenticatedPrincipal;
import com.wellness.platform.professionals.dto.ProfessionalProfileResponse;
import com.wellness.platform.professionals.dto.UpdateProfessionalProfileRequest;
import com.wellness.platform.professionals.service.ProfessionalProfileService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/professionals/me")
@RequiredArgsConstructor
public class ProfessionalProfileController {

    private final ProfessionalProfileService service;

    @GetMapping
    @PreAuthorize("hasRole('PROFESSIONAL')")
    public ProfessionalProfileResponse me(@AuthenticationPrincipal AuthenticatedPrincipal principal) {
        return service.getMyProfile(principal.userId());
    }

    @PutMapping
    @PreAuthorize("hasRole('PROFESSIONAL')")
    public ProfessionalProfileResponse update(
            @AuthenticationPrincipal AuthenticatedPrincipal principal,
            @Valid @RequestBody UpdateProfessionalProfileRequest request) {
        return service.updateMyProfile(principal.userId(), request);
    }
}
