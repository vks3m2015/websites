package com.wellness.marketplace.repository;
import com.wellness.marketplace.model.ServiceOffering;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;
public interface ServiceRepository extends JpaRepository<ServiceOffering,Long> {
    List<ServiceOffering> findByProfessionalIdAndActiveTrue(Long professionalId);
}
