package com.finora.insights.controller;

import com.finora.common.auth.security.UserPrincipal;
import com.finora.insights.dto.SuiteInsightsDto;
import com.finora.insights.service.SuiteInsightsService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/v1/insights")
@RequiredArgsConstructor
@CrossOrigin(origins = "*")
@Tag(name = "Suite-Wide Insights", description = "Consolidated Cross-Module Financial Intelligence, Composite Health Score, and Strategic Recommendations")
public class SuiteInsightsController {

    private final SuiteInsightsService suiteInsightsService;

    private String resolveUserId(UserPrincipal principal) {
        return principal != null ? principal.getId() : "usr_demo_user_001";
    }

    @GetMapping("/suite")
    @Operation(summary = "Get Suite-Wide Insights & Composite Health Score", description = "Aggregates real data across all 8 modules (Tracks A & B) into a unified executive intelligence view")
    public ResponseEntity<SuiteInsightsDto> getSuiteInsights(@AuthenticationPrincipal UserPrincipal principal) {
        return ResponseEntity.ok(suiteInsightsService.getSuiteInsights(resolveUserId(principal)));
    }
}
