package com.finora.vault.service;

import com.finora.vault.dto.CaptchaChallengeDto;
import org.springframework.stereotype.Service;

import javax.crypto.Mac;
import javax.crypto.spec.SecretKeySpec;
import java.nio.charset.StandardCharsets;
import java.security.SecureRandom;
import java.util.*;
import java.util.concurrent.ConcurrentHashMap;

@Service
public class CaptchaService {

    private static final String CHAR_POOL = "23456789ABCDEFGHJKLMNPQRSTUVWXYZ";
    private static final int CODE_LENGTH = 5;
    private static final long TTL_MS = 5 * 60 * 1000; // 5 minutes validity
    private static final SecureRandom RANDOM = new SecureRandom();

    // Ephemeral in-memory store for issued challenges
    private final Map<String, CaptchaEntry> challengeStore = new ConcurrentHashMap<>();
    private final byte[] hmacSecret = new byte[32];

    public CaptchaService() {
        RANDOM.nextBytes(hmacSecret);
    }

    private static class CaptchaEntry {
        final String code;
        final long expiresAt;

        CaptchaEntry(String code, long expiresAt) {
            this.code = code;
            this.expiresAt = expiresAt;
        }
    }

    public CaptchaChallengeDto generateChallenge() {
        cleanupExpired();

        StringBuilder sb = new StringBuilder(CODE_LENGTH);
        for (int i = 0; i < CODE_LENGTH; i++) {
            sb.append(CHAR_POOL.charAt(RANDOM.nextInt(CHAR_POOL.length())));
        }
        String code = sb.toString();
        String captchaId = "cpt_" + UUID.randomUUID().toString().replace("-", "");
        long expiresAt = System.currentTimeMillis() + TTL_MS;

        challengeStore.put(captchaId, new CaptchaEntry(code, expiresAt));

        String svg = renderSvg(code);
        return new CaptchaChallengeDto(captchaId, svg, expiresAt);
    }

    public boolean verifyChallenge(String captchaId, String userAnswer) {
        if (captchaId == null || userAnswer == null || userAnswer.trim().isEmpty()) {
            return false;
        }

        CaptchaEntry entry = challengeStore.remove(captchaId); // Single-use consumption
        if (entry == null) {
            return false;
        }

        if (System.currentTimeMillis() > entry.expiresAt) {
            return false;
        }

        return entry.code.equalsIgnoreCase(userAnswer.trim());
    }

    private void cleanupExpired() {
        long now = System.currentTimeMillis();
        challengeStore.entrySet().removeIf(e -> e.getValue().expiresAt < now);
    }

    private String renderSvg(String code) {
        int width = 160;
        int height = 50;

        StringBuilder svg = new StringBuilder();
        svg.append(String.format("<svg xmlns='http://www.w3.org/2000/svg' width='%d' height='%d' viewBox='0 0 %d %d'>", width, height, width, height));
        svg.append("<rect width='100%' height='100%' fill='#FBF8F3' rx='6' stroke='#E7E5E4' stroke-width='1'/>");

        // Background noise lines
        for (int i = 0; i < 4; i++) {
            int x1 = RANDOM.nextInt(width);
            int y1 = RANDOM.nextInt(height);
            int x2 = RANDOM.nextInt(width);
            int y2 = RANDOM.nextInt(height);
            String stroke = (i % 2 == 0) ? "#B45309" : "#78716C";
            svg.append(String.format("<line x1='%d' y1='%d' x2='%d' y2='%d' stroke='%s' stroke-width='1.2' stroke-opacity='0.25' stroke-dasharray='4,3'/>", x1, y1, x2, y2, stroke));
        }

        // Noise dots
        for (int i = 0; i < 16; i++) {
            int cx = RANDOM.nextInt(width);
            int cy = RANDOM.nextInt(height);
            int r = RANDOM.nextInt(2) + 1;
            svg.append(String.format("<circle cx='%d' cy='%d' r='%d' fill='#B45309' fill-opacity='0.3'/>", cx, cy, r));
        }

        // Render characters with distortion
        String[] colors = {"#1C1917", "#B45309", "#BE123C", "#334155"};
        int charSpacing = (width - 30) / CODE_LENGTH;

        for (int i = 0; i < code.length(); i++) {
            char c = code.charAt(i);
            int x = 20 + (i * charSpacing) + (RANDOM.nextInt(6) - 3);
            int y = 32 + (RANDOM.nextInt(6) - 3);
            int rotate = RANDOM.nextInt(24) - 12; // -12 to +12 degrees
            String color = colors[i % colors.length];

            svg.append(String.format(
                    "<text x='%d' y='%d' fill='%s' font-family='monospace' font-size='24' font-weight='bold' transform='rotate(%d, %d, %d)'>%c</text>",
                    x, y, color, rotate, x, y, c
            ));
        }

        svg.append("</svg>");
        return svg.toString();
    }
}
