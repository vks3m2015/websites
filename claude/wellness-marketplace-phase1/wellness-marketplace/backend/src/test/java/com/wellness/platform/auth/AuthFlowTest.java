package com.wellness.platform.auth;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.wellness.platform.bookings.TestcontainersConfig;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.context.annotation.Import;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.web.servlet.MockMvc;

import java.util.Map;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@SpringBootTest
@AutoConfigureMockMvc
@Import(TestcontainersConfig.class)
@ActiveProfiles("test")
class AuthFlowTest {

    @Autowired private MockMvc mockMvc;
    @Autowired private ObjectMapper objectMapper;

    @Test
    void registerThenLogin_succeeds() throws Exception {
        Map<String, Object> registerBody = Map.of(
                "name", "Priya Verma",
                "email", "priya.test@example.com",
                "password", "SecurePass123",
                "accountType", "CUSTOMER"
        );

        mockMvc.perform(post("/api/auth/register")
                        .contentType("application/json")
                        .content(objectMapper.writeValueAsString(registerBody)))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.accessToken").isNotEmpty())
                .andExpect(jsonPath("$.refreshToken").isNotEmpty())
                .andExpect(jsonPath("$.roles[0]").value("CUSTOMER"));

        Map<String, Object> loginBody = Map.of(
                "identifier", "priya.test@example.com",
                "password", "SecurePass123"
        );

        mockMvc.perform(post("/api/auth/login")
                        .contentType("application/json")
                        .content(objectMapper.writeValueAsString(loginBody)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.accessToken").isNotEmpty());
    }

    @Test
    void registerWithDuplicateEmail_returnsConflict() throws Exception {
        Map<String, Object> registerBody = Map.of(
                "name", "Rahul Gupta",
                "email", "rahul.test@example.com",
                "password", "SecurePass123",
                "accountType", "PROFESSIONAL"
        );

        mockMvc.perform(post("/api/auth/register")
                        .contentType("application/json")
                        .content(objectMapper.writeValueAsString(registerBody)))
                .andExpect(status().isCreated());

        mockMvc.perform(post("/api/auth/register")
                        .contentType("application/json")
                        .content(objectMapper.writeValueAsString(registerBody)))
                .andExpect(status().isConflict())
                .andExpect(jsonPath("$.code").value("EMAIL_ALREADY_REGISTERED"));
    }

    @Test
    void loginWithWrongPassword_returnsUnauthorized() throws Exception {
        Map<String, Object> registerBody = Map.of(
                "name", "Anita Singh",
                "email", "anita.test@example.com",
                "password", "SecurePass123",
                "accountType", "CUSTOMER"
        );
        mockMvc.perform(post("/api/auth/register")
                        .contentType("application/json")
                        .content(objectMapper.writeValueAsString(registerBody)))
                .andExpect(status().isCreated());

        Map<String, Object> loginBody = Map.of(
                "identifier", "anita.test@example.com",
                "password", "WrongPassword"
        );
        mockMvc.perform(post("/api/auth/login")
                        .contentType("application/json")
                        .content(objectMapper.writeValueAsString(loginBody)))
                .andExpect(status().isUnauthorized());
    }
}
