package com.finora.vault.repository;

import com.finora.vault.model.VaultBackupCode;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface VaultBackupCodeRepository extends JpaRepository<VaultBackupCode, String> {
    List<VaultBackupCode> findByVaultProfileIdOrderByCodeIndexAsc(String vaultProfileId);
    List<VaultBackupCode> findByVaultProfileIdAndUsedAtIsNull(String vaultProfileId);
}
