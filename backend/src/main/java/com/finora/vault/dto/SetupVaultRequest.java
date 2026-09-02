package com.finora.vault.dto;

public class SetupVaultRequest {
    private String masterPasswordVerifier; // Client-derived PBKDF2 verifier hash
    private String passwordSalt;           // Unique user salt
    private boolean enableBiometrics;
    private boolean enableDeviceProtection;

    public SetupVaultRequest() {
    }

    public String getMasterPasswordVerifier() {
        return masterPasswordVerifier;
    }

    public void setMasterPasswordVerifier(String masterPasswordVerifier) {
        this.masterPasswordVerifier = masterPasswordVerifier;
    }

    public String getPasswordSalt() {
        return passwordSalt;
    }

    public void setPasswordSalt(String passwordSalt) {
        this.passwordSalt = passwordSalt;
    }

    public boolean isEnableBiometrics() {
        return enableBiometrics;
    }

    public void setEnableBiometrics(boolean enableBiometrics) {
        this.enableBiometrics = enableBiometrics;
    }

    public boolean isEnableDeviceProtection() {
        return enableDeviceProtection;
    }

    public void setEnableDeviceProtection(boolean enableDeviceProtection) {
        this.enableDeviceProtection = enableDeviceProtection;
    }
}
