package com.finora.common.user.repository;

import com.finora.common.user.entity.UserProfile;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface UserProfileRepository extends JpaRepository<UserProfile, String> {
    Optional<UserProfile> findByEmailIgnoreCase(String email);
    boolean existsByEmailIgnoreCase(String email);
}
