package com.wellness.platform.professionals.entity;

import com.wellness.platform.common.entity.BaseEntity;
import com.wellness.platform.users.entity.User;
import jakarta.persistence.*;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import org.locationtech.jts.geom.Point;

import java.math.BigDecimal;

@Entity
@Table(name = "professional_profiles")
@Getter
@Setter
@NoArgsConstructor
public class ProfessionalProfile extends BaseEntity {

    @OneToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false, unique = true)
    private User user;

    @Column(nullable = false, length = 150)
    private String name;

    private String gender;

    @Column(name = "experience_years")
    private Integer experienceYears = 0;

    @Column(columnDefinition = "text")
    private String about;

    private String languages;

    @Column(name = "areas_served")
    private String areasServed;

    @Column(name = "profile_photo_url")
    private String profilePhotoUrl;

    @Column(columnDefinition = "geography(Point,4326)")
    private Point location;

    @Column(name = "location_label")
    private String locationLabel;

    @Enumerated(EnumType.STRING)
    private ProfessionalStatus status = ProfessionalStatus.DRAFT;

    @Column(name = "average_rating")
    private BigDecimal averageRating = BigDecimal.ZERO;

    @Column(name = "review_count")
    private Integer reviewCount = 0;

    @Column(name = "is_publicly_listed")
    private boolean publiclyListed = false;
}
