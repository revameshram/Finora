package com.finora.vault.dto;

public class CaptchaChallengeDto {
    private String captchaId;
    private String captchaSvg; // High-privacy inline SVG distorted visual challenge
    private long expiresAtEpochMs;

    public CaptchaChallengeDto() {
    }

    public CaptchaChallengeDto(String captchaId, String captchaSvg, long expiresAtEpochMs) {
        this.captchaId = captchaId;
        this.captchaSvg = captchaSvg;
        this.expiresAtEpochMs = expiresAtEpochMs;
    }

    public String getCaptchaId() {
        return captchaId;
    }

    public void setCaptchaId(String captchaId) {
        this.captchaId = captchaId;
    }

    public String getCaptchaSvg() {
        return captchaSvg;
    }

    public void setCaptchaSvg(String captchaSvg) {
        this.captchaSvg = captchaSvg;
    }

    public long getExpiresAtEpochMs() {
        return expiresAtEpochMs;
    }

    public void setExpiresAtEpochMs(long expiresAtEpochMs) {
        this.expiresAtEpochMs = expiresAtEpochMs;
    }
}
