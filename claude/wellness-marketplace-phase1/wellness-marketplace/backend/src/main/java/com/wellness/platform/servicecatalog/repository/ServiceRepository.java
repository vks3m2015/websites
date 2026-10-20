package com.wellness.platform.servicecatalog.repository;

import com.wellness.platform.servicecatalog.entity.Service;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.UUID;

public interface ServiceRepository extends JpaRepository<Service, UUID> {
}
