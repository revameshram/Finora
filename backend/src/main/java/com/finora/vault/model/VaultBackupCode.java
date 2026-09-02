package com.finora.vault.model;

import jakarta.persistence.*;
import java.time.Instant;

@Entity
@Table(name = "vt_backup_codes")
public class VaultBackupCode {

    @Id
    @Column(length = 64)
    private String id;

    @Column(name = "vault_profile_id", nullable = false, length = 64)
    private String vaultProfileId;

    @Column(name = "code_hash", nullable = false)
    private String codeHash;

    @Column(name = "code_index", nullable = false)
    private int codeIndex; // 1, 2, 3 (#01, #02, #03)

    @Column(name = "used_at")
    private Instant usedAt;

    @Column(name = "created_at", nullable = false, updatable = false)
    private Instant createdAt = Instant.now();

    public VaultBackupCode() {
    }

    public VaultBackupCode(String id, String vaultProfileId, String codeHash, int codeIndex) {
        this.id = id;
        this.vaultProfileId = vaultProfileId;
        this.codeHash = codeHash;
        this.codeIndex = codeIndex;
        this.usedAt = null;
        this.createdAt = Instant.now();
    }

    public String getId() {
        return id;
    }

    public void setId(String id) {
        this.id = id;
    }

    public String getVaultProfileId() {
        return vaultProfileId;
    }

    public void setVaultProfileId(String vaultProfileId) {
        this.vaultProfileId = vaultProfileId;
    }

    public String getCodeHash() {
        return codeHash;
    }

    public void setCodeHash(String codeHash) {
        this.codeHash = codeHash;
    }

    public int getCodeIndex() {
        return codeIndex;
    }

    public void setCodeIndex(int codeIndex) {
        this.codeIndex = codeIndex;
    }

    public Instant getUsedAt() {
        return usedAt;
    }

    public void setUsedAt(Instant usedAt) {
        this.usedAt = usedAt;
    }

    public Instant getCreatedAt() {
        return createdAt;
    }

    public void setCreatedAt(Instant createdAt) {
        this.createdAt = createdAt;
    }
}
