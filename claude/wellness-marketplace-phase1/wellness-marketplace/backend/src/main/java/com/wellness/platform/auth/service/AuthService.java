package com.wellness.platform.auth.service;

import com.wellness.platform.auth.dto.AuthResponse;
import com.wellness.platform.auth.dto.LoginRequest;
import com.wellness.platform.auth.dto.RegisterRequest;
import com.wellness.platform.auth.security.JwtService;
import com.wellness.platform.auth.security.RefreshTokenService;
import com.wellness.platform.common.exception.ApiException;
import com.wellness.platform.customers.entity.CustomerProfile;
import com.wellness.platform.customers.repository.CustomerProfileRepository;
import com.wellness.platform.professionals.entity.ProfessionalProfile;
import com.wellness.platform.professionals.entity.ProfessionalStatus;
import com.wellness.platform.professionals.repository.ProfessionalProfileRepository;
import com.wellness.platform.users.entity.Role;
import com.wellness.platform.users.entity.RoleName;
import com.wellness.platform.users.entity.User;
import com.wellness.platform.users.repository.RoleRepository;
import com.wellness.platform.users.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.HashSet;
import java.util.List;
import java.util.Set;

@Service
@RequiredArgsConstructor
public class AuthService {

    private final UserRepository userRepository;
    private final RoleRepository roleRepository;
    private final CustomerProfileRepository customerProfileRepository;
    private final ProfessionalProfileRepository professionalProfileRepository;
    private final PasswordEncoder passwordEncoder;
    private final AuthenticationManager authenticationManager;
    private final JwtService jwtService;
    private final RefreshTokenService refreshTokenService;

    @Transactional
    public AuthResponse register(RegisterRequest request) {
        if (!request.hasIdentifier()) {
            throw ApiException.badRequest("EMAIL_OR_PHONE_REQUIRED", "Provide an email or phone number");
        }
        if (request.email() != null && userRepository.existsByEmail(request.email())) {
            throw ApiException.conflict("EMAIL_ALREADY_REGISTERED", "An account with this email already exists");
        }
        if (request.phone() != null && userRepository.existsByPhone(request.phone())) {
            throw ApiException.conflict("PHONE_ALREADY_REGISTERED", "An account with this phone number already exists");
        }

        RoleName roleName = RoleName.valueOf(request.accountType());
        Role role = roleRepository.findByName(roleName)
                .orElseThrow(() -> new IllegalStateException("Role not seeded: " + roleName));

        User user = new User();
        user.setEmail(request.email());
        user.setPhone(request.phone());
        user.setPasswordHash(passwordEncoder.encode(request.password()));
        Set<Role> roles = new HashSet<>();
        roles.add(role);
        user.setRoles(roles);
        user = userRepository.save(user);

        if (roleName == RoleName.CUSTOMER) {
            CustomerProfile profile = new CustomerProfile();
            profile.setUser(user);
            profile.setName(request.name());
            customerProfileRepository.save(profile);
        } else {
            ProfessionalProfile profile = new ProfessionalProfile();
            profile.setUser(user);
            profile.setName(request.name());
            profile.setStatus(ProfessionalStatus.DRAFT);
            professionalProfileRepository.save(profile);
        }

        return buildAuthResponse(user);
    }

    @Transactional
    public AuthResponse login(LoginRequest request) {
        Authentication authentication;
        try {
            authentication = authenticationManager.authenticate(
                    new UsernamePasswordAuthenticationToken(request.identifier(), request.password()));
        } catch (Exception ex) {
            throw ApiException.unauthorized("INVALID_CREDENTIALS", "Invalid email/phone or password");
        }

        User user = (User) authentication.getPrincipal();
        return buildAuthResponse(user);
    }

    @Transactional
    public AuthResponse refresh(String rawRefreshToken) {
        var rotation = refreshTokenService.rotate(rawRefreshToken);
        User user = rotation.user();
        String accessToken = jwtService.generateAccessToken(user.getId(), user.getUsername(), List.copyOf(user.getAuthorities()));
        return new AuthResponse(
                user.getId(),
                resolveDisplayName(user),
                user.getAuthorities().stream().map(a -> a.getAuthority().replace("ROLE_", "")).toList(),
                accessToken,
                jwtService.getAccessTokenTtlSeconds(),
                rotation.newRawRefreshToken()
        );
    }

    private AuthResponse buildAuthResponse(User user) {
        String accessToken = jwtService.generateAccessToken(user.getId(), user.getUsername(), List.copyOf(user.getAuthorities()));
        String refreshToken = refreshTokenService.issue(user);
        return new AuthResponse(
                user.getId(),
                resolveDisplayName(user),
                user.getAuthorities().stream().map(a -> a.getAuthority().replace("ROLE_", "")).toList(),
                accessToken,
                jwtService.getAccessTokenTtlSeconds(),
                refreshToken
        );
    }

    private String resolveDisplayName(User user) {
        return customerProfileRepository.findByUserId(user.getId())
                .map(CustomerProfile::getName)
                .or(() -> professionalProfileRepository.findByUserId(user.getId()).map(ProfessionalProfile::getName))
                .orElse(user.getUsername());
    }
}
