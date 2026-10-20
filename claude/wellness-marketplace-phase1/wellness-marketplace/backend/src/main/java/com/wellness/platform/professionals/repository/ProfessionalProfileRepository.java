package com.wellness.platform.professionals.repository;

import com.wellness.platform.professionals.entity.ProfessionalProfile;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;
import java.util.UUID;

public interface ProfessionalProfileRepository extends JpaRepository<ProfessionalProfile, UUID> {
    Optional<ProfessionalProfile> findByUserId(UUID userId);
}
