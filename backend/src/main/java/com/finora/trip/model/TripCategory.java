package com.finora.trip.model;

public enum TripCategory {
    TRANSPORTATION("Transportation"),
    ACCOMMODATION("Accommodation"),
    FOOD_DINING("Food & Dining"),
    ACTIVITIES_ENTERTAINMENT("Activities & Entertainment"),
    SHOPPING("Shopping"),
    MISCELLANEOUS("Miscellaneous"),
    TOUR_OPERATOR("Tour Operator");

    private final String displayName;

    TripCategory(String displayName) {
        this.displayName = displayName;
    }

    public String getDisplayName() {
        return displayName;
    }
}
