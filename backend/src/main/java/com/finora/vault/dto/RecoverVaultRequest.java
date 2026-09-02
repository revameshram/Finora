package com.finora.vault.dto;

public class RecoverVaultRequest {
    private String backupCode;
    private String newMasterPasswordVerifier;
    private String newPasswordSalt;

    public RecoverVaultRequest() {
    }

    public String getBackupCode() {
        return backupCode;
    }

    public void setBackupCode(String backupCode) {
        this.backupCode = backupCode;
    }

    public String getNewMasterPasswordVerifier() {
        return newMasterPasswordVerifier;
    }

    public void setNewMasterPasswordVerifier(String newMasterPasswordVerifier) {
        this.newMasterPasswordVerifier = newMasterPasswordVerifier;
    }

    public String getNewPasswordSalt() {
        return newPasswordSalt;
    }

    public void setNewPasswordSalt(String newPasswordSalt) {
        this.newPasswordSalt = newPasswordSalt;
    }
}
