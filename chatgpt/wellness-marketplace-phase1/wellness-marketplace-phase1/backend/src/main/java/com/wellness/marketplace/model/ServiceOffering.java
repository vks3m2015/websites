package com.wellness.marketplace.model;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import java.math.BigDecimal;

@Entity @Table(name="service_offerings")
@Getter @Setter @NoArgsConstructor
public class ServiceOffering {
    @Id @GeneratedValue(strategy=GenerationType.IDENTITY)
    private Long id;
    @ManyToOne(optional=false) @JoinColumn(name="professional_id")
    private ProfessionalProfile professional;
    @Column(nullable=false) private String name;
    @Column(length=1000) private String description;
    @Column(nullable=false, precision=10, scale=2) private BigDecimal price;
    @Column(nullable=false) private int durationMinutes;
    private boolean active = true;
}
