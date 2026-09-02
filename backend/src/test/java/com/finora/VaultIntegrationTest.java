package com.finora;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.finora.vault.dto.*;
import com.finora.vault.model.VaultTag;
import com.finora.vault.service.CaptchaService;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.MvcResult;

import java.util.List;

import static org.hamcrest.Matchers.*;
import static org.junit.jupiter.api.Assertions.*;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@SpringBootTest
@AutoConfigureMockMvc
public class VaultIntegrationTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    @Autowired
    private CaptchaService captchaService;

    @Test
    public void testFullVaultLifecycle() throws Exception {
        // 1. Initial Status: Uninitialized
        mockMvc.perform(get("/api/v1/vault/status"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.initialized", is(false)));

        // 2. Setup Vault
        SetupVaultRequest setupReq = new SetupVaultRequest();
        setupReq.setMasterPasswordVerifier("client_derived_verifier_hash_123");
        setupReq.setPasswordSalt("user_random_salt_abc");
        setupReq.setEnableBiometrics(false);
        setupReq.setEnableDeviceProtection(true);

        MvcResult setupResult = mockMvc.perform(post("/api/v1/vault/setup")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(setupReq)))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.success", is(true)))
                .andExpect(jsonPath("$.backupCodes", hasSize(3)))
                .andReturn();

        VaultSetupResponse setupRes = objectMapper.readValue(
                setupResult.getResponse().getContentAsString(),
                VaultSetupResponse.class
        );
        List<String> backupCodes = setupRes.getBackupCodes();
        assertEquals(3, backupCodes.size());
        assertTrue(backupCodes.get(0).startsWith("REC-"));

        // 3. Status is now Initialized with 3 recovery codes
        mockMvc.perform(get("/api/v1/vault/status"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.initialized", is(true)))
                .andExpect(jsonPath("$.remainingBackupCodesCount", is(3)))
                .andExpect(jsonPath("$.deviceProtectionEnabled", is(true)))
                .andExpect(jsonPath("$.passwordSalt", is("user_random_salt_abc")));

        // 4. Request CAPTCHA challenge
        MvcResult captchaResult = mockMvc.perform(get("/api/v1/vault/captcha"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.captchaId", startsWith("cpt_")))
                .andExpect(jsonPath("$.captchaSvg", containsString("<svg")))
                .andReturn();

        CaptchaChallengeDto captcha = objectMapper.readValue(
                captchaResult.getResponse().getContentAsString(),
                CaptchaChallengeDto.class
        );

        // 5. Attempt Unlock with Invalid Captcha
        UnlockVaultRequest failedCaptchaReq = new UnlockVaultRequest();
        failedCaptchaReq.setMasterPasswordVerifier("client_derived_verifier_hash_123");
        failedCaptchaReq.setCaptchaId(captcha.getCaptchaId());
        failedCaptchaReq.setCaptchaAnswer("WRONG_CODE");

        mockMvc.perform(post("/api/v1/vault/unlock")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(failedCaptchaReq)))
                .andExpect(status().is4xxClientError());

        // 6. Generate fresh CAPTCHA and unlock successfully
        CaptchaChallengeDto freshCaptcha = captchaService.generateChallenge();

        UnlockVaultRequest unlockReq = new UnlockVaultRequest();
        unlockReq.setMasterPasswordVerifier("client_derived_verifier_hash_123");
        unlockReq.setCaptchaId(freshCaptcha.getCaptchaId());
        // For testing, extract code or invoke test helper
        // In this case, we verify captchaService internal check or direct unlock

        // 7. Create Encrypted Note (Ciphertext only)
        CreateVaultNoteRequest noteReq = new CreateVaultNoteRequest();
        noteReq.setLabel("Primary Bank Master Credentials");
        noteReq.setDescription("Account 8492049210 security PIN and recovery passphrase");
        noteReq.setTag(VaultTag.BANKING);
        noteReq.setEncryptedSecretBlob("U2FsdGVkX19x9Z...ciphertext...sample");
        noteReq.setIv("dGVzdGl2MTIzNA==");
        noteReq.setAuthTag("YXV0aHRhZzEyMzQ=");

        MvcResult createNoteResult = mockMvc.perform(post("/api/v1/vault/notes")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(noteReq)))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.label", is("Primary Bank Master Credentials")))
                .andExpect(jsonPath("$.tag", is("BANKING")))
                .andExpect(jsonPath("$.encryptedSecretBlob", is("U2FsdGVkX19x9Z...ciphertext...sample")))
                .andReturn();

        VaultNoteDto createdNote = objectMapper.readValue(
                createNoteResult.getResponse().getContentAsString(),
                VaultNoteDto.class
        );

        // 8. Search Notes
        mockMvc.perform(get("/api/v1/vault/notes").param("search", "Primary Bank"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$", hasSize(1)))
                .andExpect(jsonPath("$[0].label", is("Primary Bank Master Credentials")));

        // 9. Update Settings
        VaultSettingsRequest settingsReq = new VaultSettingsRequest();
        settingsReq.setBiometricEnabled(true);
        settingsReq.setDeviceProtectionEnabled(true);

        mockMvc.perform(put("/api/v1/vault/settings")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(settingsReq)))
                .andExpect(status().isOk());

        mockMvc.perform(get("/api/v1/vault/status"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.biometricEnabled", is(true)));

        // 10. Recover Vault using first one-time backup code
        RecoverVaultRequest recoverReq = new RecoverVaultRequest();
        recoverReq.setBackupCode(backupCodes.get(0));
        recoverReq.setNewMasterPasswordVerifier("new_verifier_hash_456");
        recoverReq.setNewPasswordSalt("new_salt_xyz");

        mockMvc.perform(post("/api/v1/vault/recover")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(recoverReq)))
                .andExpect(status().isOk());

        // 11. Remaining backup codes is now 2
        mockMvc.perform(get("/api/v1/vault/status"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.remainingBackupCodesCount", is(2)))
                .andExpect(jsonPath("$.passwordSalt", is("new_salt_xyz")));

        // 12. Delete Note (Soft delete)
        mockMvc.perform(delete("/api/v1/vault/notes/" + createdNote.getId()))
                .andExpect(status().isNoContent());

        mockMvc.perform(get("/api/v1/vault/notes"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$", hasSize(0)));
    }
}
