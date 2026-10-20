package com.wellness.platform.servicecatalog.entity;

import com.wellness.platform.common.entity.BaseEntity;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Table;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Entity
@Table(name = "services")
@Getter
@Setter
@NoArgsConstructor
public class Service extends BaseEntity {

    @Column(nullable = false, length = 150)
    private String name;

    private String category;

    @Column(name = "is_active")
    private boolean active = true;
}
