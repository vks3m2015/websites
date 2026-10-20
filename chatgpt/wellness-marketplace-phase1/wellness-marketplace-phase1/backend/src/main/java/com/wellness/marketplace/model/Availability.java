package com.wellness.marketplace.model;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import java.time.LocalTime;

@Entity @Table(name="availability")
@Getter @Setter @NoArgsConstructor
public class Availability {
    @Id @GeneratedValue(strategy=GenerationType.IDENTITY)
    private Long id;
    @ManyToOne(optional=false) @JoinColumn(name="professional_id")
    private ProfessionalProfile professional;
    @Column(nullable=false) private int dayOfWeek;
    @Column(nullable=false) private LocalTime startTime;
    @Column(nullable=false) private LocalTime endTime;
}
