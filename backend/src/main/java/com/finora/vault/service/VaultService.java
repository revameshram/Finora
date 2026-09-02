package com.finora.vault.service;

import com.finora.vault.dto.*;
import com.finora.vault.model.*;
import com.finora.vault.repository.VaultBackupCodeRepository;
import com.finora.vault.repository.VaultDeviceKeyRepository;
import com.finora.vault.repository.VaultNoteRepository;
import com.finora.vault.repository.VaultProfileRepository;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.security.SecureRandom;
import java.time.Instant;
import java.time.temporal.ChronoUnit;
import java.util.*;
import java.util.stream.Collectors;

@Service
@Transactional
public class VaultService {

    private final VaultProfileRepository profileRepo;
    private final VaultBackupCodeRepository backupCodeRepo;
    private final VaultNoteRepository noteRepo;
    private final VaultDeviceKeyRepository deviceKeyRepo;
    private final CaptchaService captchaService;
    private final PasswordEncoder passwordEncoder = new BCryptPasswordEncoder();
    private static final SecureRandom RANDOM = new SecureRandom();

    public VaultService(VaultProfileRepository profileRepo,
                        VaultBackupCodeRepository backupCodeRepo,
                        VaultNoteRepository noteRepo,
                        VaultDeviceKeyRepository deviceKeyRepo,
                        CaptchaService captchaService) {
        this.profileRepo = profileRepo;
        this.backupCodeRepo = backupCodeRepo;
        this.noteRepo = noteRepo;
        this.deviceKeyRepo = deviceKeyRepo;
        this.captchaService = captchaService;
    }

    // ==========================================
    // Status & Setup
    // ==========================================

    @Transactional(readOnly = true)
    public VaultStatusDto getVaultStatus(String userId) {
        Optional<VaultProfile> opt = profileRepo.findByUserId(userId);
        if (opt.isEmpty()) {
            return new VaultStatusDto(false, false, false, null, 0, 0, null);
        }

        VaultProfile profile = opt.get();
        int noteCount = noteRepo.findByVaultProfileIdAndDeletedAtIsNullOrderByUpdatedAtDesc(profile.getId()).size();
        int remainingCodes = backupCodeRepo.findByVaultProfileIdAndUsedAtIsNull(profile.getId()).size();

        return new VaultStatusDto(
                true,
                profile.isBiometricEnabled(),
                profile.isDeviceProtectionEnabled(),
                profile.getPasswordSalt(),
                noteCount,
                remainingCodes,
                profile.getLockedUntil()
        );
    }

    public VaultSetupResponse setupVault(String userId, SetupVaultRequest req) {
        if (profileRepo.findByUserId(userId).isPresent()) {
            throw new IllegalStateException("Vault is already initialized for this user");
        }

        if (req.getMasterPasswordVerifier() == null || req.getPasswordSalt() == null) {
            throw new IllegalArgumentException("Master password verifier and salt are required");
        }

        String vaultProfileId = "vp_" + UUID.randomUUID().toString();
        String verifierHash = passwordEncoder.encode(req.getMasterPasswordVerifier());

        VaultProfile profile = new VaultProfile(
                vaultProfileId,
                userId,
                verifierHash,
                req.getPasswordSalt()
        );
        profile.setBiometricEnabled(req.isEnableBiometrics());
        profile.setDeviceProtectionEnabled(req.isEnableDeviceProtection());
        profileRepo.save(profile);

        // Generate exactly 3 one-time recovery codes (#01, #02, #03)
        List<String> plainBackupCodes = new ArrayList<>();
        for (int i = 1; i <= 3; i++) {
            String code = generateRecoveryCode();
            plainBackupCodes.add(code);

            VaultBackupCode backupCode = new VaultBackupCode(
                    "vbc_" + UUID.randomUUID().toString(),
                    vaultProfileId,
                    passwordEncoder.encode(code),
                    i
            );
            backupCodeRepo.save(backupCode);
        }

        return new VaultSetupResponse(
                true,
                "Vault active. Save these recovery codes offline immediately.",
                plainBackupCodes
        );
    }

    // ==========================================
    // Unlock & Rate-Limiting Gate
    // ==========================================

