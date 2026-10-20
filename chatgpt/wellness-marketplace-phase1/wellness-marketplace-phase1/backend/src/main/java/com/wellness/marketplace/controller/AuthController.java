package com.wellness.marketplace.controller;

import com.wellness.marketplace.model.Role;
import com.wellness.marketplace.service.AuthService;
import jakarta.validation.constraints.*;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

@RestController @RequestMapping("/auth") @RequiredArgsConstructor
public class AuthController {
    private final AuthService auth;
    public record Register(@NotBlank String name,@Email @NotBlank String email,@Size(min=8) String password,String phone,Role role){}
    public record Login(@Email @NotBlank String email,@NotBlank String password){}
    public record Token(String token){}
    @PostMapping("/register") public Token register(@RequestBody Register r){
        Role role=r.role()==null?Role.CUSTOMER:r.role();
        if(role==Role.ADMIN) role=Role.CUSTOMER;
        return new Token(auth.register(r.name(),r.email(),r.password(),r.phone(),role));
    }
    @PostMapping("/login") public Token login(@RequestBody Login r){ return new Token(auth.login(r.email(),r.password())); }
}
