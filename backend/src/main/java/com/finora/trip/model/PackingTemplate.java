package com.finora.trip.model;

public enum PackingTemplate {
    BASIC_ESSENTIALS("Basic Essentials"),
    BEACH_TRIP("Beach Trip"),
    BUSINESS("Business Travel"),
    COLD_WEATHER("Cold Weather & Mountains");

    private final String displayName;

    PackingTemplate(String displayName) {
        this.displayName = displayName;
    }

    public String getDisplayName() {
        return displayName;
    }
}
