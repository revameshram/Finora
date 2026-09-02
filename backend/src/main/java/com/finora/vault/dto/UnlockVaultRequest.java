package com.finora.vault.dto;

public class UnlockVaultRequest {
    private String masterPasswordVerifier;
    private String captchaId;
    private String captchaAnswer;
    private String deviceFingerprint;

    public UnlockVaultRequest() {
    }

    public String getMasterPasswordVerifier() {
        return masterPasswordVerifier;
    }

    public void setMasterPasswordVerifier(String masterPasswordVerifier) {
        this.masterPasswordVerifier = masterPasswordVerifier;
    }

    public String getCaptchaId() {
        return captchaId;
    }

    public void setCaptchaId(String captchaId) {
        this.captchaId = captchaId;
    }

    public String getCaptchaAnswer() {
        return captchaAnswer;
    }

    public void setCaptchaAnswer(String captchaAnswer) {
        this.captchaAnswer = captchaAnswer;
    }

    public String getDeviceFingerprint() {
        return deviceFingerprint;
    }

    public void setDeviceFingerprint(String deviceFingerprint) {
        this.deviceFingerprint = deviceFingerprint;
    }
}
