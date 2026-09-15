package com.finora.goal.model;

public enum GoalCategory {
    EMERGENCY_FUND("Emergency Fund", "Shield 3–6 months of living expenses"),
    RETIREMENT("Retirement & FIRE", "Build a perpetual independence nest egg"),
    HOME_DOWNPAYMENT("Home Down Payment", "Save for property acquisition"),
    CAR_PURCHASE("Vehicle Purchase", "Save for auto or personal transport"),
    VACATION("Vacation & Travel", "Experience and travel fund"),
    EDUCATION("Education & Upskilling", "Higher ed, certifications, or kids' tuition"),
    WEDDING("Wedding & Family Event", "Save for major family milestones"),
    WEALTH_BUILDING("Wealth Building", "Long-term compounding asset pool"),
    OTHER("Custom Goal", "General financial objective");

    private final String displayName;
    private final String defaultTemplateHint;

    GoalCategory(String displayName, String defaultTemplateHint) {
        this.displayName = displayName;
        this.defaultTemplateHint = defaultTemplateHint;
    }

    public String getDisplayName() {
        return displayName;
    }

    public String getDefaultTemplateHint() {
        return defaultTemplateHint;
    }
}
