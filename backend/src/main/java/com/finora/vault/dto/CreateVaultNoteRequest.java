package com.finora.vault.dto;

import com.finora.vault.model.VaultTag;

public class CreateVaultNoteRequest {
    private String label;
    private String description;
    private VaultTag tag;
    private String customTagLabel;
    private String encryptedSecretBlob; // Ciphertext
    private String iv;                  // Base64 IV
    private String authTag;

    public CreateVaultNoteRequest() {
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
}
