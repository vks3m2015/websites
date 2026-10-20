package com.wellness.platform.users.repository;

import com.wellness.platform.users.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;
import java.util.UUID;

public interface UserRepository extends JpaRepository<User, UUID> {
    Optional<User> findByEmail(String email);
    Optional<User> findByPhone(String phone);

    default Optional<User> findByEmailOrPhone(String identifier) {
        if (identifier == null) return Optional.empty();
        return identifier.contains("@") ? findByEmail(identifier) : findByPhone(identifier);
    }

    boolean existsByEmail(String email);
    boolean existsByPhone(String phone);
}
