package com.finora.trip.controller;

import com.finora.common.auth.security.UserPrincipal;
import com.finora.trip.dto.*;
import com.finora.trip.model.PackingCategory;
import com.finora.trip.model.PackingTemplate;
import com.finora.trip.model.TripCategory;
import com.finora.trip.service.TripAiPlannerService;
import com.finora.trip.service.TripService;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.List;

@RestController
@RequestMapping("/api/v1/trips")
public class TripController {

    private final TripService tripService;
    private final TripAiPlannerService aiPlannerService;

    public TripController(TripService tripService, TripAiPlannerService aiPlannerService) {
        this.tripService = tripService;
        this.aiPlannerService = aiPlannerService;
    }

    private String resolveUserId(UserPrincipal principal) {
        return principal != null ? principal.getId() : "usr_demo_user_001";
    }

    // ==========================================
    // Trip Lifecycle Endpoints
    // ==========================================

    @GetMapping
    public ResponseEntity<List<TripDto>> listTrips(@AuthenticationPrincipal UserPrincipal principal) {
        return ResponseEntity.ok(tripService.getTrips(resolveUserId(principal)));
    }

    @GetMapping("/{tripId}")
    public ResponseEntity<TripDto> getTrip(@AuthenticationPrincipal UserPrincipal principal,
                                           @PathVariable String tripId) {
        return ResponseEntity.ok(tripService.getTrip(resolveUserId(principal), tripId));
    }

    @PostMapping
    public ResponseEntity<TripDto> createTrip(@AuthenticationPrincipal UserPrincipal principal,
                                             @RequestBody CreateTripRequest req) {
        return ResponseEntity.ok(tripService.createTrip(resolveUserId(principal), req));
    }

    @PutMapping("/{tripId}")
    public ResponseEntity<TripDto> updateTrip(@AuthenticationPrincipal UserPrincipal principal,
                                             @PathVariable String tripId,
                                             @RequestBody UpdateTripRequest req) {
        return ResponseEntity.ok(tripService.updateTrip(resolveUserId(principal), tripId, req));
    }

    @DeleteMapping("/{tripId}")
    public ResponseEntity<Void> deleteTrip(@AuthenticationPrincipal UserPrincipal principal,
                                           @PathVariable String tripId) {
        tripService.deleteTrip(resolveUserId(principal), tripId);
        return ResponseEntity.noContent().build();
    }

    @PostMapping("/sample-vietnam")
    public ResponseEntity<TripDto> seedSampleVietnam(@AuthenticationPrincipal UserPrincipal principal) {
        return ResponseEntity.ok(tripService.seedSampleVietnamTrip(resolveUserId(principal)));
    }

    @PostMapping("/ai-plan")
    public ResponseEntity<AiTripPlanResponse> generateAiPlan(@RequestBody AiTripPlanRequest req) {
        return ResponseEntity.ok(aiPlannerService.generatePlan(req));
    }

    // ==========================================
    // Participants & Family Nesting
    // ==========================================

    @GetMapping("/{tripId}/participants")
    public ResponseEntity<List<TripParticipantDto>> getParticipants(@PathVariable String tripId) {
        return ResponseEntity.ok(tripService.getParticipants(tripId));
    }

    @PostMapping("/{tripId}/participants")
    public ResponseEntity<TripParticipantDto> createParticipant(@PathVariable String tripId,
                                                                @RequestBody CreateParticipantRequest req) {
        return ResponseEntity.ok(tripService.createParticipant(tripId, req));
    }

    @PutMapping("/{tripId}/participants/{participantId}")
    public ResponseEntity<TripParticipantDto> updateParticipant(@PathVariable String tripId,
                                                                @PathVariable String participantId,
                                                                @RequestBody UpdateParticipantRequest req) {
        return ResponseEntity.ok(tripService.updateParticipant(tripId, participantId, req));
    }

