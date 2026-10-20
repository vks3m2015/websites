package com.wellness.platform.auth.dto;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;

public record RegisterRequest(

        @NotBlank(message = "Name is required")
        @Size(max = 150)
        String name,

        @Email(message = "Email must be valid")
        String email,

        @Pattern(regexp = "^\\+?[0-9]{7,15}$", message = "Phone must be a valid number")
        String phone,

        @NotBlank(message = "Password is required")
        @Size(min = 8, message = "Password must be at least 8 characters")
        String password,

        @NotBlank(message = "Account type is required")
        @Pattern(regexp = "CUSTOMER|PROFESSIONAL", message = "accountType must be CUSTOMER or PROFESSIONAL")
        String accountType
) {
    public boolean hasIdentifier() {
        return (email != null && !email.isBlank()) || (phone != null && !phone.isBlank());
    }
}
