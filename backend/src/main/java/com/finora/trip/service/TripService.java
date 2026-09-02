package com.finora.trip.service;

import com.finora.trip.dto.*;
import com.finora.trip.model.*;
import com.finora.trip.repository.*;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.Instant;
import java.time.LocalDate;
import java.time.temporal.ChronoUnit;
import java.util.*;
import java.util.stream.Collectors;

@Service
@Transactional
public class TripService {

    private final TripRepository tripRepo;
    private final TripParticipantRepository participantRepo;
    private final TripPlanStopRepository planStopRepo;
    private final TripCategoryBudgetRepository categoryBudgetRepo;
    private final TripExpenseRepository expenseRepo;
    private final TripExpenseSplitRepository expenseSplitRepo;
    private final TripExpensePaymentRepository paymentRepo;
    private final TripPackingItemRepository packingRepo;
    private final TripChecklistItemRepository checklistRepo;

    public TripService(TripRepository tripRepo,
                       TripParticipantRepository participantRepo,
                       TripPlanStopRepository planStopRepo,
                       TripCategoryBudgetRepository categoryBudgetRepo,
                       TripExpenseRepository expenseRepo,
                       TripExpenseSplitRepository expenseSplitRepo,
                       TripExpensePaymentRepository paymentRepo,
                       TripPackingItemRepository packingRepo,
                       TripChecklistItemRepository checklistRepo) {
        this.tripRepo = tripRepo;
        this.participantRepo = participantRepo;
        this.planStopRepo = planStopRepo;
        this.categoryBudgetRepo = categoryBudgetRepo;
        this.expenseRepo = expenseRepo;
        this.expenseSplitRepo = expenseSplitRepo;
        this.paymentRepo = paymentRepo;
        this.packingRepo = packingRepo;
        this.checklistRepo = checklistRepo;
    }

    // ==========================================
    // Trip Lifecycle CRUD
    // ==========================================

