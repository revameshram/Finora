package com.finora.common.linking.model;

import lombok.Getter;
import lombok.RequiredArgsConstructor;

@Getter
@RequiredArgsConstructor
public enum SourceModule {
    MANUAL("Manual", "Standalone user-created entry"),
    PORTFOLIO("Portfolio Tracker", "Linked investment holding from Portfolio Tracker"),
    NET_WORTH("Net Worth Tracker", "Linked asset or liability from Net Worth Tracker"),
    EXPENSE("Expense Tracker", "Linked transaction or budget item from Expense Tracker"),
    GOAL("Goal Manager", "Linked financial goal funding allocation"),
    FIRE("FIRE Planner", "Linked FIRE target or milestone"),
    TRIP("Trip Manager", "Linked trip budget or expense item"),
    VAULT("Vault", "Linked secure asset document or credential"),
    EMI_MANAGER("EMI Manager", "Linked loan liability from EMI Manager");

    private final String displayName;
    private final String description;

    public static SourceModule fromString(String name) {
        if (name == null || name.trim().isEmpty()) {
            return MANUAL;
        }
        try {
            return SourceModule.valueOf(name.trim().toUpperCase());
        } catch (IllegalArgumentException ex) {
            return MANUAL;
        }
    }
}
