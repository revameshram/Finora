package com.finora.vault.model;

import jakarta.persistence.*;
import java.time.Instant;

@Entity
@Table(name = "vt_vault_profiles")
public class VaultProfile {

    @Id
    @Column(length = 64)
    private String id;

    @Column(name = "user_id", nullable = false, unique = true, length = 64)
    private String userId;

    @Column(name = "master_password_hash", nullable = false)
    private String masterPasswordHash;

    @Column(name = "password_salt", nullable = false, length = 128)
    private String passwordSalt;

    @Column(name = "biometric_enabled", nullable = false)
    private boolean biometricEnabled = false;

    @Column(name = "device_protection_enabled", nullable = false)
    private boolean deviceProtectionEnabled = false;

    @Column(name = "failed_unlock_attempts", nullable = false)
    private int failedUnlockAttempts = 0;

    @Column(name = "locked_until")
    private Instant lockedUntil;

    @Column(name = "created_at", nullable = false, updatable = false)
    private Instant createdAt = Instant.now();

    @Column(name = "updated_at", nullable = false)
    private Instant updatedAt = Instant.now();

    public VaultProfile() {
    }

    public VaultProfile(String id, String userId, String masterPasswordHash, String passwordSalt) {
        this.id = id;
        this.userId = userId;
        this.masterPasswordHash = masterPasswordHash;
        this.passwordSalt = passwordSalt;
        this.biometricEnabled = false;
        this.deviceProtectionEnabled = false;
        this.failedUnlockAttempts = 0;
        this.createdAt = Instant.now();
        this.updatedAt = Instant.now();
    }

    @PreUpdate
    public void preUpdate() {
        this.updatedAt = Instant.now();
    }

    public String getId() {
        return id;
    }

    public void setId(String id) {
        this.id = id;
    }

    public String getUserId() {
        return userId;
    }

    public void setUserId(String userId) {
        this.userId = userId;
    }

    public String getMasterPasswordHash() {
        return masterPasswordHash;
    }

    public void setMasterPasswordHash(String masterPasswordHash) {
        this.masterPasswordHash = masterPasswordHash;
    }

    public String getPasswordSalt() {
        return passwordSalt;
    }

    public void setPasswordSalt(String passwordSalt) {
        this.passwordSalt = passwordSalt;
    }

    public boolean isBiometricEnabled() {
        return biometricEnabled;
    }

    public void setBiometricEnabled(boolean biometricEnabled) {
        this.biometricEnabled = biometricEnabled;
    }

    public boolean isDeviceProtectionEnabled() {
        return deviceProtectionEnabled;
    }

    public void setDeviceProtectionEnabled(boolean deviceProtectionEnabled) {
        this.deviceProtectionEnabled = deviceProtectionEnabled;
    }

    public int getFailedUnlockAttempts() {
        return failedUnlockAttempts;
    }

    public void setFailedUnlockAttempts(int failedUnlockAttempts) {
        this.failedUnlockAttempts = failedUnlockAttempts;
    }

    public Instant getLockedUntil() {
        return lockedUntil;
    }

    public void setLockedUntil(Instant lockedUntil) {
        this.lockedUntil = lockedUntil;
    }

    public Instant getCreatedAt() {
        return createdAt;
    }

    public void setCreatedAt(Instant createdAt) {
        this.createdAt = createdAt;
    }

    public Instant getUpdatedAt() {
        return updatedAt;
    }

    public void setUpdatedAt(Instant updatedAt) {
        this.updatedAt = updatedAt;
    }
}
