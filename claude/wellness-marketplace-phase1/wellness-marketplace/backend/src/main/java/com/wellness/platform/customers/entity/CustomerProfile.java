package com.wellness.platform.customers.entity;

import com.wellness.platform.common.entity.BaseEntity;
import com.wellness.platform.users.entity.User;
import jakarta.persistence.*;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Entity
@Table(name = "customer_profiles")
@Getter
@Setter
@NoArgsConstructor
public class CustomerProfile extends BaseEntity {

    @OneToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false, unique = true)
    private User user;

    @Column(nullable = false, length = 150)
    private String name;

    @Column(name = "profile_photo_url")
    private String profilePhotoUrl;

    @Column(name = "preferred_area")
    private String preferredArea;
}
