package com.finora.vault.repository;

import com.finora.vault.model.VaultDeviceKey;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface VaultDeviceKeyRepository extends JpaRepository<VaultDeviceKey, String> {
    List<VaultDeviceKey> findByVaultProfileId(String vaultProfileId);
    Optional<VaultDeviceKey> findByVaultProfileIdAndDeviceFingerprint(String vaultProfileId, String deviceFingerprint);
}
