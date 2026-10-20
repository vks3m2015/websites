package com.wellness.marketplace.service;

import com.wellness.marketplace.model.*;
import com.wellness.marketplace.repository.UserRepository;
import com.wellness.marketplace.security.JwtService;
import lombok.RequiredArgsConstructor;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.stereotype.Service;

@Service @RequiredArgsConstructor
public class AuthService {
    private final UserRepository users;
    private final JwtService jwt;
    private final BCryptPasswordEncoder encoder = new BCryptPasswordEncoder();

    public String register(String name,String email,String password,String phone,Role role) {
        if(users.findByEmailIgnoreCase(email).isPresent()) throw new IllegalArgumentException("Email already registered");
        User u=new User(); u.setName(name); u.setEmail(email.toLowerCase()); u.setPasswordHash(encoder.encode(password));
        u.setPhone(phone); u.setRole(role); users.save(u);
        return jwt.generate(u.getId(),u.getEmail(),u.getRole().name());
    }
    public String login(String email,String password) {
        User u=users.findByEmailIgnoreCase(email).orElseThrow(()->new IllegalArgumentException("Invalid credentials"));
        if(!encoder.matches(password,u.getPasswordHash())) throw new IllegalArgumentException("Invalid credentials");
        return jwt.generate(u.getId(),u.getEmail(),u.getRole().name());
    }
}
