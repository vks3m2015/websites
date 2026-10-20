package com.wellness.marketplace.model;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Entity @Table(name="professional_profiles")
@Getter @Setter @NoArgsConstructor
public class ProfessionalProfile {
    @Id @GeneratedValue(strategy=GenerationType.IDENTITY)
    private Long id;

    @OneToOne(optional=false) @JoinColumn(name="user_id", unique=true)
    private User user;

    @Column(length=2000) private String bio;
    private int experienceYears;
    private String area;
    private String city;
    private Double latitude;
    private Double longitude;
    private boolean verified = true;
    private String profileImageUrl;
}
