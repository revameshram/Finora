package com.finora.vault.repository;

import com.finora.vault.model.VaultProfile;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface VaultProfileRepository extends JpaRepository<VaultProfile, String> {
    Optional<VaultProfile> findByUserId(String userId);
}
