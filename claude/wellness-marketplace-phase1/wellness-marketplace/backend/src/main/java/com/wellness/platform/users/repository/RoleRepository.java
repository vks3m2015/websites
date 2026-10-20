package com.wellness.platform.users.repository;

import com.wellness.platform.users.entity.Role;
import com.wellness.platform.users.entity.RoleName;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface RoleRepository extends JpaRepository<Role, Integer> {
    Optional<Role> findByName(RoleName name);
}
