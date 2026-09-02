package com.finora.trip.model;

public enum PackingCategory {
    ESSENTIALS("Essentials"),
    CLOTHING("Clothing & Wear"),
    ELECTRONICS("Electronics & Gadgets"),
    DOCUMENTS("Documents & Tickets"),
    MEDICINE("First Aid & Medicine"),
    TOILETRIES("Toiletries & Care"),
    OTHER("Other Items");

    private final String displayName;

    PackingCategory(String displayName) {
        this.displayName = displayName;
    }

    public String getDisplayName() {
        return displayName;
    }
}