    @Transactional(readOnly = true)
    public List<TripDto> getTrips(String userId) {
        return tripRepo.findByUserIdOrderByStartDateDesc(userId).stream()
                .map(this::mapToTripDto)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public TripDto getTrip(String userId, String tripId) {
        Trip trip = findTripForUser(userId, tripId);
        return mapToTripDto(trip);
    }

    public TripDto createTrip(String userId, CreateTripRequest req) {
        String tripId = "tr_" + UUID.randomUUID().toString();
        Trip trip = new Trip(
                tripId,
                userId,
                req.getName() != null ? req.getName().trim() : "Untitled Trip",
                req.getDestination(),
                req.getDepartureLocation(),
                Math.max(1, req.getAdultsCount()),
                Math.max(0, req.getKidsCount()),
                req.getStartDate(),
                req.getEndDate(),
                req.getHotelPreference(),
                req.getAdditionalDetails(),
                req.getTotalBudget() != null ? req.getTotalBudget() : BigDecimal.ZERO
        );
        Trip saved = tripRepo.save(trip);

        // Initialize 7 default category budgets
        for (TripCategory cat : TripCategory.values()) {
            TripCategoryBudget cb = new TripCategoryBudget(
                    "tcb_" + UUID.randomUUID().toString(),
                    tripId,
                    cat,
                    BigDecimal.ZERO
            );
            categoryBudgetRepo.save(cb);
        }

        return mapToTripDto(saved);
    }

    public TripDto updateTrip(String userId, String tripId, UpdateTripRequest req) {
        Trip trip = findTripForUser(userId, tripId);
        if (req.getName() != null) trip.setName(req.getName().trim());
        if (req.getDestination() != null) trip.setDestination(req.getDestination().trim());
        if (req.getDepartureLocation() != null) trip.setDepartureLocation(req.getDepartureLocation().trim());
        if (req.getAdultsCount() != null) trip.setAdultsCount(Math.max(1, req.getAdultsCount()));
        if (req.getKidsCount() != null) trip.setKidsCount(Math.max(0, req.getKidsCount()));
        if (req.getStartDate() != null) trip.setStartDate(req.getStartDate());
        if (req.getEndDate() != null) trip.setEndDate(req.getEndDate());
        if (req.getHotelPreference() != null) trip.setHotelPreference(req.getHotelPreference());
        if (req.getAdditionalDetails() != null) trip.setAdditionalDetails(req.getAdditionalDetails());
        if (req.getStatus() != null) trip.setStatus(req.getStatus());
        if (req.getTotalBudget() != null) trip.setTotalBudget(req.getTotalBudget());

        return mapToTripDto(tripRepo.save(trip));
    }

    public void deleteTrip(String userId, String tripId) {
        Trip trip = findTripForUser(userId, tripId);
        // Cascade delete child entities
        participantRepo.deleteAll(participantRepo.findByTripIdOrderByCreatedAtAsc(tripId));
        planStopRepo.deleteAll(planStopRepo.findByTripIdOrderByStopDateAscStopTimeAsc(tripId));
        categoryBudgetRepo.deleteAll(categoryBudgetRepo.findByTripId(tripId));
        List<TripExpense> expenses = expenseRepo.findByTripIdOrderByExpenseDateDescCreatedAtDesc(tripId);
        for (TripExpense exp : expenses) {
            expenseSplitRepo.deleteByExpenseId(exp.getId());
            paymentRepo.deleteByExpenseId(exp.getId());
        }
        expenseRepo.deleteAll(expenses);
        packingRepo.deleteAll(packingRepo.findByTripIdOrderByCreatedAtAsc(tripId));
        checklistRepo.deleteAll(checklistRepo.findByTripIdOrderByCreatedAtAsc(tripId));

        tripRepo.delete(trip);
    }

    // ==========================================
    // Seed Sample Trip (Vietnam Example §16.14)
    // ==========================================

    public TripDto seedSampleVietnamTrip(String userId) {
        String tripId = "tr_vietnam_" + UUID.randomUUID().toString().substring(0, 8);
        LocalDate start = LocalDate.now().plusDays(10);
        LocalDate end = start.plusDays(7);

        Trip trip = new Trip(
                tripId,
                userId,
                "Vietnam (Ho Chi Minh, Hanoi, Ha Long Bay)",
                "Vietnam",
                "Mumbai (BOM)",
                6,
                2,
                start,
                end,
                "4-Star & Heritage Boutique Resorts",
                "7-day family trip exploring Vietnam's culture, food, and scenic beauty",
                new BigDecimal("450000.00")
        );
        trip.setStatus(TripStatus.UPCOMING);
        tripRepo.save(trip);

        // Category budgets (§16.5)
        categoryBudgetRepo.save(new TripCategoryBudget("tcb_1_" + tripId, tripId, TripCategory.TRANSPORTATION, new BigDecimal("150000.00")));
        categoryBudgetRepo.save(new TripCategoryBudget("tcb_2_" + tripId, tripId, TripCategory.ACCOMMODATION, new BigDecimal("120000.00")));
        categoryBudgetRepo.save(new TripCategoryBudget("tcb_3_" + tripId, tripId, TripCategory.FOOD_DINING, new BigDecimal("80000.00")));
        categoryBudgetRepo.save(new TripCategoryBudget("tcb_4_" + tripId, tripId, TripCategory.ACTIVITIES_ENTERTAINMENT, new BigDecimal("60000.00")));
        categoryBudgetRepo.save(new TripCategoryBudget("tcb_5_" + tripId, tripId, TripCategory.SHOPPING, new BigDecimal("20000.00")));
        categoryBudgetRepo.save(new TripCategoryBudget("tcb_6_" + tripId, tripId, TripCategory.MISCELLANEOUS, new BigDecimal("10000.00")));
        categoryBudgetRepo.save(new TripCategoryBudget("tcb_7_" + tripId, tripId, TripCategory.TOUR_OPERATOR, new BigDecimal("10000.00")));

        // Participants with Dependent Nesting (§16.4)
        TripParticipant rajesh = participantRepo.save(new TripParticipant("tp_rajesh_" + tripId, tripId, "Rajesh Kumar", "rajesh@example.com", "+91 98201 11223", LocalDate.of(1982, 4, 15), "English", "Vegetarian", ParticipantCategory.TOURIST, null));
        participantRepo.save(new TripParticipant("tp_arjun_" + tripId, tripId, "Arjun Kumar", null, null, LocalDate.of(2014, 8, 20), "English", "Kid Menu", ParticipantCategory.TOURIST, rajesh.getId()));

        TripParticipant amit = participantRepo.save(new TripParticipant("tp_amit_" + tripId, tripId, "Amit Sharma", "amit@example.com", "+91 98202 22334", LocalDate.of(1984, 11, 2), "Hindi, English", "Non-Vegetarian", ParticipantCategory.TOURIST, null));
        participantRepo.save(new TripParticipant("tp_isha_" + tripId, tripId, "Isha Sharma", null, null, LocalDate.of(2016, 2, 10), "English", "Vegetarian", ParticipantCategory.TOURIST, amit.getId()));

        TripParticipant priya = participantRepo.save(new TripParticipant("tp_priya_" + tripId, tripId, "Priya Mehta", "priya@example.com", "+91 98203 33445", LocalDate.of(1988, 6, 24), "English", "Vegan", ParticipantCategory.TOURIST, null));
        TripParticipant rohan = participantRepo.save(new TripParticipant("tp_rohan_" + tripId, tripId, "Rohan Verma", "rohan@example.com", "+91 98204 44556", LocalDate.of(1990, 9, 18), "English", "No Restrictions", ParticipantCategory.TOURIST, null));
        participantRepo.save(new TripParticipant("tp_vikram_" + tripId, tripId, "Vikram Rao", "vikram.manager@finora.local", "+91 98205 55667", LocalDate.of(1985, 1, 12), "English, Vietnamese", "No Restrictions", ParticipantCategory.TRAVEL_MANAGER, null));
        participantRepo.save(new TripParticipant("tp_nguyen_" + tripId, tripId, "Nguyen Van (Local Captain)", "nguyen@transfers.vn", "+84 901 234 567", LocalDate.of(1980, 5, 8), "Vietnamese, English", "Local", ParticipantCategory.DRIVER, null));

        // Itinerary Stops (Day 1 & Day 2)
        planStopRepo.save(new TripPlanStop("tps_1_" + tripId, tripId, start, "06:00", "Flight Departure from Mumbai (BOM)", PlanStopCategory.FLIGHT, "BOM T2", "Direct flight to Tan Son Nhat International Airport, Ho Chi Minh", new BigDecimal("132000.00"), rajesh.getId() + "," + amit.getId(), "E-tickets verified"));
        planStopRepo.save(new TripPlanStop("tps_2_" + tripId, tripId, start, "14:00", "Airport Transfer & Hotel Check-in", PlanStopCategory.HOTEL, "District 1, Ho Chi Minh", "Private executive van transfer and welcome drinks at Grand Hotel Saigon", new BigDecimal("54000.00"), null, "Reservation #VN-89240"));
        planStopRepo.save(new TripPlanStop("tps_3_" + tripId, tripId, start, "18:30", "Saigon River Dinner Cruise & City Tour", PlanStopCategory.FOOD, "Bach Dang Pier", "Traditional live acoustic music, local cuisine tasting, and city skyline", new BigDecimal("12000.00"), null, "Smart casual dress code"));
        planStopRepo.save(new TripPlanStop("tps_4_" + tripId, tripId, start.plusDays(1), "08:30", "Cu Chi Tunnels Historical Exploration", PlanStopCategory.SIGHTSEEING, "Cu Chi District", "Underground network guided tour with military history context", new BigDecimal("16500.00"), null, "Wear comfortable footwear"));
        planStopRepo.save(new TripPlanStop("tps_5_" + tripId, tripId, start.plusDays(2), "07:00", "Ha Long Bay Luxury Overnight Cruise", PlanStopCategory.ACTIVITY, "Tuan Chau Harbor", "2-day cruise through limestone karsts, kayak to Sung Sot Cave, sunset deck", new BigDecimal("75000.00"), null, "Included in Tour Operator package"));

        // Expenses & Splits (§16.5: ₹3,26,150 spent)
        createSampleExpense(tripId, rajesh.getId(), "Flight Tickets (Mumbai - Saigon - Hanoi)", TripCategory.TRANSPORTATION, new BigDecimal("132000.00"), start, "PAID");
        createSampleExpense(tripId, amit.getId(), "Grand Hotel Saigon (3 Rooms, 2 Nights)", TripCategory.ACCOMMODATION, new BigDecimal("54000.00"), start, "PAID");
        createSampleExpense(tripId, priya.getId(), "Ha Long Bay Cruise Deposit", TripCategory.ACTIVITIES_ENTERTAINMENT, new BigDecimal("75000.00"), start.plusDays(1), "PAID");
        createSampleExpense(tripId, rohan.getId(), "Welcome River Cruise Dinner", TripCategory.FOOD_DINING, new BigDecimal("18650.00"), start, "PAID");
        createSampleExpense(tripId, rajesh.getId(), "Local Guided Tour & Cu Chi Entry", TripCategory.ACTIVITIES_ENTERTAINMENT, new BigDecimal("24500.00"), start.plusDays(1), "PAID");
        createSampleExpense(tripId, amit.getId(), "Ben Thanh Market Artisan Handicrafts", TripCategory.SHOPPING, new BigDecimal("22000.00"), start.plusDays(2), "PAID");

        // Checklist (10 open / 15 total per §16.5)
        checklistRepo.save(new TripChecklistItem("tcl_1_" + tripId, tripId, "Vietnam eVisa Approvals", "Documents", ChecklistPriority.HIGH, start.minusDays(5), rajesh.getId(), "All 8 travelers approved and printed", true));
        checklistRepo.save(new TripChecklistItem("tcl_2_" + tripId, tripId, "International Roaming eSIMs", "Tech", ChecklistPriority.HIGH, start.minusDays(2), amit.getId(), "Airalo Vietnam 10GB packs", true));
        checklistRepo.save(new TripChecklistItem("tcl_3_" + tripId, tripId, "Currency Exchange (USD & VND cash)", "Money", ChecklistPriority.HIGH, start.minusDays(1), priya.getId(), "Carry ₹50,000 equivalent in clean crisp USD", true));
        checklistRepo.save(new TripChecklistItem("tcl_4_" + tripId, tripId, "Travel Insurance Policies", "Safety", ChecklistPriority.MEDIUM, start.minusDays(4), null, "Comprehensive medical and baggage coverage", true));
        checklistRepo.save(new TripChecklistItem("tcl_5_" + tripId, tripId, "Universal Power Adapters (Type A/C)", "Packing", ChecklistPriority.LOW, start.minusDays(1), rohan.getId(), "Pack 4 multi-plug adapters", true));
        
        // 10 Open Tasks
        for (int i = 6; i <= 15; i++) {
            checklistRepo.save(new TripChecklistItem("tcl_" + i + "_" + tripId, tripId, "Preparation Step #" + i + ": Local Transit & Bookings", "Itinerary", ChecklistPriority.MEDIUM, start.plusDays(i - 6), null, "Review day itinerary details", false));
        }

        // Seed Basic Essentials Packing Template
        seedPackingTemplate(tripId, PackingTemplate.BEACH_TRIP);

        return mapToTripDto(trip);
    }

    private void createSampleExpense(String tripId, String payerId, String desc, TripCategory cat, BigDecimal amount, LocalDate date, String status) {
        String expId = "te_" + UUID.randomUUID().toString();
        TripExpense exp = new TripExpense(expId, tripId, payerId, desc, cat, amount, "INR", amount, date, status, "Sample verified expense");
        expenseRepo.save(exp);

        List<TripParticipant> participants = participantRepo.findByTripIdAndParentParticipantIdIsNullOrderByCreatedAtAsc(tripId);
        if (!participants.isEmpty()) {
            BigDecimal splitAmount = amount.divide(new BigDecimal(participants.size()), 2, RoundingMode.HALF_UP);
            for (TripParticipant p : participants) {
                expenseSplitRepo.save(new TripExpenseSplit("tes_" + UUID.randomUUID().toString(), expId, p.getId(), SplitType.EQUAL, BigDecimal.ONE, splitAmount));
            }
        }
    }

    // ==========================================
    // Participants & Family Nesting (§16.4)
    // ==========================================

    @Transactional(readOnly = true)
    public List<TripParticipantDto> getParticipants(String tripId) {
        List<TripParticipant> all = participantRepo.findByTripIdOrderByCreatedAtAsc(tripId);
        Map<String, List<TripParticipant>> childMap = all.stream()
                .filter(p -> p.getParentParticipantId() != null)
                .collect(Collectors.groupingBy(TripParticipant::getParentParticipantId));

        Map<String, String> nameMap = all.stream()
                .collect(Collectors.toMap(TripParticipant::getId, TripParticipant::getName, (a, b) -> a));

        return all.stream()
                .filter(p -> p.getParentParticipantId() == null) // Root participants
                .map(p -> {
                    TripParticipantDto dto = mapToParticipantDto(p, nameMap);
                    List<TripParticipant> children = childMap.getOrDefault(p.getId(), Collections.emptyList());
                    dto.setDependents(children.stream().map(c -> mapToParticipantDto(c, nameMap)).collect(Collectors.toList()));
                    return dto;
                })
                .collect(Collectors.toList());
    }

    public TripParticipantDto createParticipant(String tripId, CreateParticipantRequest req) {
        if (req.getName() == null || req.getName().trim().isEmpty()) {
            throw new IllegalArgumentException("Participant name is required");
        }

        // Guard against multi-level nesting
        if (req.getParentParticipantId() != null) {
            TripParticipant parent = participantRepo.findById(req.getParentParticipantId())
                    .orElseThrow(() -> new IllegalArgumentException("Parent participant not found"));
            if (parent.getParentParticipantId() != null) {
                throw new IllegalArgumentException("Cannot nest under a dependent. Only single-level family nesting is allowed.");
            }
        }

        String id = "tp_" + UUID.randomUUID().toString();
        TripParticipant p = new TripParticipant(
                id,
                tripId,
                req.getName().trim(),
                req.getEmail(),
                req.getMobile(),
                req.getDob(),
                req.getPreferredLanguage(),
                req.getFoodPreferences(),
                req.getCategory(),
                req.getParentParticipantId()
        );

        return mapToParticipantDto(participantRepo.save(p), Collections.emptyMap());
    }

    public TripParticipantDto updateParticipant(String tripId, String participantId, UpdateParticipantRequest req) {
        TripParticipant p = participantRepo.findById(participantId)
                .orElseThrow(() -> new IllegalArgumentException("Participant not found"));

        if (!p.getTripId().equals(tripId)) {
            throw new SecurityException("Unauthorized");
        }

        if (req.getName() != null) p.setName(req.getName().trim());
        if (req.getEmail() != null) p.setEmail(req.getEmail());
        if (req.getMobile() != null) p.setMobile(req.getMobile());
        if (req.getDob() != null) p.setDob(req.getDob());
        if (req.getPreferredLanguage() != null) p.setPreferredLanguage(req.getPreferredLanguage());
        if (req.getFoodPreferences() != null) p.setFoodPreferences(req.getFoodPreferences());
        if (req.getCategory() != null) p.setCategory(req.getCategory());

        // Update Parent Nesting with safety guards
        if (req.getParentParticipantId() != null) {
            if (req.getParentParticipantId().equals(participantId)) {
                throw new IllegalArgumentException("Participant cannot be their own parent");
            }
            TripParticipant parent = participantRepo.findById(req.getParentParticipantId())
                    .orElseThrow(() -> new IllegalArgumentException("Target parent participant not found"));
            if (parent.getParentParticipantId() != null) {
                throw new IllegalArgumentException("Cannot nest under an existing dependent");
            }
            p.setParentParticipantId(req.getParentParticipantId());
        } else {
            p.setParentParticipantId(null);
        }

        return mapToParticipantDto(participantRepo.save(p), Collections.emptyMap());
    }

    public void deleteParticipant(String tripId, String participantId) {
        TripParticipant p = participantRepo.findById(participantId)
                .orElseThrow(() -> new IllegalArgumentException("Participant not found"));

        if (!p.getTripId().equals(tripId)) {
            throw new SecurityException("Unauthorized");
        }

        // Unlink child dependents before deleting
        List<TripParticipant> dependents = participantRepo.findByTripIdAndParentParticipantId(tripId, participantId);
        for (TripParticipant d : dependents) {
            d.setParentParticipantId(null);
            participantRepo.save(d);
        }

        participantRepo.delete(p);
    }

    public void copyParticipants(String fromTripId, String toTripId) {
        List<TripParticipant> sourceList = participantRepo.findByTripIdOrderByCreatedAtAsc(fromTripId);
        Map<String, String> idMapping = new HashMap<>();

        // First pass: create root participants
        for (TripParticipant src : sourceList) {
            if (src.getParentParticipantId() == null) {
                String newId = "tp_" + UUID.randomUUID().toString();
                idMapping.put(src.getId(), newId);
                participantRepo.save(new TripParticipant(
                        newId, toTripId, src.getName(), src.getEmail(), src.getMobile(),
                        src.getDob(), src.getPreferredLanguage(), src.getFoodPreferences(),
                        src.getCategory(), null
                ));
            }
        }

        // Second pass: create dependents with mapped parent IDs
        for (TripParticipant src : sourceList) {
            if (src.getParentParticipantId() != null) {
                String newId = "tp_" + UUID.randomUUID().toString();
                String newParentId = idMapping.get(src.getParentParticipantId());
                participantRepo.save(new TripParticipant(
                        newId, toTripId, src.getName(), src.getEmail(), src.getMobile(),
                        src.getDob(), src.getPreferredLanguage(), src.getFoodPreferences(),
                        src.getCategory(), newParentId
                ));
            }
        }
    }

    // ==========================================
    // Plan Stops (Day-by-Day Itinerary)
    // ==========================================

    @Transactional(readOnly = true)
    public List<TripPlanStopDto> getPlanStops(String tripId, LocalDate date) {
        List<TripPlanStop> stops = (date != null)
                ? planStopRepo.findByTripIdAndStopDateOrderByStopTimeAsc(tripId, date)
                : planStopRepo.findByTripIdOrderByStopDateAscStopTimeAsc(tripId);

        return stops.stream().map(this::mapToPlanStopDto).collect(Collectors.toList());
    }

    public TripPlanStopDto createPlanStop(String tripId, CreatePlanStopRequest req) {
        if (req.getTitle() == null || req.getTitle().trim().isEmpty()) {
            throw new IllegalArgumentException("Stop title is required");
        }
        if (req.getStopDate() == null) {
            throw new IllegalArgumentException("Stop date is required");
        }

        String assigned = req.getAssignedParticipantIds() != null
                ? String.join(",", req.getAssignedParticipantIds())
                : null;

        TripPlanStop stop = new TripPlanStop(
                "tps_" + UUID.randomUUID().toString(),
                tripId,
                req.getStopDate(),
                req.getStopTime(),
                req.getTitle().trim(),
                req.getCategory(),
                req.getLocation(),
                req.getDescription(),
                req.getEstimatedCost(),
                assigned,
                req.getNotes()
        );

        return mapToPlanStopDto(planStopRepo.save(stop));
    }

    public TripPlanStopDto updatePlanStop(String tripId, String stopId, UpdatePlanStopRequest req) {
        TripPlanStop stop = planStopRepo.findById(stopId)
                .orElseThrow(() -> new IllegalArgumentException("Plan stop not found"));

        if (!stop.getTripId().equals(tripId)) {
            throw new SecurityException("Unauthorized");
        }

        if (req.getTitle() != null) stop.setTitle(req.getTitle().trim());
        if (req.getStopDate() != null) stop.setStopDate(req.getStopDate());
        if (req.getStopTime() != null) stop.setStopTime(req.getStopTime());
        if (req.getCategory() != null) stop.setCategory(req.getCategory());
        if (req.getLocation() != null) stop.setLocation(req.getLocation());
        if (req.getDescription() != null) stop.setDescription(req.getDescription());
        if (req.getEstimatedCost() != null) stop.setEstimatedCost(req.getEstimatedCost());
        if (req.getNotes() != null) stop.setNotes(req.getNotes());
        if (req.getAssignedParticipantIds() != null) {
            stop.setAssignedParticipantIds(String.join(",", req.getAssignedParticipantIds()));
        }

        return mapToPlanStopDto(planStopRepo.save(stop));
    }

    public void deletePlanStop(String tripId, String stopId) {
        TripPlanStop stop = planStopRepo.findById(stopId)
                .orElseThrow(() -> new IllegalArgumentException("Plan stop not found"));

        if (!stop.getTripId().equals(tripId)) {
            throw new SecurityException("Unauthorized");
        }

        planStopRepo.delete(stop);
    }

    // ==========================================
    // Category Budgets
    // ==========================================

    @Transactional(readOnly = true)
    public List<TripCategoryBudgetDto> getCategoryBudgets(String tripId) {
        List<TripCategoryBudget> budgets = categoryBudgetRepo.findByTripId(tripId);
        List<TripExpense> expenses = expenseRepo.findByTripIdOrderByExpenseDateDescCreatedAtDesc(tripId);

        Map<TripCategory, BigDecimal> spendMap = expenses.stream()
                .collect(Collectors.groupingBy(
                        TripExpense::getCategory,
                        Collectors.reducing(BigDecimal.ZERO, TripExpense::getAmount, BigDecimal::add)
                ));

        return Arrays.stream(TripCategory.values()).map(cat -> {
            TripCategoryBudget b = budgets.stream()
                    .filter(x -> x.getCategory() == cat)
                    .findFirst()
                    .orElse(new TripCategoryBudget("tcb_" + cat.name(), tripId, cat, BigDecimal.ZERO));

            BigDecimal spent = spendMap.getOrDefault(cat, BigDecimal.ZERO);
            BigDecimal budget = b.getBudgetAmount();

            // Null-guarded utilization percent (prevents NaN% when budget == 0)
            BigDecimal util = (budget.compareTo(BigDecimal.ZERO) > 0)
                    ? spent.multiply(new BigDecimal("100")).divide(budget, 1, RoundingMode.HALF_UP)
                    : BigDecimal.ZERO;

            return new TripCategoryBudgetDto(b.getId(), tripId, cat, budget, spent, util);
        }).collect(Collectors.toList());
    }

    public void setCategoryBudget(String tripId, SetCategoryBudgetRequest req) {
        if (req.getCategory() == null) {
            throw new IllegalArgumentException("Category is required");
        }

        Optional<TripCategoryBudget> existing = categoryBudgetRepo.findByTripIdAndCategory(tripId, req.getCategory());
        if (existing.isPresent()) {
            TripCategoryBudget cb = existing.get();
            cb.setBudgetAmount(req.getBudgetAmount() != null ? req.getBudgetAmount() : BigDecimal.ZERO);
            categoryBudgetRepo.save(cb);
        } else {
            TripCategoryBudget cb = new TripCategoryBudget(
                    "tcb_" + UUID.randomUUID().toString(),
                    tripId,
                    req.getCategory(),
                    req.getBudgetAmount() != null ? req.getBudgetAmount() : BigDecimal.ZERO
            );
            categoryBudgetRepo.save(cb);
        }
    }

    // ==========================================
    // Expenses & Splits CRUD
    // ==========================================

    @Transactional(readOnly = true)
    public List<TripExpenseDto> getExpenses(String tripId, TripCategory category) {
        List<TripExpense> expenses = (category != null)
                ? expenseRepo.findByTripIdAndCategoryOrderByExpenseDateDesc(tripId, category)
                : expenseRepo.findByTripIdOrderByExpenseDateDescCreatedAtDesc(tripId);

        Map<String, String> participantNames = participantRepo.findByTripIdOrderByCreatedAtAsc(tripId).stream()
                .collect(Collectors.toMap(TripParticipant::getId, TripParticipant::getName, (a, b) -> a));

        return expenses.stream()
                .map(e -> mapToExpenseDto(e, participantNames))
                .collect(Collectors.toList());
    }

    public TripExpenseDto createExpense(String tripId, CreateExpenseRequest req) {
        if (req.getDescription() == null || req.getDescription().trim().isEmpty()) {
            throw new IllegalArgumentException("Expense description is required");
        }
        if (req.getAmount() == null || req.getAmount().compareTo(BigDecimal.ZERO) <= 0) {
            throw new IllegalArgumentException("Expense amount must be positive");
        }

        String expId = "te_" + UUID.randomUUID().toString();
        TripExpense exp = new TripExpense(
                expId,
                tripId,
                req.getPayerId(),
                req.getDescription().trim(),
                req.getCategory(),
                req.getAmount(),
                req.getOriginalCurrency(),
                req.getOriginalAmount(),
                req.getExpenseDate(),
                req.getPaymentStatus(),
                req.getNotes()
        );
        TripExpense saved = expenseRepo.save(exp);

        // Process Splits
        if (req.getSplits() != null && !req.getSplits().isEmpty()) {
            saveExpenseSplits(expId, req.getAmount(), req.getSplits());
        }

        Map<String, String> participantNames = participantRepo.findByTripIdOrderByCreatedAtAsc(tripId).stream()
                .collect(Collectors.toMap(TripParticipant::getId, TripParticipant::getName, (a, b) -> a));

        return mapToExpenseDto(saved, participantNames);
    }

    public TripExpenseDto updateExpense(String tripId, String expenseId, UpdateExpenseRequest req) {
        TripExpense exp = expenseRepo.findById(expenseId)
                .orElseThrow(() -> new IllegalArgumentException("Expense not found"));

        if (!exp.getTripId().equals(tripId)) {
            throw new SecurityException("Unauthorized");
        }

        if (req.getDescription() != null) exp.setDescription(req.getDescription().trim());
        if (req.getCategory() != null) exp.setCategory(req.getCategory());
        if (req.getAmount() != null) exp.setAmount(req.getAmount());
        if (req.getPayerId() != null) exp.setPayerId(req.getPayerId());
        if (req.getOriginalCurrency() != null) exp.setOriginalCurrency(req.getOriginalCurrency());
        if (req.getOriginalAmount() != null) exp.setOriginalAmount(req.getOriginalAmount());
        if (req.getExpenseDate() != null) exp.setExpenseDate(req.getExpenseDate());
        if (req.getPaymentStatus() != null) exp.setPaymentStatus(req.getPaymentStatus());
        if (req.getNotes() != null) exp.setNotes(req.getNotes());

        TripExpense saved = expenseRepo.save(exp);

        if (req.getSplits() != null) {
            expenseSplitRepo.deleteByExpenseId(expenseId);
            saveExpenseSplits(expenseId, saved.getAmount(), req.getSplits());
        }

        Map<String, String> participantNames = participantRepo.findByTripIdOrderByCreatedAtAsc(tripId).stream()
                .collect(Collectors.toMap(TripParticipant::getId, TripParticipant::getName, (a, b) -> a));

        return mapToExpenseDto(saved, participantNames);
    }

    public void deleteExpense(String tripId, String expenseId) {
        TripExpense exp = expenseRepo.findById(expenseId)
                .orElseThrow(() -> new IllegalArgumentException("Expense not found"));

        if (!exp.getTripId().equals(tripId)) {
            throw new SecurityException("Unauthorized");
        }

        expenseSplitRepo.deleteByExpenseId(expenseId);
        paymentRepo.deleteByExpenseId(expenseId);
        expenseRepo.delete(exp);
    }

    private void saveExpenseSplits(String expenseId, BigDecimal totalAmount, List<CreateExpenseRequest.SplitItemRequest> splits) {
        if (splits.isEmpty()) return;

        SplitType type = splits.get(0).getSplitType();
        if (type == SplitType.EQUAL) {
            BigDecimal share = totalAmount.divide(new BigDecimal(splits.size()), 2, RoundingMode.HALF_UP);
            for (CreateExpenseRequest.SplitItemRequest s : splits) {
                expenseSplitRepo.save(new TripExpenseSplit(
                        "tes_" + UUID.randomUUID().toString(),
                        expenseId,
                        s.getParticipantId(),
                        SplitType.EQUAL,
                        BigDecimal.ONE,
                        share
                ));
            }
        } else if (type == SplitType.PERCENTAGE) {
            for (CreateExpenseRequest.SplitItemRequest s : splits) {
                BigDecimal pct = s.getSplitValue() != null ? s.getSplitValue() : BigDecimal.ZERO;
                BigDecimal share = totalAmount.multiply(pct).divide(new BigDecimal("100"), 2, RoundingMode.HALF_UP);
                expenseSplitRepo.save(new TripExpenseSplit(
                        "tes_" + UUID.randomUUID().toString(),
                        expenseId,
                        s.getParticipantId(),
                        SplitType.PERCENTAGE,
                        pct,
                        share
                ));
            }
        } else if (type == SplitType.SHARES) {
            BigDecimal totalShares = splits.stream()
                    .map(CreateExpenseRequest.SplitItemRequest::getSplitValue)
                    .filter(Objects::nonNull)
                    .reduce(BigDecimal.ZERO, BigDecimal::add);

            if (totalShares.compareTo(BigDecimal.ZERO) <= 0) totalShares = BigDecimal.ONE;

            for (CreateExpenseRequest.SplitItemRequest s : splits) {
                BigDecimal sh = s.getSplitValue() != null ? s.getSplitValue() : BigDecimal.ONE;
                BigDecimal share = totalAmount.multiply(sh).divide(totalShares, 2, RoundingMode.HALF_UP);
                expenseSplitRepo.save(new TripExpenseSplit(
                        "tes_" + UUID.randomUUID().toString(),
                        expenseId,
                        s.getParticipantId(),
                        SplitType.SHARES,
                        sh,
                        share
                ));
            }
        } else {
            for (CreateExpenseRequest.SplitItemRequest s : splits) {
                BigDecimal amt = s.getSplitValue() != null ? s.getSplitValue() : BigDecimal.ZERO;
                expenseSplitRepo.save(new TripExpenseSplit(
                        "tes_" + UUID.randomUUID().toString(),
                        expenseId,
                        s.getParticipantId(),
                        SplitType.EXACT_AMOUNT,
                        amt,
                        amt
                ));
            }
        }
    }

    // ==========================================
    // Smart Split Calculator Engine (§16.2)
    // ==========================================

    public SmartSplitResponse calculateSmartSplit(SmartSplitRequest req) {
        BigDecimal total = req.getTotalAmount() != null ? req.getTotalAmount() : BigDecimal.ZERO;
        List<SmartSplitRequest.ParticipantInput> inputs = req.getParticipants();
        SmartSplitResponse res = new SmartSplitResponse();
        res.setTotalAmount(total);

        if (inputs == null || inputs.isEmpty()) {
            res.setComputedSum(BigDecimal.ZERO);
            res.setRoundingRemainder(BigDecimal.ZERO);
            return res;
        }

        List<SmartSplitResponse.ParticipantSplitItem> items = new ArrayList<>();
        BigDecimal sum = BigDecimal.ZERO;

        if (req.getSplitType() == SplitType.EQUAL) {
            BigDecimal share = total.divide(new BigDecimal(inputs.size()), 2, RoundingMode.HALF_UP);
            BigDecimal pct = new BigDecimal("100").divide(new BigDecimal(inputs.size()), 1, RoundingMode.HALF_UP);
            for (SmartSplitRequest.ParticipantInput p : inputs) {
                items.add(new SmartSplitResponse.ParticipantSplitItem(p.getParticipantId(), BigDecimal.ONE, share, pct));
                sum = sum.add(share);
            }
        } else if (req.getSplitType() == SplitType.PERCENTAGE) {
            for (SmartSplitRequest.ParticipantInput p : inputs) {
                BigDecimal pct = p.getValue() != null ? p.getValue() : BigDecimal.ZERO;
                BigDecimal share = total.multiply(pct).divide(new BigDecimal("100"), 2, RoundingMode.HALF_UP);
                items.add(new SmartSplitResponse.ParticipantSplitItem(p.getParticipantId(), pct, share, pct));
                sum = sum.add(share);
            }
        } else if (req.getSplitType() == SplitType.SHARES) {
            BigDecimal totalShares = inputs.stream()
                    .map(SmartSplitRequest.ParticipantInput::getValue)
                    .filter(Objects::nonNull)
                    .reduce(BigDecimal.ZERO, BigDecimal::add);

            if (totalShares.compareTo(BigDecimal.ZERO) <= 0) totalShares = BigDecimal.ONE;

            for (SmartSplitRequest.ParticipantInput p : inputs) {
                BigDecimal sh = p.getValue() != null ? p.getValue() : BigDecimal.ONE;
                BigDecimal share = total.multiply(sh).divide(totalShares, 2, RoundingMode.HALF_UP);
                BigDecimal pct = sh.multiply(new BigDecimal("100")).divide(totalShares, 1, RoundingMode.HALF_UP);
                items.add(new SmartSplitResponse.ParticipantSplitItem(p.getParticipantId(), sh, share, pct));
                sum = sum.add(share);
            }
        } else {
            for (SmartSplitRequest.ParticipantInput p : inputs) {
                BigDecimal amt = p.getValue() != null ? p.getValue() : BigDecimal.ZERO;
                BigDecimal pct = (total.compareTo(BigDecimal.ZERO) > 0)
                        ? amt.multiply(new BigDecimal("100")).divide(total, 1, RoundingMode.HALF_UP)
                        : BigDecimal.ZERO;
                items.add(new SmartSplitResponse.ParticipantSplitItem(p.getParticipantId(), amt, amt, pct));
                sum = sum.add(amt);
            }
        }

        res.setSplits(items);
        res.setComputedSum(sum);
        res.setRoundingRemainder(total.subtract(sum));
        return res;
    }

    // ==========================================
    // Payments & Settlement Matrix (§16.2 / §17)
    // ==========================================

    public void createPayment(String tripId, CreatePaymentRequest req) {
        if (req.getFromParticipantId() == null || req.getToParticipantId() == null) {
            throw new IllegalArgumentException("Payer and payee are required");
        }
        if (req.getAmount() == null || req.getAmount().compareTo(BigDecimal.ZERO) <= 0) {
            throw new IllegalArgumentException("Payment amount must be positive");
        }

        TripExpensePayment payment = new TripExpensePayment(
                "tep_" + UUID.randomUUID().toString(),
                tripId,
                req.getExpenseId(),
                req.getFromParticipantId(),
                req.getToParticipantId(),
                req.getAmount(),
                req.getPaymentMethod(),
                req.getPaymentDate(),
                req.getPaymentStatus(),
                req.getReferenceId(),
                req.getNotes()
        );
        paymentRepo.save(payment);
    }

    @Transactional(readOnly = true)
    public SettleMatrixDto getSettleMatrix(String tripId) {
        List<TripParticipant> participants = participantRepo.findByTripIdOrderByCreatedAtAsc(tripId);
        List<TripExpense> expenses = expenseRepo.findByTripIdOrderByExpenseDateDescCreatedAtDesc(tripId);
        List<TripExpensePayment> payments = paymentRepo.findByTripIdOrderByPaymentDateDescCreatedAtDesc(tripId);

        Map<String, String> nameMap = participants.stream()
                .collect(Collectors.toMap(TripParticipant::getId, TripParticipant::getName, (a, b) -> a));

        Map<String, BigDecimal> totalPaidMap = new HashMap<>();
        Map<String, BigDecimal> totalShareMap = new HashMap<>();

        // 1. Calculate direct expense payments
        for (TripExpense e : expenses) {
            if (e.getPayerId() != null) {
                totalPaidMap.merge(e.getPayerId(), e.getAmount(), BigDecimal::add);
            }
            List<TripExpenseSplit> splits = expenseSplitRepo.findByExpenseId(e.getId());
            for (TripExpenseSplit s : splits) {
                totalShareMap.merge(s.getParticipantId(), s.getComputedAmount(), BigDecimal::add);
            }
        }

        // 2. Adjust for peer-to-peer settlement payments
        for (TripExpensePayment pay : payments) {
            // fromParticipant paid money (increases their credit / totalPaid)
            totalPaidMap.merge(pay.getFromParticipantId(), pay.getAmount(), BigDecimal::add);
            // toParticipant received money (increases their totalShare / reduces owed balance)
            totalShareMap.merge(pay.getToParticipantId(), pay.getAmount(), BigDecimal::add);
        }

        BigDecimal totalExpenses = expenses.stream().map(TripExpense::getAmount).reduce(BigDecimal.ZERO, BigDecimal::add);
        BigDecimal totalPayments = payments.stream().map(TripExpensePayment::getAmount).reduce(BigDecimal.ZERO, BigDecimal::add);

        List<SettleMatrixDto.ParticipantBalanceDto> balanceList = new ArrayList<>();
        List<ParticipantNet> debtors = new ArrayList<>();
        List<ParticipantNet> creditors = new ArrayList<>();

        for (TripParticipant p : participants) {
            BigDecimal paid = totalPaidMap.getOrDefault(p.getId(), BigDecimal.ZERO);
            BigDecimal share = totalShareMap.getOrDefault(p.getId(), BigDecimal.ZERO);
            BigDecimal net = paid.subtract(share); // positive = is owed money, negative = owes money

            String status = "SETTLED";
            if (net.compareTo(new BigDecimal("1.00")) > 0) {
                status = "OWED";
                creditors.add(new ParticipantNet(p.getId(), p.getName(), net));
            } else if (net.compareTo(new BigDecimal("-1.00")) < 0) {
                status = "OWES";
                debtors.add(new ParticipantNet(p.getId(), p.getName(), net.abs()));
            }

            balanceList.add(new SettleMatrixDto.ParticipantBalanceDto(
                    p.getId(),
                    p.getName(),
                    paid,
                    share,
                    net,
                    status
            ));
        }

        // 3. Compute optimal simplified debt transfers
        List<SettleMatrixDto.SuggestedTransferDto> transfers = new ArrayList<>();
        int dIdx = 0;
        int cIdx = 0;

        while (dIdx < debtors.size() && cIdx < creditors.size()) {
            ParticipantNet debtor = debtors.get(dIdx);
            ParticipantNet creditor = creditors.get(cIdx);

            BigDecimal settleAmount = debtor.amount.min(creditor.amount);
            if (settleAmount.compareTo(BigDecimal.ZERO) > 0) {
                transfers.add(new SettleMatrixDto.SuggestedTransferDto(
                        debtor.id,
                        debtor.name,
                        creditor.id,
                        creditor.name,
                        settleAmount.setScale(2, RoundingMode.HALF_UP)
                ));

                debtor.amount = debtor.amount.subtract(settleAmount);
                creditor.amount = creditor.amount.subtract(settleAmount);
            }

            if (debtor.amount.compareTo(new BigDecimal("0.01")) < 0) dIdx++;
            if (creditor.amount.compareTo(new BigDecimal("0.01")) < 0) cIdx++;
        }

        BigDecimal unsettled = debtors.stream().map(d -> d.amount).reduce(BigDecimal.ZERO, BigDecimal::add);

        SettleMatrixDto matrix = new SettleMatrixDto();
        matrix.setTotalTripExpenses(totalExpenses);
        matrix.setTotalPaymentsMade(totalPayments);
        matrix.setTotalUnsettledBalance(unsettled);
        matrix.setParticipantBalances(balanceList);
        matrix.setSuggestedTransfers(transfers);
        return matrix;
    }

    private static class ParticipantNet {
        String id;
        String name;
        BigDecimal amount;

        ParticipantNet(String id, String name, BigDecimal amount) {
            this.id = id;
            this.name = name;
            this.amount = amount;
        }
    }

    // ==========================================
    // Insights & Analytics with Zero-Division Guard (§16.2 / §16.12)
    // ==========================================

    @Transactional(readOnly = true)
    public TripInsightsDto getInsights(String tripId) {
        Trip trip = tripRepo.findById(tripId).orElseThrow(() -> new IllegalArgumentException("Trip not found"));
        List<TripExpense> expenses = expenseRepo.findByTripIdOrderByExpenseDateDescCreatedAtDesc(tripId);
        List<TripCategoryBudget> budgets = categoryBudgetRepo.findByTripId(tripId);
        List<TripParticipant> participants = participantRepo.findByTripIdOrderByCreatedAtAsc(tripId);
        List<TripExpensePayment> payments = paymentRepo.findByTripIdOrderByPaymentDateDescCreatedAtDesc(tripId);

        BigDecimal totalBudget = trip.getTotalBudget() != null ? trip.getTotalBudget() : BigDecimal.ZERO;
        BigDecimal totalSpent = expenses.stream().map(TripExpense::getAmount).reduce(BigDecimal.ZERO, BigDecimal::add);
        BigDecimal budgetLeft = totalBudget.subtract(totalSpent);

        // NULL-GUARDED UTILIZATION PERCENT
        BigDecimal usedPercent = (totalBudget.compareTo(BigDecimal.ZERO) > 0)
                ? totalSpent.multiply(new BigDecimal("100")).divide(totalBudget, 1, RoundingMode.HALF_UP)
                : BigDecimal.ZERO;

        int duration = 1;
        int daysElapsed = 0;
        int daysRemaining = 0;

        if (trip.getStartDate() != null && trip.getEndDate() != null) {
            long totalDays = ChronoUnit.DAYS.between(trip.getStartDate(), trip.getEndDate()) + 1;
            duration = (int) Math.max(1, totalDays);

            LocalDate today = LocalDate.now();
            if (today.isBefore(trip.getStartDate())) {
                daysElapsed = 0;
                daysRemaining = duration;
            } else if (today.isAfter(trip.getEndDate())) {
                daysElapsed = duration;
                daysRemaining = 0;
            } else {
                daysElapsed = (int) ChronoUnit.DAYS.between(trip.getStartDate(), today) + 1;
                daysRemaining = Math.max(0, duration - daysElapsed);
            }
        }

        // NULL-GUARDED DAILY AVERAGE
        BigDecimal dailyAvg = (daysElapsed > 0)
                ? totalSpent.divide(new BigDecimal(daysElapsed), 2, RoundingMode.HALF_UP)
                : (duration > 0 ? totalSpent.divide(new BigDecimal(duration), 2, RoundingMode.HALF_UP) : totalSpent);

        // Spending velocity projection
        BigDecimal velocityDaily = (daysElapsed > 0) ? dailyAvg : (duration > 0 ? totalSpent.divide(new BigDecimal(duration), 2, RoundingMode.HALF_UP) : BigDecimal.ZERO);
        BigDecimal projectedTotal = (daysRemaining > 0) ? totalSpent.add(velocityDaily.multiply(new BigDecimal(daysRemaining))) : totalSpent;
        BigDecimal projectedRemaining = (daysRemaining > 0) ? velocityDaily.multiply(new BigDecimal(daysRemaining)) : BigDecimal.ZERO;

        String pacingStatus = "ON_TRACK";
        if (totalBudget.compareTo(BigDecimal.ZERO) > 0) {
            if (projectedTotal.compareTo(totalBudget) > 0) pacingStatus = "OVER_BUDGET";
            else pacingStatus = "UNDER_BUDGET";
        }

        int travelersCount = Math.max(1, participants.size());
        BigDecimal costPerDay = dailyAvg;
        BigDecimal costPerPersonPerDay = (travelersCount > 0)
                ? costPerDay.divide(new BigDecimal(travelersCount), 2, RoundingMode.HALF_UP)
                : costPerDay;

        BigDecimal avgExpenseSize = (!expenses.isEmpty())
                ? totalSpent.divide(new BigDecimal(expenses.size()), 2, RoundingMode.HALF_UP)
                : BigDecimal.ZERO;

        BigDecimal totalPaymentsMade = payments.stream().map(TripExpensePayment::getAmount).reduce(BigDecimal.ZERO, BigDecimal::add);
        BigDecimal paymentCoverage = (totalSpent.compareTo(BigDecimal.ZERO) > 0)
                ? totalPaymentsMade.multiply(new BigDecimal("100")).divide(totalSpent, 1, RoundingMode.HALF_UP)
                : new BigDecimal("100.0");

        // Category breakdown
        Map<TripCategory, BigDecimal> spendMap = expenses.stream()
                .collect(Collectors.groupingBy(TripExpense::getCategory, Collectors.reducing(BigDecimal.ZERO, TripExpense::getAmount, BigDecimal::add)));

        Map<TripCategory, BigDecimal> budgetMap = budgets.stream()
                .collect(Collectors.toMap(TripCategoryBudget::getCategory, TripCategoryBudget::getBudgetAmount, (a, b) -> a));

        List<TripInsightsDto.CategorySpendingItemDto> categoryItems = new ArrayList<>();
        for (TripCategory cat : TripCategory.values()) {
            BigDecimal spent = spendMap.getOrDefault(cat, BigDecimal.ZERO);
            BigDecimal catBudget = budgetMap.getOrDefault(cat, BigDecimal.ZERO);

            BigDecimal pctOfTotal = (totalSpent.compareTo(BigDecimal.ZERO) > 0)
                    ? spent.multiply(new BigDecimal("100")).divide(totalSpent, 1, RoundingMode.HALF_UP)
                    : BigDecimal.ZERO;

            BigDecimal catUtil = (catBudget.compareTo(BigDecimal.ZERO) > 0)
                    ? spent.multiply(new BigDecimal("100")).divide(catBudget, 1, RoundingMode.HALF_UP)
                    : BigDecimal.ZERO;

            categoryItems.add(new TripInsightsDto.CategorySpendingItemDto(
                    cat, cat.getDisplayName(), spent, catBudget, pctOfTotal, catUtil
            ));
        }

        // Recommendations
        List<String> recs = new ArrayList<>();
        if (totalBudget.compareTo(BigDecimal.ZERO) <= 0) {
            recs.add("Set a trip target budget on the Budget sub-tab to unlock automated spending velocity alerts.");
        } else if (usedPercent.compareTo(new BigDecimal("80")) > 0) {
            recs.add("You have utilized " + usedPercent + "% of the total trip budget with " + daysRemaining + " days remaining.");
        } else {
            recs.add("Trip spending is currently on track at " + usedPercent + "% budget utilization.");
        }

        if (expenses.isEmpty()) {
            recs.add("Keep logging expenses to unlock live group settlements and category breakdowns.");
        }

        TripInsightsDto dto = new TripInsightsDto();
        dto.setTotalBudget(totalBudget);
        dto.setTotalSpent(totalSpent);
        dto.setBudgetLeft(budgetLeft);
        dto.setUsedPercent(usedPercent);
        dto.setDailyAverage(dailyAvg);
        dto.setTripDurationDays(duration);
        dto.setDaysElapsed(daysElapsed);
        dto.setDaysRemaining(daysRemaining);
        dto.setSpendingVelocityDaily(velocityDaily);
        dto.setProjectedTotalCost(projectedTotal);
        dto.setProjectedRemainingSpend(projectedRemaining);
        dto.setBudgetPacingStatus(pacingStatus);
        dto.setCostPerDay(costPerDay);
        dto.setCostPerPersonPerDay(costPerPersonPerDay);
        dto.setAverageExpenseSize(avgExpenseSize);
        dto.setTotalPaymentsMade(totalPaymentsMade);
        dto.setPaymentCoveragePercent(paymentCoverage);
        dto.setTotalExpensesCount(expenses.size());
        dto.setFullyPaidExpensesCount((int) expenses.stream().filter(e -> "PAID".equalsIgnoreCase(e.getPaymentStatus())).count());
        dto.setPendingExpensesCount((int) expenses.stream().filter(e -> !"PAID".equalsIgnoreCase(e.getPaymentStatus())).count());
        dto.setCategoryBreakdown(categoryItems);
        dto.setRecommendations(recs);

        return dto;
    }

    // ==========================================
    // Packing & Checklist
    // ==========================================

    @Transactional(readOnly = true)
    public List<TripPackingItemDto> getPackingItems(String tripId, PackingCategory category) {
        List<TripPackingItem> items = (category != null)
                ? packingRepo.findByTripIdAndCategoryOrderByCreatedAtAsc(tripId, category)
                : packingRepo.findByTripIdOrderByCreatedAtAsc(tripId);

        return items.stream()
                .map(i -> new TripPackingItemDto(i.getId(), i.getTripId(), i.getName(), i.getCategory(), i.isPacked(), i.getCreatedAt()))
                .collect(Collectors.toList());
    }

    public TripPackingItemDto createPackingItem(String tripId, CreatePackingItemRequest req) {
        if (req.getName() == null || req.getName().trim().isEmpty()) {
            throw new IllegalArgumentException("Item name is required");
        }

        TripPackingItem item = new TripPackingItem(
                "tpi_" + UUID.randomUUID().toString(),
                tripId,
                req.getName().trim(),
                req.getCategory(),
                false
        );

        TripPackingItem saved = packingRepo.save(item);
        return new TripPackingItemDto(saved.getId(), saved.getTripId(), saved.getName(), saved.getCategory(), saved.isPacked(), saved.getCreatedAt());
    }

    public void togglePackingItem(String tripId, String itemId, boolean packed) {
        TripPackingItem item = packingRepo.findById(itemId)
                .orElseThrow(() -> new IllegalArgumentException("Packing item not found"));

        if (!item.getTripId().equals(tripId)) {
            throw new SecurityException("Unauthorized");
        }

        item.setPacked(packed);
        packingRepo.save(item);
    }

    public void deletePackingItem(String tripId, String itemId) {
        TripPackingItem item = packingRepo.findById(itemId)
                .orElseThrow(() -> new IllegalArgumentException("Packing item not found"));

        if (!item.getTripId().equals(tripId)) {
            throw new SecurityException("Unauthorized");
        }

        packingRepo.delete(item);
    }

    public void seedPackingTemplate(String tripId, PackingTemplate template) {
        List<String[]> templateItems = new ArrayList<>();
        if (template == PackingTemplate.BASIC_ESSENTIALS) {
            templateItems.add(new String[]{"Passports & IDs", "DOCUMENTS"});
            templateItems.add(new String[]{"Flight / Transit Tickets", "DOCUMENTS"});
            templateItems.add(new String[]{"Phone Chargers & Power Bank", "ELECTRONICS"});
            templateItems.add(new String[]{"Toothbrush & Travel Paste", "TOILETRIES"});
            templateItems.add(new String[]{"Basic First Aid & Prescription Meds", "MEDICINE"});
            templateItems.add(new String[]{"Comfortable Walking Shoes", "CLOTHING"});
        } else if (template == PackingTemplate.BEACH_TRIP) {
            templateItems.add(new String[]{"Swimwear & UV Rashguard", "CLOTHING"});
            templateItems.add(new String[]{"Sunscreen SPF 50+", "TOILETRIES"});
            templateItems.add(new String[]{"Polarized Sunglasses", "ESSENTIALS"});
            templateItems.add(new String[]{"Quick-Dry Microfiber Beach Towel", "ESSENTIALS"});
            templateItems.add(new String[]{"Waterproof Phone Pouch", "ELECTRONICS"});
            templateItems.add(new String[]{"Flip-Flops / Water Shoes", "CLOTHING"});
        } else if (template == PackingTemplate.BUSINESS) {
            templateItems.add(new String[]{"Laptop & Power Adapter", "ELECTRONICS"});
            templateItems.add(new String[]{"Formal Blazer / Business Suits", "CLOTHING"});
            templateItems.add(new String[]{"HDMI / Display Dongles", "ELECTRONICS"});
            templateItems.add(new String[]{"Business Cards", "DOCUMENTS"});
            templateItems.add(new String[]{"Noise-Cancelling Headset", "ELECTRONICS"});
        } else {
            templateItems.add(new String[]{"Thermal Innerwear Tops & Bottoms", "CLOTHING"});
            templateItems.add(new String[]{"Windproof Heavy Jacket / Parka", "CLOTHING"});
            templateItems.add(new String[]{"Woolen Beanie & Gloves", "CLOTHING"});
            templateItems.add(new String[]{"Insulated Trekking Boots", "CLOTHING"});
            templateItems.add(new String[]{"Lip Balm & Cold Cream", "TOILETRIES"});
        }

        for (String[] pair : templateItems) {
            packingRepo.save(new TripPackingItem(
                    "tpi_" + UUID.randomUUID().toString(),
                    tripId,
                    pair[0],
                    PackingCategory.valueOf(pair[1]),
                    false
            ));
        }
    }

    @Transactional(readOnly = true)
    public List<TripChecklistItemDto> getChecklistItems(String tripId) {
        Map<String, String> participantNames = participantRepo.findByTripIdOrderByCreatedAtAsc(tripId).stream()
                .collect(Collectors.toMap(TripParticipant::getId, TripParticipant::getName, (a, b) -> a));

        return checklistRepo.findByTripIdOrderByCreatedAtAsc(tripId).stream()
                .map(i -> mapToChecklistDto(i, participantNames))
                .collect(Collectors.toList());
    }

    public TripChecklistItemDto createChecklistItem(String tripId, CreateChecklistItemRequest req) {
        if (req.getTitle() == null || req.getTitle().trim().isEmpty()) {
            throw new IllegalArgumentException("Task title is required");
        }

        TripChecklistItem item = new TripChecklistItem(
                "tcl_" + UUID.randomUUID().toString(),
                tripId,
                req.getTitle().trim(),
                req.getCategory(),
                req.getPriority(),
                req.getDueDate(),
                req.getAssignedParticipantId(),
                req.getDescription(),
                false
        );

        TripChecklistItem saved = checklistRepo.save(item);
        Map<String, String> participantNames = participantRepo.findByTripIdOrderByCreatedAtAsc(tripId).stream()
                .collect(Collectors.toMap(TripParticipant::getId, TripParticipant::getName, (a, b) -> a));

        return mapToChecklistDto(saved, participantNames);
    }

    public TripChecklistItemDto updateChecklistItem(String tripId, String itemId, UpdateChecklistItemRequest req) {
        TripChecklistItem item = checklistRepo.findById(itemId)
                .orElseThrow(() -> new IllegalArgumentException("Checklist item not found"));

        if (!item.getTripId().equals(tripId)) {
            throw new SecurityException("Unauthorized");
        }

        if (req.getTitle() != null) item.setTitle(req.getTitle().trim());
        if (req.getCategory() != null) item.setCategory(req.getCategory());
        if (req.getPriority() != null) item.setPriority(req.getPriority());
        if (req.getDueDate() != null) item.setDueDate(req.getDueDate());
        if (req.getAssignedParticipantId() != null) item.setAssignedParticipantId(req.getAssignedParticipantId());
        if (req.getDescription() != null) item.setDescription(req.getDescription());
        if (req.getDone() != null) item.setDone(req.getDone());

        TripChecklistItem saved = checklistRepo.save(item);
        Map<String, String> participantNames = participantRepo.findByTripIdOrderByCreatedAtAsc(tripId).stream()
                .collect(Collectors.toMap(TripParticipant::getId, TripParticipant::getName, (a, b) -> a));

        return mapToChecklistDto(saved, participantNames);
    }

    public void deleteChecklistItem(String tripId, String itemId) {
        TripChecklistItem item = checklistRepo.findById(itemId)
                .orElseThrow(() -> new IllegalArgumentException("Checklist item not found"));

        if (!item.getTripId().equals(tripId)) {
            throw new SecurityException("Unauthorized");
        }

        checklistRepo.delete(item);
    }

    // ==========================================
    // Helpers
    // ==========================================

    private Trip findTripForUser(String userId, String tripId) {
        Trip trip = tripRepo.findById(tripId)
                .orElseThrow(() -> new IllegalArgumentException("Trip not found with ID: " + tripId));
        if (!trip.getUserId().equals(userId)) {
            throw new SecurityException("Unauthorized access to trip");
        }
        return trip;
    }

    private TripDto mapToTripDto(Trip t) {
        TripDto dto = new TripDto();
        dto.setId(t.getId());
        dto.setUserId(t.getUserId());
        dto.setName(t.getName());
        dto.setDestination(t.getDestination());
        dto.setDepartureLocation(t.getDepartureLocation());
        dto.setAdultsCount(t.getAdultsCount());
        dto.setKidsCount(t.getKidsCount());
        dto.setStartDate(t.getStartDate());
        dto.setEndDate(t.getEndDate());
        dto.setHotelPreference(t.getHotelPreference());
        dto.setAdditionalDetails(t.getAdditionalDetails());
        dto.setStatus(t.getStatus());
        dto.setTotalBudget(t.getTotalBudget());
        dto.setCreatedAt(t.getCreatedAt());
        dto.setUpdatedAt(t.getUpdatedAt());

        // Quick aggregate rollups
        List<TripExpense> expenses = expenseRepo.findByTripIdOrderByExpenseDateDescCreatedAtDesc(t.getId());
        BigDecimal spent = expenses.stream().map(TripExpense::getAmount).reduce(BigDecimal.ZERO, BigDecimal::add);
        dto.setTotalSpent(spent);

        dto.setParticipantsCount(participantRepo.findByTripIdOrderByCreatedAtAsc(t.getId()).size());
        dto.setStopsCount(planStopRepo.findByTripIdOrderByStopDateAscStopTimeAsc(t.getId()).size());

        List<TripChecklistItem> tasks = checklistRepo.findByTripIdOrderByCreatedAtAsc(t.getId());
        dto.setChecklistTotalCount(tasks.size());
        dto.setChecklistOpenCount((int) tasks.stream().filter(x -> !x.isDone()).count());

        List<TripPackingItem> packs = packingRepo.findByTripIdOrderByCreatedAtAsc(t.getId());
        dto.setPackingTotalCount(packs.size());
        dto.setPackingPackedCount((int) packs.stream().filter(TripPackingItem::isPacked).count());

        return dto;
    }

    private TripParticipantDto mapToParticipantDto(TripParticipant p, Map<String, String> nameMap) {
        TripParticipantDto dto = new TripParticipantDto();
        dto.setId(p.getId());
        dto.setTripId(p.getTripId());
        dto.setName(p.getName());
        dto.setEmail(p.getEmail());
        dto.setMobile(p.getMobile());
        dto.setDob(p.getDob());
        dto.setPreferredLanguage(p.getPreferredLanguage());
        dto.setFoodPreferences(p.getFoodPreferences());
        dto.setCategory(p.getCategory());
        dto.setParentParticipantId(p.getParentParticipantId());
        if (p.getParentParticipantId() != null) {
            dto.setParentName(nameMap.get(p.getParentParticipantId()));
        }
        dto.setCreatedAt(p.getCreatedAt());
        return dto;
    }

    private TripPlanStopDto mapToPlanStopDto(TripPlanStop s) {
        TripPlanStopDto dto = new TripPlanStopDto();
        dto.setId(s.getId());
        dto.setTripId(s.getTripId());
        dto.setStopDate(s.getStopDate());
        dto.setStopTime(s.getStopTime());
        dto.setTitle(s.getTitle());
        dto.setCategory(s.getCategory());
        dto.setLocation(s.getLocation());
        dto.setDescription(s.getDescription());
        dto.setEstimatedCost(s.getEstimatedCost());
        dto.setNotes(s.getNotes());
        dto.setCreatedAt(s.getCreatedAt());
        dto.setUpdatedAt(s.getUpdatedAt());

        if (s.getAssignedParticipantIds() != null && !s.getAssignedParticipantIds().isEmpty()) {
            dto.setAssignedParticipantIds(Arrays.asList(s.getAssignedParticipantIds().split(",")));
        }
        return dto;
    }

    private TripExpenseDto mapToExpenseDto(TripExpense e, Map<String, String> participantNames) {
        TripExpenseDto dto = new TripExpenseDto();
        dto.setId(e.getId());
        dto.setTripId(e.getTripId());
        dto.setPayerId(e.getPayerId());
        dto.setPayerName(e.getPayerId() != null ? participantNames.get(e.getPayerId()) : null);
        dto.setDescription(e.getDescription());
        dto.setCategory(e.getCategory());
        dto.setAmount(e.getAmount());
        dto.setOriginalCurrency(e.getOriginalCurrency());
        dto.setOriginalAmount(e.getOriginalAmount());
        dto.setExpenseDate(e.getExpenseDate());
        dto.setPaymentStatus(e.getPaymentStatus());
        dto.setNotes(e.getNotes());
        dto.setCreatedAt(e.getCreatedAt());
        dto.setUpdatedAt(e.getUpdatedAt());

        List<TripExpenseSplit> splits = expenseSplitRepo.findByExpenseId(e.getId());
        dto.setSplits(splits.stream().map(s -> new TripExpenseSplitDto(
                s.getId(),
                s.getParticipantId(),
                participantNames.get(s.getParticipantId()),
                s.getSplitType(),
                s.getSplitValue(),
                s.getComputedAmount()
        )).collect(Collectors.toList()));

        List<TripExpensePayment> payments = paymentRepo.findByExpenseId(e.getId());
        dto.setPayments(payments.stream().map(p -> new TripExpensePaymentDto(
                p.getId(),
                p.getTripId(),
                p.getExpenseId(),
                p.getFromParticipantId(),
                participantNames.get(p.getFromParticipantId()),
                p.getToParticipantId(),
                participantNames.get(p.getToParticipantId()),
                p.getAmount(),
                p.getPaymentMethod(),
                p.getPaymentDate(),
                p.getPaymentStatus(),
                p.getReferenceId(),
                p.getNotes(),
                p.getCreatedAt()
        )).collect(Collectors.toList()));

        return dto;
    }

    private TripChecklistItemDto mapToChecklistDto(TripChecklistItem i, Map<String, String> participantNames) {
        TripChecklistItemDto dto = new TripChecklistItemDto();
        dto.setId(i.getId());
        dto.setTripId(i.getTripId());
        dto.setTitle(i.getTitle());
        dto.setCategory(i.getCategory());
        dto.setPriority(i.getPriority());
        dto.setDueDate(i.getDueDate());
        dto.setAssignedParticipantId(i.getAssignedParticipantId());
        if (i.getAssignedParticipantId() != null) {
            dto.setAssignedParticipantName(participantNames.get(i.getAssignedParticipantId()));
        }
        dto.setDescription(i.getDescription());
        dto.setDone(i.isDone());
        dto.setCreatedAt(i.getCreatedAt());
        return dto;
    }
}
