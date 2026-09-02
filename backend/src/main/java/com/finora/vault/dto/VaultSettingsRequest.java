package com.finora.vault.dto;

public class VaultSettingsRequest {
    private Boolean biometricEnabled;
    private Boolean deviceProtectionEnabled;

    public VaultSettingsRequest() {
    }

    public Boolean getBiometricEnabled() {
        return biometricEnabled;
    }

    public void setBiometricEnabled(Boolean biometricEnabled) {
        this.biometricEnabled = biometricEnabled;
    }

    public Boolean getDeviceProtectionEnabled() {
        return deviceProtectionEnabled;
    }

    public void setDeviceProtectionEnabled(Boolean deviceProtectionEnabled) {
        this.deviceProtectionEnabled = deviceProtectionEnabled;
    }
}
