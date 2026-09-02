package com.finora.vault.dto;

import java.util.List;

public class VaultSetupResponse {
    private boolean success;
    private String message;
    private List<String> backupCodes; // Exactly 3 one-time recovery codes (#01, #02, #03)

    public VaultSetupResponse() {
    }

    public VaultSetupResponse(boolean success, String message, List<String> backupCodes) {
        this.success = success;
        this.message = message;
        this.backupCodes = backupCodes;
    }

    public boolean isSuccess() {
        return success;
    }

    public void setSuccess(boolean success) {
        this.success = success;
    }

    public String getMessage() {
        return message;
    }

    public void setMessage(String message) {
        this.message = message;
    }

    public List<String> getBackupCodes() {
        return backupCodes;
    }

    public void setBackupCodes(List<String> backupCodes) {
        this.backupCodes = backupCodes;
    }
}