    public VaultUnlockResponse unlockVault(String userId, UnlockVaultRequest req) {
        VaultProfile profile = profileRepo.findByUserId(userId)
                .orElseThrow(() -> new IllegalStateException("Vault is not initialized for this user"));

        // Check lock duration
        if (profile.getLockedUntil() != null && Instant.now().isBefore(profile.getLockedUntil())) {
            long minsLeft = ChronoUnit.MINUTES.between(Instant.now(), profile.getLockedUntil()) + 1;
            throw new SecurityException("Vault is locked due to repeated failed attempts. Try again in " + minsLeft + " minutes.");
        }

        // 1. Verify CAPTCHA challenge
        if (!captchaService.verifyChallenge(req.getCaptchaId(), req.getCaptchaAnswer())) {
            handleFailedAttempt(profile);
            throw new IllegalArgumentException("Human verification failed. Please check the CAPTCHA and try again.");
        }

        // 2. Verify Master Password Verifier Hash
        if (!passwordEncoder.matches(req.getMasterPasswordVerifier(), profile.getMasterPasswordHash())) {
            handleFailedAttempt(profile);
            throw new SecurityException("Invalid Master Password.");
        }

        // Reset failed count on successful unlock
        profile.setFailedUnlockAttempts(0);
        profile.setLockedUntil(null);
        profileRepo.save(profile);

        // Check Device Protection
        boolean requiresApproval = false;
        if (profile.isDeviceProtectionEnabled() && req.getDeviceFingerprint() != null) {
            Optional<VaultDeviceKey> dev = deviceKeyRepo.findByVaultProfileIdAndDeviceFingerprint(profile.getId(), req.getDeviceFingerprint());
            if (dev.isEmpty()) {
                VaultDeviceKey newKey = new VaultDeviceKey(
                        "vdk_" + UUID.randomUUID().toString(),
                        profile.getId(),
                        req.getDeviceFingerprint(),
                        "Browser / Client"
                );
                deviceKeyRepo.save(newKey);
                requiresApproval = true;
            }
        }

        String sessionToken = "vst_" + UUID.randomUUID().toString().replace("-", "");
        return new VaultUnlockResponse(true, "Vault successfully unlocked", sessionToken, requiresApproval);
    }

    private void handleFailedAttempt(VaultProfile profile) {
        profile.setFailedUnlockAttempts(profile.getFailedUnlockAttempts() + 1);
        if (profile.getFailedUnlockAttempts() >= 5) {
            profile.setLockedUntil(Instant.now().plus(15, ChronoUnit.MINUTES));
        }
        profileRepo.save(profile);
    }

    // ==========================================
    // Recovery via One-Time Backup Codes
    // ==========================================

    public void recoverVault(String userId, RecoverVaultRequest req) {
        VaultProfile profile = profileRepo.findByUserId(userId)
                .orElseThrow(() -> new IllegalStateException("Vault is not initialized for this user"));

        if (req.getBackupCode() == null || req.getBackupCode().trim().isEmpty()) {
            throw new IllegalArgumentException("Backup code is required");
        }

        List<VaultBackupCode> unusedCodes = backupCodeRepo.findByVaultProfileIdAndUsedAtIsNull(profile.getId());
        VaultBackupCode matched = null;

        for (VaultBackupCode code : unusedCodes) {
            if (passwordEncoder.matches(req.getBackupCode().trim(), code.getCodeHash())) {
                matched = code;
                break;
            }
        }

        if (matched == null) {
            throw new SecurityException("Invalid or already consumed backup code.");
        }

        matched.setUsedAt(Instant.now());
        backupCodeRepo.save(matched);

        // Re-key vault master password verifier
        profile.setMasterPasswordHash(passwordEncoder.encode(req.getNewMasterPasswordVerifier()));
        profile.setPasswordSalt(req.getNewPasswordSalt());
        profile.setFailedUnlockAttempts(0);
        profile.setLockedUntil(null);
        profileRepo.save(profile);
    }

    // ==========================================
    // Settings (§16.8)
    // ==========================================

    public void updateSettings(String userId, VaultSettingsRequest req) {
        VaultProfile profile = profileRepo.findByUserId(userId)
                .orElseThrow(() -> new IllegalStateException("Vault is not initialized"));

        if (req.getBiometricEnabled() != null) {
            profile.setBiometricEnabled(req.getBiometricEnabled());
        }
        if (req.getDeviceProtectionEnabled() != null) {
            profile.setDeviceProtectionEnabled(req.getDeviceProtectionEnabled());
        }
        profileRepo.save(profile);
    }

    // ==========================================
    // Note Operations (Ciphertext Only)
    // ==========================================

