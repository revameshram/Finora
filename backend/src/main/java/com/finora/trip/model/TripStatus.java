package com.finora.trip.model;

public enum TripStatus {
    PLANNING("Planning"),
    UPCOMING("Upcoming"),
    ACTIVE("Active"),
    COMPLETED("Completed"),
    CANCELLED("Cancelled");

    private final String displayName;

    TripStatus(String displayName) {
        this.displayName = displayName;
    }

    public String getDisplayName() {
        return displayName;
    }
}
