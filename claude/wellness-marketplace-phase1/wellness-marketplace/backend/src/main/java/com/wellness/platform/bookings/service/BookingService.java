package com.wellness.platform.bookings.service;

import com.wellness.platform.bookings.entity.Booking;
import com.wellness.platform.bookings.entity.BookingStatus;
import com.wellness.platform.bookings.repository.BookingRepository;
import com.wellness.platform.common.exception.ApiException;
import com.wellness.platform.customers.entity.CustomerProfile;
import com.wellness.platform.customers.repository.CustomerProfileRepository;
import com.wellness.platform.professionals.entity.ProfessionalProfile;
import com.wellness.platform.professionals.repository.ProfessionalProfileRepository;
import com.wellness.platform.servicecatalog.entity.ProfessionalService;
import com.wellness.platform.servicecatalog.repository.ProfessionalServiceRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Propagation;
import org.springframework.transaction.annotation.Transactional;

import java.time.Instant;
import java.util.UUID;

/**
 * Booking creation deliberately does NOT do a "check availability, then insert" sequence in
 * application code - that is racy under concurrent requests. Instead it always attempts the
 * INSERT and lets the database's partial unique index
 * (uq_booking_slot_active ON bookings(professional_id, start_time) WHERE status IN (PENDING,CONFIRMED))
 * be the single source of truth. Postgres serializes concurrent inserts targeting the same
 * unique key: the loser blocks until the winner commits, then fails uniqueness and rolls back.
 * We catch that failure and translate it into a clean 409 the frontend already knows how to render.
 */
@Service
@RequiredArgsConstructor
public class BookingService {

    private final BookingRepository bookingRepository;
    private final CustomerProfileRepository customerProfileRepository;
    private final ProfessionalProfileRepository professionalProfileRepository;
    private final ProfessionalServiceRepository professionalServiceRepository;

    @Transactional(propagation = Propagation.REQUIRES_NEW)
    public Booking createBooking(UUID customerUserId, UUID professionalId, UUID professionalServiceId,
                                  Instant startTime, Instant endTime) {

        CustomerProfile customer = customerProfileRepository.findByUserId(customerUserId)
                .orElseThrow(() -> ApiException.notFound("PROFILE_NOT_FOUND", "Customer profile not found"));
        ProfessionalProfile professional = professionalProfileRepository.findById(professionalId)
                .orElseThrow(() -> ApiException.notFound("PROFESSIONAL_NOT_FOUND", "Professional not found"));
        ProfessionalService offering = professionalServiceRepository.findById(professionalServiceId)
                .orElseThrow(() -> ApiException.notFound("SERVICE_NOT_FOUND", "Service offering not found"));

        Booking booking = new Booking();
        booking.setCustomer(customer);
        booking.setProfessional(professional);
        booking.setProfessionalService(offering);
        booking.setStartTime(startTime);
        booking.setEndTime(endTime);
        booking.setPrice(offering.getPrice());
        booking.setStatus(BookingStatus.PENDING);

        try {
            return bookingRepository.saveAndFlush(booking);
        } catch (DataIntegrityViolationException ex) {
            throw ApiException.conflict("BOOKING_SLOT_UNAVAILABLE",
                    "This slot was just booked by someone else. Please select another available time.");
        }
    }
}
