package com.wellness.platform.servicecatalog.entity;

import com.wellness.platform.common.entity.BaseEntity;
import com.wellness.platform.professionals.entity.ProfessionalProfile;
import jakarta.persistence.*;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.math.BigDecimal;

@Entity
@Table(name = "professional_services")
@Getter
@Setter
@NoArgsConstructor
public class ProfessionalService extends BaseEntity {

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "professional_id", nullable = false)
    private ProfessionalProfile professional;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "service_id", nullable = false)
    private Service service;

    @Column(columnDefinition = "text")
    private String description;

    @Column(name = "duration_minutes", nullable = false)
    private Integer durationMinutes;

    @Column(nullable = false)
    private BigDecimal price;

    @Column(name = "is_active")
    private boolean active = true;
}