    @DeleteMapping("/{tripId}/participants/{participantId}")
    public ResponseEntity<Void> deleteParticipant(@PathVariable String tripId,
                                                  @PathVariable String participantId) {
        tripService.deleteParticipant(tripId, participantId);
        return ResponseEntity.noContent().build();
    }

    @PostMapping("/{tripId}/participants/copy-from/{fromTripId}")
    public ResponseEntity<Void> copyParticipants(@PathVariable String tripId,
                                                 @PathVariable String fromTripId) {
        tripService.copyParticipants(fromTripId, tripId);
        return ResponseEntity.ok().build();
    }

    // ==========================================
    // Day-by-Day Plan Stops
    // ==========================================

    @GetMapping("/{tripId}/plan-stops")
    public ResponseEntity<List<TripPlanStopDto>> getPlanStops(@PathVariable String tripId,
                                                              @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate date) {
        return ResponseEntity.ok(tripService.getPlanStops(tripId, date));
    }

    @PostMapping("/{tripId}/plan-stops")
    public ResponseEntity<TripPlanStopDto> createPlanStop(@PathVariable String tripId,
                                                          @RequestBody CreatePlanStopRequest req) {
        return ResponseEntity.ok(tripService.createPlanStop(tripId, req));
    }

    @PutMapping("/{tripId}/plan-stops/{stopId}")
    public ResponseEntity<TripPlanStopDto> updatePlanStop(@PathVariable String tripId,
                                                          @PathVariable String stopId,
                                                          @RequestBody UpdatePlanStopRequest req) {
        return ResponseEntity.ok(tripService.updatePlanStop(tripId, stopId, req));
    }

    @DeleteMapping("/{tripId}/plan-stops/{stopId}")
    public ResponseEntity<Void> deletePlanStop(@PathVariable String tripId,
                                               @PathVariable String stopId) {
        tripService.deletePlanStop(tripId, stopId);
        return ResponseEntity.noContent().build();
    }

    // ==========================================
    // Category Budgets
    // ==========================================

    @GetMapping("/{tripId}/budgets")
    public ResponseEntity<List<TripCategoryBudgetDto>> getCategoryBudgets(@PathVariable String tripId) {
        return ResponseEntity.ok(tripService.getCategoryBudgets(tripId));
    }

    @PutMapping("/{tripId}/budgets")
    public ResponseEntity<Void> setCategoryBudget(@PathVariable String tripId,
                                                  @RequestBody SetCategoryBudgetRequest req) {
        tripService.setCategoryBudget(tripId, req);
        return ResponseEntity.ok().build();
    }

    // ==========================================
    // Expenses & Splits & Payments
    // ==========================================

    @GetMapping("/{tripId}/expenses")
    public ResponseEntity<List<TripExpenseDto>> getExpenses(@PathVariable String tripId,
                                                            @RequestParam(required = false) TripCategory category) {
        return ResponseEntity.ok(tripService.getExpenses(tripId, category));
    }

    @PostMapping("/{tripId}/expenses")
    public ResponseEntity<TripExpenseDto> createExpense(@PathVariable String tripId,
                                                        @RequestBody CreateExpenseRequest req) {
        return ResponseEntity.ok(tripService.createExpense(tripId, req));
    }

    @PutMapping("/{tripId}/expenses/{expenseId}")
    public ResponseEntity<TripExpenseDto> updateExpense(@PathVariable String tripId,
                                                        @PathVariable String expenseId,
                                                        @RequestBody UpdateExpenseRequest req) {
        return ResponseEntity.ok(tripService.updateExpense(tripId, expenseId, req));
    }

    @DeleteMapping("/{tripId}/expenses/{expenseId}")
    public ResponseEntity<Void> deleteExpense(@PathVariable String tripId,
                                              @PathVariable String expenseId) {
        tripService.deleteExpense(tripId, expenseId);
        return ResponseEntity.noContent().build();
    }

