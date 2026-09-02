package com.finora.vault.model;

import jakarta.persistence.*;
import java.time.Instant;

@Entity
@Table(name = "vt_device_keys")
public class VaultDeviceKey {

    @Id
    @Column(length = 64)
    private String id;

    @Column(name = "vault_profile_id", nullable = false, length = 64)
    private String vaultProfileId;

    @Column(name = "device_fingerprint", nullable = false, length = 255)
    private String deviceFingerprint;

    @Column(name = "device_name", length = 128)
    private String deviceName;

    @Column(name = "key_shown", nullable = false)
    private boolean keyShown = false;

    @Column(name = "created_at", nullable = false, updatable = false)
    private Instant createdAt = Instant.now();

    public VaultDeviceKey() {
    }

    public VaultDeviceKey(String id, String vaultProfileId, String deviceFingerprint, String deviceName) {
        this.id = id;
        this.vaultProfileId = vaultProfileId;
        this.deviceFingerprint = deviceFingerprint;
        this.deviceName = deviceName;
        this.keyShown = true;
        this.createdAt = Instant.now();
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

    public String getDeviceFingerprint() {
        return deviceFingerprint;
    }

    public void setDeviceFingerprint(String deviceFingerprint) {
        this.deviceFingerprint = deviceFingerprint;
    }

    public String getDeviceName() {
        return deviceName;
    }

    public void setDeviceName(String deviceName) {
        this.deviceName = deviceName;
    }

    public boolean isKeyShown() {
        return keyShown;
    }

    public void setKeyShown(boolean keyShown) {
        this.keyShown = keyShown;
    }

    public Instant getCreatedAt() {
        return createdAt;
    }

    public void setCreatedAt(Instant createdAt) {
        this.createdAt = createdAt;
    }
}
