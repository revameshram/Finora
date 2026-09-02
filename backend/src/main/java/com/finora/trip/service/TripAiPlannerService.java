package com.finora.trip.service;

import com.finora.trip.dto.AiTripPlanRequest;
import com.finora.trip.dto.AiTripPlanResponse;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.time.temporal.ChronoUnit;
import java.util.ArrayList;
import java.util.List;

@Service
public class TripAiPlannerService {

    public AiTripPlanResponse generatePlan(AiTripPlanRequest req) {
        String dest = (req.getDestination() != null && !req.getDestination().trim().isEmpty())
                ? req.getDestination().trim()
                : "Kyoto & Tokyo, Japan";

        int days = 5;
        if (req.getStartDate() != null && req.getEndDate() != null) {
            long diff = ChronoUnit.DAYS.between(req.getStartDate(), req.getEndDate()) + 1;
            if (diff > 0) days = (int) diff;
        }

        AiTripPlanResponse res = new AiTripPlanResponse();
        res.setDestination(dest);
        res.setGeneratedTripTitle(dest + " Explorer");
        res.setGeneratedSubtitle(days + "-Day Curated Journey across " + dest);
        res.setDescription("A thoughtfully crafted itinerary featuring cultural landmarks, culinary spots, and scenic transfers.");
        
        BigDecimal basePerDay = new BigDecimal("12000.00");
        int travelers = Math.max(1, req.getAdultsCount() + req.getKidsCount());
        res.setRecommendedBudget(basePerDay.multiply(new BigDecimal(days)).multiply(new BigDecimal(travelers)));
        res.setRemainingDailyQuota(18);

        List<AiTripPlanResponse.DraftStopItem> stops = new ArrayList<>();
        for (int d = 1; d <= Math.min(days, 10); d++) {
            if (d == 1) {
                stops.add(new AiTripPlanResponse.DraftStopItem(1, "09:00", "Arrival & Hotel Check-in", "HOTEL", dest + " Central", "Check into accommodation and collect transit passes", new BigDecimal("4500.00")));
                stops.add(new AiTripPlanResponse.DraftStopItem(1, "14:00", "Orientation Walking Tour", "ACTIVITY", "Old Town Center", "Explore historic alleyways, artisan markets, and tea houses", new BigDecimal("1500.00")));
                stops.add(new AiTripPlanResponse.DraftStopItem(1, "19:00", "Welcome Dinner", "FOOD", "Riverside Dining Quarter", "Traditional local cuisine tasting menu", new BigDecimal("3800.00")));
            } else if (d == days) {
                stops.add(new AiTripPlanResponse.DraftStopItem(d, "10:00", "Souvenir & Local Craft Shopping", "ACTIVITY", "Central Market", "Pick up authentic souvenirs and regional delicacies", new BigDecimal("5000.00")));
                stops.add(new AiTripPlanResponse.DraftStopItem(d, "15:00", "Departure Transfer", "FLIGHT", "International Airport", "Airport express transit and flight check-in", new BigDecimal("2500.00")));
            } else {
                stops.add(new AiTripPlanResponse.DraftStopItem(d, "09:30", "Major Landmark & Heritage Site", "SIGHTSEEING", dest + " Iconic Temple/Museum", "Guided tour of prominent heritage attractions", new BigDecimal("2200.00")));
                stops.add(new AiTripPlanResponse.DraftStopItem(d, "13:00", "Regional Specialty Lunch", "FOOD", "Artisan Food Street", "Street food & local chef specials", new BigDecimal("1800.00")));
                stops.add(new AiTripPlanResponse.DraftStopItem(d, "16:00", "Scenic Viewpoint & Sunset Activity", "ACTIVITY", "High Ridge / River Cruise", "Panoramic views and photography spots", new BigDecimal("3200.00")));
            }
        }
        res.setSuggestedStops(stops);

        List<String> packing = new ArrayList<>();
        packing.add("Passports & Visa Documents");
        packing.add("Universal Power Adapter");
        packing.add("Comfortable Walking Shoes");
        packing.add("Compact Rain Umbrella");
        packing.add("First Aid & Motion Sickness Pills");
        packing.add("Noise Cancelling Headphones");
        res.setRecommendedPackingItems(packing);

        return res;
    }
}
