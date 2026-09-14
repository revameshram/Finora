package com.finora.fire.model;

public enum FireSavingsSource {
    NET_WORTH("Net Worth Tracker", "Auto-sync from consolidated net worth"),
    PORTFOLIO("Portfolio Tracker", "Auto-sync from portfolio investments"),
    MANUAL("Manual Override", "Enter custom starting savings total");

    private final String displayName;
    private final String description;

    FireSavingsSource(String displayName, String description) {
        this.displayName = displayName;
        this.description = description;
    }

    public String getDisplayName() {
        return displayName;
    }

    public String getDescription() {
        return description;
    }
}
