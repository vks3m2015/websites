package com.wellness.platform.professionals.service;

import com.wellness.platform.common.exception.ApiException;
import com.wellness.platform.professionals.dto.ProfessionalProfileResponse;
import com.wellness.platform.professionals.dto.UpdateProfessionalProfileRequest;
import com.wellness.platform.professionals.entity.ProfessionalProfile;
import com.wellness.platform.professionals.entity.ProfessionalStatus;
import com.wellness.platform.professionals.repository.ProfessionalProfileRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.UUID;

@Service
@RequiredArgsConstructor
public class ProfessionalProfileService {

    private final ProfessionalProfileRepository repository;

    public ProfessionalProfileResponse getMyProfile(UUID userId) {
        return toResponse(findByUserId(userId));
    }

    @Transactional
    public ProfessionalProfileResponse updateMyProfile(UUID userId, UpdateProfessionalProfileRequest request) {
        ProfessionalProfile profile = findByUserId(userId);

        if (request.name() != null) profile.setName(request.name());
        if (request.gender() != null) profile.setGender(request.gender());
        if (request.experienceYears() != null) profile.setExperienceYears(request.experienceYears());
        if (request.about() != null) profile.setAbout(request.about());
        if (request.languages() != null) profile.setLanguages(request.languages());
        if (request.areasServed() != null) profile.setAreasServed(request.areasServed());

        // Completing Step 2 information moves a DRAFT profile forward in the onboarding funnel.
        if (profile.getStatus() == ProfessionalStatus.DRAFT
                && profile.getAbout() != null && !profile.getAbout().isBlank()) {
            profile.setStatus(ProfessionalStatus.SUBMITTED);
        }

        return toResponse(repository.save(profile));
    }

    private ProfessionalProfile findByUserId(UUID userId) {
        return repository.findByUserId(userId)
                .orElseThrow(() -> ApiException.notFound("PROFILE_NOT_FOUND", "Professional profile not found"));
    }

    private ProfessionalProfileResponse toResponse(ProfessionalProfile p) {
        return new ProfessionalProfileResponse(
                p.getId(), p.getName(), p.getGender(), p.getExperienceYears(), p.getAbout(),
                p.getLanguages(), p.getAreasServed(), p.getProfilePhotoUrl(), p.getStatus(),
                p.getAverageRating(), p.getReviewCount()
        );
    }
}