    @Transactional(readOnly = true)
    public List<VaultNoteDto> getNotes(String userId, String search, VaultTag tag) {
        VaultProfile profile = profileRepo.findByUserId(userId)
                .orElseThrow(() -> new IllegalStateException("Vault is not initialized"));

        List<VaultNote> notes;
        if (search != null && !search.trim().isEmpty()) {
            notes = noteRepo.searchNotes(profile.getId(), search.trim());
        } else if (tag != null) {
            notes = noteRepo.findByVaultProfileIdAndTagAndDeletedAtIsNullOrderByUpdatedAtDesc(profile.getId(), tag);
        } else {
            notes = noteRepo.findByVaultProfileIdAndDeletedAtIsNullOrderByUpdatedAtDesc(profile.getId());
        }

        return notes.stream()
                .filter(n -> n.getDeletedAt() == null)
                .map(this::mapToDto)
                .collect(Collectors.toList());
    }

    public VaultNoteDto createNote(String userId, CreateVaultNoteRequest req) {
        VaultProfile profile = profileRepo.findByUserId(userId)
                .orElseThrow(() -> new IllegalStateException("Vault is not initialized"));

        if (req.getLabel() == null || req.getLabel().trim().isEmpty()) {
            throw new IllegalArgumentException("Note label is required");
        }
        if (req.getEncryptedSecretBlob() == null || req.getIv() == null) {
            throw new IllegalArgumentException("Encrypted secret ciphertext and IV are required");
        }

        VaultNote note = new VaultNote(
                "vn_" + UUID.randomUUID().toString(),
                profile.getId(),
                req.getLabel().trim(),
                req.getDescription(),
                req.getTag(),
                req.getCustomTagLabel(),
                req.getEncryptedSecretBlob(),
                req.getIv(),
                req.getAuthTag()
        );

        return mapToDto(noteRepo.save(note));
    }

    public VaultNoteDto updateNote(String userId, String noteId, UpdateVaultNoteRequest req) {
        VaultProfile profile = profileRepo.findByUserId(userId)
                .orElseThrow(() -> new IllegalStateException("Vault is not initialized"));

        VaultNote note = noteRepo.findById(noteId)
                .orElseThrow(() -> new IllegalArgumentException("Note not found with ID: " + noteId));

        if (!note.getVaultProfileId().equals(profile.getId())) {
            throw new SecurityException("Unauthorized to modify this note");
        }

        if (req.getLabel() != null) note.setLabel(req.getLabel().trim());
        if (req.getDescription() != null) note.setDescription(req.getDescription());
        if (req.getTag() != null) note.setTag(req.getTag());
        if (req.getCustomTagLabel() != null) note.setCustomTagLabel(req.getCustomTagLabel());
        if (req.getEncryptedSecretBlob() != null && req.getIv() != null) {
            note.setEncryptedSecretBlob(req.getEncryptedSecretBlob());
            note.setIv(req.getIv());
            note.setAuthTag(req.getAuthTag());
        }

        return mapToDto(noteRepo.save(note));
    }

    public void deleteNote(String userId, String noteId) {
        VaultProfile profile = profileRepo.findByUserId(userId)
                .orElseThrow(() -> new IllegalStateException("Vault is not initialized"));

        VaultNote note = noteRepo.findById(noteId)
                .orElseThrow(() -> new IllegalArgumentException("Note not found with ID: " + noteId));

        if (!note.getVaultProfileId().equals(profile.getId())) {
            throw new SecurityException("Unauthorized to delete this note");
        }

        note.setDeletedAt(Instant.now());
        noteRepo.save(note);
    }

    // ==========================================
    // Helpers
    // ==========================================

    private String generateRecoveryCode() {
        String chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
        StringBuilder sb = new StringBuilder("REC-");
        for (int i = 0; i < 4; i++) sb.append(chars.charAt(RANDOM.nextInt(chars.length())));
        sb.append("-");
        for (int i = 0; i < 4; i++) sb.append(chars.charAt(RANDOM.nextInt(chars.length())));
        sb.append("-");
        for (int i = 0; i < 4; i++) sb.append(chars.charAt(RANDOM.nextInt(chars.length())));
        return sb.toString();
    }

    private VaultNoteDto mapToDto(VaultNote n) {
        return new VaultNoteDto(
                n.getId(),
                n.getVaultProfileId(),
                n.getLabel(),
                n.getDescription(),
                n.getTag(),
                n.getCustomTagLabel(),
                n.getEncryptedSecretBlob(),
                n.getIv(),
                n.getAuthTag(),
                n.getCreatedAt(),
                n.getUpdatedAt()
        );
    }
}
