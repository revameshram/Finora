package com.finora.trip.model;

public enum ParticipantCategory {
    TOURIST("Tourist"),
    TRAVEL_MANAGER("Travel Manager"),
    DRIVER("Driver"),
    COOK("Cook"),
    GUIDE("Guide"),
    OTHER("Other");

    private final String displayName;

    ParticipantCategory(String displayName) {
        this.displayName = displayName;
    }

    public String getDisplayName() {
        return displayName;
    }
}
