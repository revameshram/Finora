package com.finora.vault.model;

public enum VaultTag {
    FINANCE("Finance"),
    OFFICIAL("Official & Legal"),
    PERSONAL("Personal"),
    WORK("Work & Tech"),
    SOCIAL("Social & Web"),
    BANKING("Banking & Cards"),
    MEDICAL("Medical & Health"),
    CUSTOM("Custom Tag");

    private final String displayName;

    VaultTag(String displayName) {
        this.displayName = displayName;
    }

    public String getDisplayName() {
        return displayName;
    }
}
