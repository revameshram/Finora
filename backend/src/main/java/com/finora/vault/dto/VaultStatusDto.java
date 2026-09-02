package com.finora.vault.dto;

import java.time.Instant;

public class VaultStatusDto {
    private boolean isInitialized;
    private boolean biometricEnabled;
    private boolean deviceProtectionEnabled;
    private String passwordSalt;
    private int totalNotesCount;
    private int remainingBackupCodesCount;
    private Instant lockedUntil;

    public VaultStatusDto() {
    }

    public VaultStatusDto(boolean isInitialized, boolean biometricEnabled, boolean deviceProtectionEnabled, String passwordSalt, int totalNotesCount, int remainingBackupCodesCount, Instant lockedUntil) {
        this.isInitialized = isInitialized;
        this.biometricEnabled = biometricEnabled;
        this.deviceProtectionEnabled = deviceProtectionEnabled;
        this.passwordSalt = passwordSalt;
        this.totalNotesCount = totalNotesCount;
        this.remainingBackupCodesCount = remainingBackupCodesCount;
        this.lockedUntil = lockedUntil;
    }

    public boolean isInitialized() {
        return isInitialized;
    }

    public void setInitialized(boolean initialized) {
        isInitialized = initialized;
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

    public String getPasswordSalt() {
        return passwordSalt;
    }

    public void setPasswordSalt(String passwordSalt) {
        this.passwordSalt = passwordSalt;
    }

    public int getTotalNotesCount() {
        return totalNotesCount;
    }

    public void setTotalNotesCount(int totalNotesCount) {
        this.totalNotesCount = totalNotesCount;
    }

    public int getRemainingBackupCodesCount() {
        return remainingBackupCodesCount;
    }

    public void setRemainingBackupCodesCount(int remainingBackupCodesCount) {
        this.remainingBackupCodesCount = remainingBackupCodesCount;
    }

    public Instant getLockedUntil() {
        return lockedUntil;
    }

    public void setLockedUntil(Instant lockedUntil) {
        this.lockedUntil = lockedUntil;
    }
}
