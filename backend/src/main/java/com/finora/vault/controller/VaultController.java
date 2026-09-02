package com.finora.vault.controller;

import com.finora.common.auth.security.SecurityUtils;
import com.finora.vault.dto.*;
import com.finora.vault.model.VaultTag;
import com.finora.vault.service.CaptchaService;
import com.finora.vault.service.VaultService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1/vault")
@Tag(name = "Vault Module", description = "Zero-knowledge encrypted notes and credential locker")
@CrossOrigin(origins = "*")
public class VaultController {

    private final VaultService vaultService;
    private final CaptchaService captchaService;

    public VaultController(VaultService vaultService, CaptchaService captchaService) {
        this.vaultService = vaultService;
        this.captchaService = captchaService;
    }

    private String getEffectiveUserId() {
        return SecurityUtils.getCurrentUserId()
                .orElse("00000000-0000-0000-0000-000000000001");
    }

    // ==========================================
    // Status & Setup
    // ==========================================

    @GetMapping("/status")
    @Operation(summary = "Get vault initialization status and settings")
    public ResponseEntity<VaultStatusDto> getStatus() {
        return ResponseEntity.ok(vaultService.getVaultStatus(getEffectiveUserId()));
    }

    @PostMapping("/setup")
    @Operation(summary = "Setup master password and generate 3 one-time recovery codes")
    public ResponseEntity<VaultSetupResponse> setupVault(@RequestBody SetupVaultRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(vaultService.setupVault(getEffectiveUserId(), request));
    }

    // ==========================================
    // CAPTCHA & Unlock Gate (§16.9)
    // ==========================================

    @GetMapping("/captcha")
    @Operation(summary = "Get high-privacy visual CAPTCHA challenge for unlock gate")
    public ResponseEntity<CaptchaChallengeDto> getCaptchaChallenge() {
        return ResponseEntity.ok(captchaService.generateChallenge());
    }

    @PostMapping("/unlock")
    @Operation(summary = "Unlock vault with master password verifier and CAPTCHA challenge")
    public ResponseEntity<VaultUnlockResponse> unlockVault(@RequestBody UnlockVaultRequest request) {
        return ResponseEntity.ok(vaultService.unlockVault(getEffectiveUserId(), request));
    }

    @PostMapping("/recover")
    @Operation(summary = "Recover vault using a one-time backup code")
    public ResponseEntity<Void> recoverVault(@RequestBody RecoverVaultRequest request) {
        vaultService.recoverVault(getEffectiveUserId(), request);
        return ResponseEntity.ok().build();
    }

    // ==========================================
    // Settings (§16.8)
    // ==========================================

    @PutMapping("/settings")
    @Operation(summary = "Update biometric and device protection toggles")
    public ResponseEntity<Void> updateSettings(@RequestBody VaultSettingsRequest request) {
        vaultService.updateSettings(getEffectiveUserId(), request);
        return ResponseEntity.ok().build();
    }

    // ==========================================
    // Notes CRUD (Zero-Knowledge Ciphertext)
    // ==========================================

    @GetMapping("/notes")
    @Operation(summary = "Get vault notes list (ciphertext only)")
    public ResponseEntity<List<VaultNoteDto>> getNotes(
            @RequestParam(name = "search", required = false) String search,
            @RequestParam(name = "tag", required = false) VaultTag tag) {
        return ResponseEntity.ok(vaultService.getNotes(getEffectiveUserId(), search, tag));
    }

    @PostMapping("/notes")
    @Operation(summary = "Create an encrypted vault note")
    public ResponseEntity<VaultNoteDto> createNote(@RequestBody CreateVaultNoteRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(vaultService.createNote(getEffectiveUserId(), request));
    }

    @PutMapping("/notes/{id}")
    @Operation(summary = "Update an encrypted vault note")
    public ResponseEntity<VaultNoteDto> updateNote(
            @PathVariable("id") String id,
            @RequestBody UpdateVaultNoteRequest request) {
        return ResponseEntity.ok(vaultService.updateNote(getEffectiveUserId(), id, request));
    }

    @DeleteMapping("/notes/{id}")
    @Operation(summary = "Soft delete an encrypted vault note")
    public ResponseEntity<Void> deleteNote(@PathVariable("id") String id) {
        vaultService.deleteNote(getEffectiveUserId(), id);
        return ResponseEntity.noContent().build();
    }
}
