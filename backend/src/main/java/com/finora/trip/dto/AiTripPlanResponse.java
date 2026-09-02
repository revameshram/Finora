package com.finora.trip.dto;

import java.math.BigDecimal;
import java.util.ArrayList;
import java.util.List;

public class AiTripPlanResponse {
    private String generatedTripTitle;
    private String generatedSubtitle;
    private String destination;
    private String description;
    private BigDecimal recommendedBudget;
    private int remainingDailyQuota = 19; // e.g. "20/20"
    private List<DraftStopItem> suggestedStops = new ArrayList<>();
    private List<String> recommendedPackingItems = new ArrayList<>();

    public static class DraftStopItem {
        private int dayNumber;
        private String time;
        private String title;
        private String category;
        private String location;
        private String description;
        private BigDecimal estimatedCost;

        public DraftStopItem() {
        }

        public DraftStopItem(int dayNumber, String time, String title, String category, String location, String description, BigDecimal estimatedCost) {
            this.dayNumber = dayNumber;
            this.time = time;
            this.title = title;
            this.category = category;
            this.location = location;
            this.description = description;
            this.estimatedCost = estimatedCost;
        }

        public int getDayNumber() {
            return dayNumber;
        }

        public void setDayNumber(int dayNumber) {
            this.dayNumber = dayNumber;
        }

        public String getTime() {
            return time;
        }

        public void setTime(String time) {
            this.time = time;
        }

        public String getTitle() {
            return title;
        }

        public void setTitle(String title) {
            this.title = title;
        }

        public String getCategory() {
            return category;
        }

        public void setCategory(String category) {
            this.category = category;
        }

        public String getLocation() {
            return location;
        }

        public void setLocation(String location) {
            this.location = location;
        }

        public String getDescription() {
            return description;
        }

        public void setDescription(String description) {
            this.description = description;
        }

        public BigDecimal getEstimatedCost() {
            return estimatedCost;
        }

        public void setEstimatedCost(BigDecimal estimatedCost) {
            this.estimatedCost = estimatedCost;
        }
    }

    public AiTripPlanResponse() {
    }

    public String getGeneratedTripTitle() {
        return generatedTripTitle;
    }

    public void setGeneratedTripTitle(String generatedTripTitle) {
        this.generatedTripTitle = generatedTripTitle;
    }

    public String getGeneratedSubtitle() {
        return generatedSubtitle;
    }

    public void setGeneratedSubtitle(String generatedSubtitle) {
        this.generatedSubtitle = generatedSubtitle;
    }

    public String getDestination() {
        return destination;
    }

    public void setDestination(String destination) {
        this.destination = destination;
    }

    public String getDescription() {
        return description;
    }

    public void setDescription(String description) {
        this.description = description;
    }

    public BigDecimal getRecommendedBudget() {
        return recommendedBudget;
    }

    public void setRecommendedBudget(BigDecimal recommendedBudget) {
        this.recommendedBudget = recommendedBudget;
    }

    public int getRemainingDailyQuota() {
        return remainingDailyQuota;
    }

    public void setRemainingDailyQuota(int remainingDailyQuota) {
        this.remainingDailyQuota = remainingDailyQuota;
    }

    public List<DraftStopItem> getSuggestedStops() {
        return suggestedStops;
    }

    public void setSuggestedStops(List<DraftStopItem> suggestedStops) {
        this.suggestedStops = suggestedStops;
    }

    public List<String> getRecommendedPackingItems() {
        return recommendedPackingItems;
    }

    public void setRecommendedPackingItems(List<String> recommendedPackingItems) {
        this.recommendedPackingItems = recommendedPackingItems;
    }
}
