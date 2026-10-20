package com.wellness.platform.customers.controller;

import com.wellness.platform.auth.security.AuthenticatedPrincipal;
import com.wellness.platform.common.exception.ApiException;
import com.wellness.platform.customers.dto.CustomerProfileResponse;
import com.wellness.platform.customers.entity.CustomerProfile;
import com.wellness.platform.customers.repository.CustomerProfileRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/customers")
@RequiredArgsConstructor
public class CustomerProfileController {

    private final CustomerProfileRepository customerProfileRepository;

    @GetMapping("/me")
    @PreAuthorize("hasRole('CUSTOMER')")
    public CustomerProfileResponse me(@AuthenticationPrincipal AuthenticatedPrincipal principal) {
        CustomerProfile profile = customerProfileRepository.findByUserId(principal.userId())
                .orElseThrow(() -> ApiException.notFound("PROFILE_NOT_FOUND", "Customer profile not found"));
        return new CustomerProfileResponse(profile.getId(), profile.getName(), profile.getProfilePhotoUrl(), profile.getPreferredArea());
    }
}
