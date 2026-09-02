package com.finora;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.finora.common.auth.dto.AuthResponse;
import com.finora.common.auth.dto.LoginRequest;
import com.finora.common.auth.dto.RegisterRequest;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.MvcResult;

import static org.junit.jupiter.api.Assertions.assertNotNull;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@SpringBootTest
@AutoConfigureMockMvc
class FinoraAuthIntegrationTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    @Test
    void testLoginWithDummyUserAndAccessProtectedProfile() throws Exception {
        LoginRequest loginRequest = LoginRequest.builder()
                .email("demo@finora.local")
                .password("password123")
                .build();

        MvcResult loginResult = mockMvc.perform(post("/api/v1/auth/login")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(loginRequest)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.token").isNotEmpty())
                .andExpect(jsonPath("$.user.email").value("demo@finora.local"))
                .andExpect(jsonPath("$.user.baseCurrency").value("INR"))
                .andReturn();

        String responseJson = loginResult.getResponse().getContentAsString();
        AuthResponse authResponse = objectMapper.readValue(responseJson, AuthResponse.class);
        String jwtToken = authResponse.getToken();
        assertNotNull(jwtToken);

        // Access protected endpoint /api/v1/auth/me with Bearer token
        mockMvc.perform(get("/api/v1/auth/me")
                        .header("Authorization", "Bearer " + jwtToken))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.email").value("demo@finora.local"))
                .andExpect(jsonPath("$.fullName").value("Demo User"));
    }

    @Test
    void testRegisterNewUser() throws Exception {
        String uniqueEmail = "user_" + System.currentTimeMillis() + "@finora.local";
        RegisterRequest registerRequest = RegisterRequest.builder()
                .email(uniqueEmail)
                .password("securePassword123")
                .fullName("New Test User")
                .baseCurrency("USD")
                .build();

        mockMvc.perform(post("/api/v1/auth/register")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(registerRequest)))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.token").isNotEmpty())
                .andExpect(jsonPath("$.user.email").value(uniqueEmail))
                .andExpect(jsonPath("$.user.fullName").value("New Test User"))
                .andExpect(jsonPath("$.user.baseCurrency").value("USD"));
    }

    @Test
    void testAccessProtectedEndpointWithoutTokenFails() throws Exception {
        mockMvc.perform(get("/api/v1/auth/me"))
                .andExpect(status().isUnauthorized());
    }
}
