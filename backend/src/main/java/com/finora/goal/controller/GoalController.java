package com.finora.goal.controller;

import com.finora.common.auth.UserPrincipal;
import com.finora.goal.dto.*;
import com.finora.goal.model.GoalStatus;
import com.finora.goal.service.GoalService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1/goals")
@RequiredArgsConstructor
public class GoalController {

    private final GoalService goalService;

    @GetMapping("/dashboard")
    public ResponseEntity<GoalDashboardSummaryDto> getDashboardSummary(@AuthenticationPrincipal UserPrincipal principal) {
        String userId = principal != null ? principal.getId() : "demo-user";
        return ResponseEntity.ok(goalService.getDashboardSummary(userId));
    }

    @GetMapping
    public ResponseEntity<List<GoalDto>> getGoals(
            @AuthenticationPrincipal UserPrincipal principal,
            @RequestParam(required = false) GoalStatus status) {
        String userId = principal != null ? principal.getId() : "demo-user";
        return ResponseEntity.ok(goalService.getGoals(userId, status));
    }

    @GetMapping("/{id}")
    public ResponseEntity<GoalDetailResponse> getGoalDetail(
            @AuthenticationPrincipal UserPrincipal principal,
            @PathVariable String id) {
        String userId = principal != null ? principal.getId() : "demo-user";
        return ResponseEntity.ok(goalService.getGoalDetail(id, userId));
    }

    @PostMapping
    public ResponseEntity<GoalDto> createGoal(
            @AuthenticationPrincipal UserPrincipal principal,
            @RequestBody CreateGoalRequest request) {
        String userId = principal != null ? principal.getId() : "demo-user";
        return ResponseEntity.ok(goalService.createGoal(request, userId));
    }

    @PutMapping("/{id}")
    public ResponseEntity<GoalDto> updateGoal(
            @AuthenticationPrincipal UserPrincipal principal,
            @PathVariable String id,
            @RequestBody CreateGoalRequest request) {
        String userId = principal != null ? principal.getId() : "demo-user";
        return ResponseEntity.ok(goalService.updateGoal(id, request, userId));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteGoal(
            @AuthenticationPrincipal UserPrincipal principal,
            @PathVariable String id) {
        String userId = principal != null ? principal.getId() : "demo-user";
        goalService.deleteGoal(id, userId);
        return ResponseEntity.noContent().build();
    }

    @PostMapping("/{id}/contribute")
    public ResponseEntity<GoalDto> recordContribution(
            @AuthenticationPrincipal UserPrincipal principal,
            @PathVariable String id,
            @RequestBody CreateContributionRequest request) {
        String userId = principal != null ? principal.getId() : "demo-user";
        request.setGoalId(id);
        return ResponseEntity.ok(goalService.recordContribution(request, userId));
    }

    @PostMapping("/bulk-contribute")
    public ResponseEntity<List<GoalDto>> recordBulkContribution(
            @AuthenticationPrincipal UserPrincipal principal,
            @RequestBody BulkContributionRequest request) {
        String userId = principal != null ? principal.getId() : "demo-user";
        return ResponseEntity.ok(goalService.recordBulkContribution(request, userId));
    }

    @PatchMapping("/{id}/status")
    public ResponseEntity<GoalDto> updateGoalStatus(
            @AuthenticationPrincipal UserPrincipal principal,
            @PathVariable String id,
            @RequestParam GoalStatus status) {
        String userId = principal != null ? principal.getId() : "demo-user";
        return ResponseEntity.ok(goalService.updateGoalStatus(id, status, userId));
    }

    @GetMapping("/settings")
    public ResponseEntity<GoalManagerSettingsDto> getSettings(@AuthenticationPrincipal UserPrincipal principal) {
        String userId = principal != null ? principal.getId() : "demo-user";
        return ResponseEntity.ok(goalService.getSettings(userId));
    }

    @PutMapping("/settings")
    public ResponseEntity<GoalManagerSettingsDto> updateSettings(
            @AuthenticationPrincipal UserPrincipal principal,
            @RequestBody GoalManagerSettingsDto dto) {
        String userId = principal != null ? principal.getId() : "demo-user";
        return ResponseEntity.ok(goalService.updateSettings(dto, userId));
    }

    @PostMapping("/seed")
    public ResponseEntity<Void> seedSampleData(@AuthenticationPrincipal UserPrincipal principal) {
        String userId = principal != null ? principal.getId() : "demo-user";
        goalService.seedSampleData(userId);
        return ResponseEntity.ok().build();
    }
}
