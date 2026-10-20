package com.wellness.marketplace.repository;
import com.wellness.marketplace.model.Availability;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;
public interface AvailabilityRepository extends JpaRepository<Availability,Long> {
    List<Availability> findByProfessionalIdOrderByDayOfWeekAscStartTimeAsc(Long professionalId);
}
