package com.finora.vault.model;

import jakarta.persistence.*;
import java.time.Instant;

@Entity
@Table(name = "vt_notes")
public class VaultNote {

    @Id
    @Column(length = 64)
    private String id;

    @Column(name = "vault_profile_id", nullable = false, length = 64)
    private String vaultProfileId;

    @Column(nullable = false, length = 255)
    private String label;

    @Column(columnDefinition = "TEXT")
    private String description;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 32)
    private VaultTag tag = VaultTag.PERSONAL;

    @Column(name = "custom_tag_label", length = 64)
    private String customTagLabel;

    @Column(name = "encrypted_secret_blob", nullable = false, columnDefinition = "TEXT")
    private String encryptedSecretBlob;

    @Column(name = "iv", nullable = false, length = 64)
    private String iv;

    @Column(name = "auth_tag", length = 64)
    private String authTag;

    @Column(name = "created_at", nullable = false, updatable = false)
    private Instant createdAt = Instant.now();

    @Column(name = "updated_at", nullable = false)
    private Instant updatedAt = Instant.now();

    @Column(name = "deleted_at")
    private Instant deletedAt;

    public VaultNote() {
    }

    public VaultNote(String id, String vaultProfileId, String label, String description, VaultTag tag, String customTagLabel, String encryptedSecretBlob, String iv, String authTag) {
        this.id = id;
        this.vaultProfileId = vaultProfileId;
        this.label = label;
        this.description = description;
        this.tag = tag != null ? tag : VaultTag.PERSONAL;
        this.customTagLabel = customTagLabel;
        this.encryptedSecretBlob = encryptedSecretBlob;
        this.iv = iv;
        this.authTag = authTag;
        this.createdAt = Instant.now();
        this.updatedAt = Instant.now();
    }

    @PreUpdate
    public void preUpdate() {
        this.updatedAt = Instant.now();
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

    public Instant getDeletedAt() {
        return deletedAt;
    }

    public void setDeletedAt(Instant deletedAt) {
        this.deletedAt = deletedAt;
    }
}
