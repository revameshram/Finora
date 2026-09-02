package com.finora.trip.model;

public enum SplitType {
    EQUAL("Split Equally"),
    EXACT_AMOUNT("Exact Amount"),
    PERCENTAGE("By Percentage"),
    SHARES("By Shares / Ratios");

    private final String displayName;

    SplitType(String displayName) {
        this.displayName = displayName;
    }

    public String getDisplayName() {
        return displayName;
    }
}
