package com.wellness.marketplace.model;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import java.math.BigDecimal;
import java.time.Instant;
import java.time.LocalDateTime;

@Entity @Table(name="bookings")
@Getter @Setter @NoArgsConstructor
public class Booking {
    @Id @GeneratedValue(strategy=GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(optional=false) @JoinColumn(name="customer_id")
    private User customer;

    @ManyToOne(optional=false) @JoinColumn(name="professional_id")
    private ProfessionalProfile professional;

    @ManyToOne(optional=false) @JoinColumn(name="service_id")
    private ServiceOffering service;

    @Column(nullable=false) private LocalDateTime startTime;
    @Column(nullable=false) private LocalDateTime endTime;
    @Column(nullable=false, precision=10, scale=2) private BigDecimal price;
    @Enumerated(EnumType.STRING) @Column(nullable=false) private BookingStatus status;
    @Column(nullable=false) private Instant createdAt = Instant.now();
}