    @PostMapping("/{tripId}/smart-split")
    public ResponseEntity<SmartSplitResponse> calculateSmartSplit(@PathVariable String tripId,
                                                                 @RequestBody SmartSplitRequest req) {
        return ResponseEntity.ok(tripService.calculateSmartSplit(req));
    }

    @GetMapping("/{tripId}/settle")
    public ResponseEntity<SettleMatrixDto> getSettleMatrix(@PathVariable String tripId) {
        return ResponseEntity.ok(tripService.getSettleMatrix(tripId));
    }

    @PostMapping("/{tripId}/payments")
    public ResponseEntity<Void> createPayment(@PathVariable String tripId,
                                              @RequestBody CreatePaymentRequest req) {
        tripService.createPayment(tripId, req);
        return ResponseEntity.ok().build();
    }

    // ==========================================
    // Insights & Analytics
    // ==========================================

    @GetMapping("/{tripId}/insights")
    public ResponseEntity<TripInsightsDto> getInsights(@PathVariable String tripId) {
        return ResponseEntity.ok(tripService.getInsights(tripId));
    }

    // ==========================================
    // Packing & Checklist
    // ==========================================

    @GetMapping("/{tripId}/packing")
    public ResponseEntity<List<TripPackingItemDto>> getPackingItems(@PathVariable String tripId,
                                                                    @RequestParam(required = false) PackingCategory category) {
        return ResponseEntity.ok(tripService.getPackingItems(tripId, category));
    }

    @PostMapping("/{tripId}/packing")
    public ResponseEntity<TripPackingItemDto> createPackingItem(@PathVariable String tripId,
                                                                @RequestBody CreatePackingItemRequest req) {
        return ResponseEntity.ok(tripService.createPackingItem(tripId, req));
    }

    @PutMapping("/{tripId}/packing/{itemId}/toggle")
    public ResponseEntity<Void> togglePackingItem(@PathVariable String tripId,
                                                  @PathVariable String itemId,
                                                  @RequestParam boolean packed) {
        tripService.togglePackingItem(tripId, itemId, packed);
        return ResponseEntity.ok().build();
    }

    @DeleteMapping("/{tripId}/packing/{itemId}")
    public ResponseEntity<Void> deletePackingItem(@PathVariable String tripId,
                                                  @PathVariable String itemId) {
        tripService.deletePackingItem(tripId, itemId);
        return ResponseEntity.noContent().build();
    }

    @PostMapping("/{tripId}/packing/seed-template")
    public ResponseEntity<Void> seedPackingTemplate(@PathVariable String tripId,
                                                    @RequestBody SeedPackingTemplateRequest req) {
        tripService.seedPackingTemplate(tripId, req.getTemplate() != null ? req.getTemplate() : PackingTemplate.BASIC_ESSENTIALS);
        return ResponseEntity.ok().build();
    }

    @GetMapping("/{tripId}/checklist")
    public ResponseEntity<List<TripChecklistItemDto>> getChecklist(@PathVariable String tripId) {
        return ResponseEntity.ok(tripService.getChecklistItems(tripId));
    }

    @PostMapping("/{tripId}/checklist")
    public ResponseEntity<TripChecklistItemDto> createChecklistItem(@PathVariable String tripId,
                                                                    @RequestBody CreateChecklistItemRequest req) {
        return ResponseEntity.ok(tripService.createChecklistItem(tripId, req));
    }

    @PutMapping("/{tripId}/checklist/{itemId}")
    public ResponseEntity<TripChecklistItemDto> updateChecklistItem(@PathVariable String tripId,
                                                                    @PathVariable String itemId,
                                                                    @RequestBody UpdateChecklistItemRequest req) {
        return ResponseEntity.ok(tripService.updateChecklistItem(tripId, itemId, req));
    }

    @DeleteMapping("/{tripId}/checklist/{itemId}")
    public ResponseEntity<Void> deleteChecklistItem(@PathVariable String tripId,
                                                    @PathVariable String itemId) {
        tripService.deleteChecklistItem(tripId, itemId);
        return ResponseEntity.noContent().build();
    }
}
