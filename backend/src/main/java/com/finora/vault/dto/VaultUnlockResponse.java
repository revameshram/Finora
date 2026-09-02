package com.finora.vault.dto;

public class VaultUnlockResponse {
    private boolean unlocked;
    private String message;
    private String vaultSessionToken;
    private boolean requiresDeviceKeyApproval;

    public VaultUnlockResponse() {
    }

    public VaultUnlockResponse(boolean unlocked, String message, String vaultSessionToken, boolean requiresDeviceKeyApproval) {
        this.unlocked = unlocked;
        this.message = message;
        this.vaultSessionToken = vaultSessionToken;
        this.requiresDeviceKeyApproval = requiresDeviceKeyApproval;
    }

    public boolean isUnlocked() {
        return unlocked;
    }

    public void setUnlocked(boolean unlocked) {
        this.unlocked = unlocked;
    }

    public String getMessage() {
        return message;
    }

    public void setMessage(String message) {
        this.message = message;
    }

    public String getVaultSessionToken() {
        return vaultSessionToken;
    }

    public void setVaultSessionToken(String vaultSessionToken) {
        this.vaultSessionToken = vaultSessionToken;
    }

    public boolean isRequiresDeviceKeyApproval() {
        return requiresDeviceKeyApproval;
    }

    public void setRequiresDeviceKeyApproval(boolean requiresDeviceKeyApproval) {
        this.requiresDeviceKeyApproval = requiresDeviceKeyApproval;
    }
}
