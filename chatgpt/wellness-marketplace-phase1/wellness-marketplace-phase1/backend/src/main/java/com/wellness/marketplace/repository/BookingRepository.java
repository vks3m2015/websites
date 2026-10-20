package com.wellness.marketplace.repository;
import com.wellness.marketplace.model.*;
import org.springframework.data.jpa.repository.*;
import org.springframework.data.repository.query.Param;
import java.time.LocalDateTime;
import java.util.List;
public interface BookingRepository extends JpaRepository<Booking,Long> {
    List<Booking> findByCustomerIdOrderByStartTimeDesc(Long customerId);
    List<Booking> findByProfessionalUserIdOrderByStartTimeDesc(Long userId);

    @Query("""
      select count(b) from Booking b
      where b.professional.id=:professionalId
      and b.status='CONFIRMED'
      and b.startTime < :endTime
      and b.endTime > :startTime
    """)
    long overlapping(@Param("professionalId") Long professionalId,
                     @Param("startTime") LocalDateTime startTime,
                     @Param("endTime") LocalDateTime endTime);
}
