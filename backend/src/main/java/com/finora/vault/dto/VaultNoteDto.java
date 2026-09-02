package com.finora.vault.dto;

import com.finora.vault.model.VaultTag;
import java.time.Instant;

public class VaultNoteDto {
    private String id;
    private String vaultProfileId;
    private String label;
    private String description;
    private VaultTag tag;
    private String customTagLabel;
    private String encryptedSecretBlob; // Ciphertext
    private String iv;                  // Base64 IV
    private String authTag;
    private Instant createdAt;
    private Instant updatedAt;

    public VaultNoteDto() {
    }

    public VaultNoteDto(String id, String vaultProfileId, String label, String description, VaultTag tag, String customTagLabel, String encryptedSecretBlob, String iv, String authTag, Instant createdAt, Instant updatedAt) {
        this.id = id;
        this.vaultProfileId = vaultProfileId;
        this.label = label;
        this.description = description;
        this.tag = tag;
        this.customTagLabel = customTagLabel;
        this.encryptedSecretBlob = encryptedSecretBlob;
        this.iv = iv;
        this.authTag = authTag;
        this.createdAt = createdAt;
        this.updatedAt = updatedAt;
    }

    public String getId() {
        return id;
    }

    public void setId(String id) {
        this.id = id;
    }

    public String getVaultProfileId() {
        return vaultProfileId;
    }

    public void setVaultProfileId(String vaultProfileId) {
        this.vaultProfileId = vaultProfileId;
    }

    public String getLabel() {
        return label;
    }

    public void setLabel(String label) {
        this.label = label;
    }

    public String getDescription() {
        return description;
    }

    public void setDescription(String description) {
        this.description = description;
    }

    public VaultTag getTag() {
        return tag;
    }

    public void setTag(VaultTag tag) {
        this.tag = tag;
    }

    public String getCustomTagLabel() {
        return customTagLabel;
    }

    public void setCustomTagLabel(String customTagLabel) {
        this.customTagLabel = customTagLabel;
    }

    public String getEncryptedSecretBlob() {
        return encryptedSecretBlob;
    }

    public void setEncryptedSecretBlob(String encryptedSecretBlob) {
        this.encryptedSecretBlob = encryptedSecretBlob;
    }

    public String getIv() {
        return iv;
    }

    public void setIv(String iv) {
        this.iv = iv;
    }

    public String getAuthTag() {
        return authTag;
    }

    public void setAuthTag(String authTag) {
        this.authTag = authTag;
    }

    public Instant getCreatedAt() {
        return createdAt;
    }

    public void setCreatedAt(Instant createdAt) {
        this.createdAt = createdAt;
    }

    public Instant getUpdatedAt() {
        return updatedAt;
    }

    public void setUpdatedAt(Instant updatedAt) {
        this.updatedAt = updatedAt;
    }
}
