package com.wellness.platform.servicecatalog.repository;

import com.wellness.platform.servicecatalog.entity.ProfessionalService;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.UUID;

public interface ProfessionalServiceRepository extends JpaRepository<ProfessionalService, UUID> {
}
