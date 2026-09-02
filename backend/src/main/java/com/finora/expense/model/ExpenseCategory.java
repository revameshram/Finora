package com.finora.expense.model;

public enum ExpenseCategory {
    HOUSING("Housing / Rent"),
    UTILITIES("Utilities & Bills"),
    FOOD_GROCERIES("Food & Groceries"),
    DINING_OUT("Dining Out & Cafes"),
    TRANSPORTATION("Transportation & Fuel"),
    HEALTHCARE("Healthcare & Medical"),
    ENTERTAINMENT("Entertainment & Leisure"),
    SHOPPING("Shopping & Personal"),
    INVESTMENT("Investment / Mutual Funds"),
    SAVINGS("Savings & Deposits"),
    RETIREMENT("Retirement (NPS/PPF)"),
    FIRE("FIRE Sinking Fund"),
    TRAVEL("Travel & Vacation"),
    EMI("EMI / Loan Repayment"),
    EDUCATION("Education & Upskilling"),
    PERSONAL_CARE("Personal Care & Fitness"),
    OTHER("Other Miscellaneous");

    private final String displayName;

    ExpenseCategory(String displayName) {
        this.displayName = displayName;
    }

    public String getDisplayName() {
        return displayName;
    }
}
