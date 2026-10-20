package com.wellness.platform.bookings.repository;

import com.wellness.platform.bookings.entity.Booking;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.UUID;

public interface BookingRepository extends JpaRepository<Booking, UUID> {
    List<Booking> findByProfessionalId(UUID professionalId);
}
