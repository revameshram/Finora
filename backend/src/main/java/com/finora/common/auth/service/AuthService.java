package com.finora.common.auth.service;

import com.finora.common.auth.dto.AuthResponse;
import com.finora.common.auth.dto.LoginRequest;
import com.finora.common.auth.dto.RegisterRequest;
import com.finora.common.auth.dto.UserProfileResponse;
import com.finora.common.auth.security.JwtTokenProvider;
import com.finora.common.auth.security.UserPrincipal;
import com.finora.common.user.entity.UserProfile;
import com.finora.common.user.repository.UserProfileRepository;
import jakarta.annotation.PostConstruct;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.UUID;

@Slf4j
@Service
@RequiredArgsConstructor
public class AuthService {

    private final UserProfileRepository userProfileRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtTokenProvider tokenProvider;

    @PostConstruct
    public void seedInitialDemoUsers() {
        seedUserIfNotExists("demo@finora.local", "Demo User", "password123", "INR");
        seedUserIfNotExists("alok@finora.local", "Alok Kumar", "password123", "INR");
        seedUserIfNotExists("reva@finora.local", "Reva Sharma", "password123", "INR");
    }

    private void seedUserIfNotExists(String email, String fullName, String rawPassword, String currency) {
        if (!userProfileRepository.existsByEmailIgnoreCase(email)) {
            UserProfile user = UserProfile.builder()
                    .id("usr_" + UUID.randomUUID().toString())
                    .email(email.toLowerCase())
                    .fullName(fullName)
                    .passwordHash(passwordEncoder.encode(rawPassword))
                    .baseCurrency(currency)
                    .build();
            userProfileRepository.save(user);
            log.info("Seeded initial user: {} ({})", email, user.getId());
        }
    }

    @Transactional
    public AuthResponse register(RegisterRequest request) {
        if (userProfileRepository.existsByEmailIgnoreCase(request.getEmail())) {
            throw new IllegalArgumentException("Email already registered: " + request.getEmail());
        }

        UserProfile user = UserProfile.builder()
                .id("usr_" + UUID.randomUUID().toString())
                .email(request.getEmail().toLowerCase().trim())
                .passwordHash(passwordEncoder.encode(request.getPassword()))
                .fullName(request.getFullName().trim())
                .baseCurrency(request.getBaseCurrency() != null ? request.getBaseCurrency().toUpperCase() : "INR")
                .build();

        UserProfile savedUser = userProfileRepository.save(user);
        UserPrincipal principal = UserPrincipal.create(savedUser);
        String token = tokenProvider.generateToken(principal);

        return AuthResponse.builder()
                .token(token)
                .user(UserProfileResponse.fromEntity(savedUser))
                .build();
    }

    @Transactional(readOnly = true)
    public AuthResponse login(LoginRequest request) {
        UserProfile user = userProfileRepository.findByEmailIgnoreCase(request.getEmail().trim())
                .orElseThrow(() -> new BadCredentialsException("Invalid email or password"));

        if (!passwordEncoder.matches(request.getPassword(), user.getPasswordHash())) {
            throw new BadCredentialsException("Invalid email or password");
        }

        UserPrincipal principal = UserPrincipal.create(user);
        String token = tokenProvider.generateToken(principal);

        return AuthResponse.builder()
                .token(token)
                .user(UserProfileResponse.fromEntity(user))
                .build();
    }

    @Transactional(readOnly = true)
    public UserProfileResponse getProfile(String userId) {
        UserProfile user = userProfileRepository.findById(userId)
                .orElseThrow(() -> new IllegalArgumentException("User not found with id: " + userId));
        return UserProfileResponse.fromEntity(user);
    }
}
