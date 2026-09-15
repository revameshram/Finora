package com.finora.fire.model;

public enum FireCalculationMode {
    YEARS_TO_FIRE("Years to FIRE", "Calculate timeline to retirement given monthly savings"),
    REQUIRED_SAVINGS("Required Savings", "Calculate monthly savings needed to retire by target age");

    private final String displayName;
    private final String description;

    FireCalculationMode(String displayName, String description) {
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
