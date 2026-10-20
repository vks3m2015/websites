package com.wellness.platform.bookings;

import com.wellness.platform.bookings.entity.Booking;
import com.wellness.platform.bookings.entity.BookingStatus;
import com.wellness.platform.bookings.repository.BookingRepository;
import com.wellness.platform.bookings.service.BookingService;
import com.wellness.platform.common.exception.ApiException;
import com.wellness.platform.customers.entity.CustomerProfile;
import com.wellness.platform.customers.repository.CustomerProfileRepository;
import com.wellness.platform.professionals.entity.ProfessionalProfile;
import com.wellness.platform.professionals.entity.ProfessionalStatus;
import com.wellness.platform.professionals.repository.ProfessionalProfileRepository;
import com.wellness.platform.servicecatalog.entity.ProfessionalService;
import com.wellness.platform.servicecatalog.entity.Service;
import com.wellness.platform.servicecatalog.repository.ProfessionalServiceRepository;
import com.wellness.platform.servicecatalog.repository.ServiceRepository;
import com.wellness.platform.users.entity.Role;
import com.wellness.platform.users.entity.RoleName;
import com.wellness.platform.users.entity.User;
import com.wellness.platform.users.repository.RoleRepository;
import com.wellness.platform.users.repository.UserRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.context.annotation.Import;
import org.springframework.test.context.ActiveProfiles;

import java.math.BigDecimal;
import java.time.Instant;
import java.time.temporal.ChronoUnit;
import java.util.List;
import java.util.UUID;
import java.util.concurrent.CountDownLatch;
import java.util.concurrent.ExecutorService;
import java.util.concurrent.Executors;
import java.util.concurrent.TimeUnit;
import java.util.concurrent.atomic.AtomicInteger;

import static org.assertj.core.api.Assertions.assertThat;

/**
 * Proves the core reliability requirement from the spec: two customers racing to book the
 * SAME professional at the SAME time slot must never both succeed. Exactly one booking wins;
 * the other receives a BOOKING_SLOT_UNAVAILABLE conflict - enforced by the database's unique
 * index, not by application-level locking, so it holds even across multiple app instances.
 */
@SpringBootTest
@Import(TestcontainersConfig.class)
@ActiveProfiles("test")
class BookingConcurrencyTest {

    @Autowired private BookingService bookingService;
    @Autowired private BookingRepository bookingRepository;
    @Autowired private UserRepository userRepository;
    @Autowired private RoleRepository roleRepository;
    @Autowired private CustomerProfileRepository customerProfileRepository;
    @Autowired private ProfessionalProfileRepository professionalProfileRepository;
    @Autowired private ServiceRepository serviceRepository;
    @Autowired private ProfessionalServiceRepository professionalServiceRepository;

    private UUID customerAUserId;
    private UUID customerBUserId;
    private UUID professionalId;
    private UUID professionalServiceId;

    @BeforeEach
    void setUp() {
        Role customerRole = roleRepository.findByName(RoleName.CUSTOMER).orElseThrow();
        Role professionalRole = roleRepository.findByName(RoleName.PROFESSIONAL).orElseThrow();

        User userA = newUser("customerA@test.com", customerRole);
        User userB = newUser("customerB@test.com", customerRole);
        User proUser = newUser("pro@test.com", professionalRole);

        customerAUserId = userA.getId();
        customerBUserId = userB.getId();

        CustomerProfile a = new CustomerProfile();
        a.setUser(userA);
        a.setName("Customer A");
        customerProfileRepository.save(a);

        CustomerProfile b = new CustomerProfile();
        b.setUser(userB);
        b.setName("Customer B");
        customerProfileRepository.save(b);

        ProfessionalProfile pro = new ProfessionalProfile();
        pro.setUser(proUser);
        pro.setName("Test Professional");
        pro.setStatus(ProfessionalStatus.VERIFIED);
        pro = professionalProfileRepository.save(pro);
        professionalId = pro.getId();

        Service massage = new Service();
        massage.setName("Deep Tissue Massage");
        massage.setCategory("Massage");
        massage = serviceRepository.save(massage);

        ProfessionalService offering = new ProfessionalService();
        offering.setProfessional(pro);
        offering.setService(massage);
        offering.setDurationMinutes(60);
        offering.setPrice(new BigDecimal("1500.00"));
        offering = professionalServiceRepository.save(offering);
        professionalServiceId = offering.getId();
    }

    private User newUser(String email, Role role) {
        User u = new User();
        u.setEmail(email);
        u.setPasswordHash("irrelevant-for-this-test");
        u.setRoles(new java.util.HashSet<>(List.of(role)));
        return userRepository.save(u);
    }

    @Test
    void concurrentBookingsForSameSlot_onlyOneSucceeds() throws InterruptedException {
        Instant start = Instant.now().plus(1, ChronoUnit.DAYS).truncatedTo(ChronoUnit.MINUTES);
        Instant end = start.plus(60, ChronoUnit.MINUTES);

        int attempts = 2;
        ExecutorService pool = Executors.newFixedThreadPool(attempts);
        CountDownLatch readyLatch = new CountDownLatch(attempts);
        CountDownLatch goLatch = new CountDownLatch(1);
        AtomicInteger successCount = new AtomicInteger(0);
        AtomicInteger conflictCount = new AtomicInteger(0);

        Runnable customerATask = () -> attemptBooking(customerAUserId, start, end, readyLatch, goLatch, successCount, conflictCount);
        Runnable customerBTask = () -> attemptBooking(customerBUserId, start, end, readyLatch, goLatch, successCount, conflictCount);

        pool.submit(customerATask);
        pool.submit(customerBTask);

        readyLatch.await(5, TimeUnit.SECONDS);
        goLatch.countDown(); // release both threads at (almost) the same instant
        pool.shutdown();
        pool.awaitTermination(15, TimeUnit.SECONDS);

        assertThat(successCount.get()).as("exactly one booking should succeed").isEqualTo(1);
        assertThat(conflictCount.get()).as("the other attempt should be rejected as a conflict").isEqualTo(1);

        List<Booking> activeBookings = bookingRepository.findByProfessionalId(professionalId).stream()
                .filter(b -> b.getStatus() == BookingStatus.PENDING)
                .toList();
        assertThat(activeBookings).hasSize(1);
    }

    private void attemptBooking(UUID customerUserId, Instant start, Instant end,
                                 CountDownLatch readyLatch, CountDownLatch goLatch,
                                 AtomicInteger successCount, AtomicInteger conflictCount) {
        try {
            readyLatch.countDown();
            goLatch.await();
            bookingService.createBooking(customerUserId, professionalId, professionalServiceId, start, end);
            successCount.incrementAndGet();
        } catch (ApiException e) {
            if ("BOOKING_SLOT_UNAVAILABLE".equals(e.getCode())) {
                conflictCount.incrementAndGet();
            }
        } catch (InterruptedException e) {
            Thread.currentThread().interrupt();
        }
    }
}
