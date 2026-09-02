package com.finora.trip.model;

public enum PlanStopCategory {
    FLIGHT("Flight & Transit"),
    HOTEL("Hotel & Lodging"),
    ACTIVITY("Activity & Adventure"),
    FOOD("Dining & Meals"),
    TRANSIT("Local Transport"),
    SIGHTSEEING("Sightseeing & Culture"),
    OTHER("Other Stop");

    private final String displayName;

    PlanStopCategory(String displayName) {
        this.displayName = displayName;
    }

    public String getDisplayName() {
        return displayName;
    }
}
