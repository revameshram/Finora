package com.finora.networth.controller;

import com.finora.common.auth.security.UserPrincipal;
import com.finora.networth.contract.dto.CreateLiabilityRequest;
import com.finora.networth.contract.dto.NetWorthLiabilityDto;
import com.finora.networth.dto.*;
import com.finora.networth.service.NetWorthAnalyticsService;
import com.finora.networth.service.NetWorthAssetService;
import com.finora.networth.service.NetWorthLiabilityService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1/networth")
@RequiredArgsConstructor
@Tag(name = "Net Worth Tracker", description = "Assets, Liabilities, Consolidated Summary, Growth Projections, Financial Health Insights, and Cross-Track Loan Synchronization")
public class NetWorthController {

    private final NetWorthAssetService assetService;
    private final NetWorthLiabilityService liabilityService;
    private final NetWorthAnalyticsService analyticsService;

    private String resolveUserId(UserPrincipal principal) {
        return principal != null ? principal.getId() : "usr_demo_user_001";
    }

    // ==================================================================
    // Cross-Track Liabilities Contract (Fulfills EMI Manager Sync)
    // ==================================================================

    @GetMapping("/liabilities")
    @Operation(summary = "Get liabilities list (fulfills cross-track contract for EMI Manager)")
    public ResponseEntity<List<NetWorthLiabilityDto>> getLiabilities(@AuthenticationPrincipal UserPrincipal principal) {
        return ResponseEntity.ok(liabilityService.listLiabilities(resolveUserId(principal)));
    }

    @PostMapping("/liabilities")
    @Operation(summary = "Push new liability into Net Worth Tracker (called by EMI Manager)")
    public ResponseEntity<NetWorthLiabilityDto> createLiabilityContract(@AuthenticationPrincipal UserPrincipal principal,
                                                                         @Valid @RequestBody CreateLiabilityRequest req) {
        return ResponseEntity.status(HttpStatus.CREATED).body(liabilityService.createLiabilityFromContract(resolveUserId(principal), req));
    }

    @GetMapping("/liabilities/{id}")
    public ResponseEntity<NetWorthLiabilityDto> getLiability(@AuthenticationPrincipal UserPrincipal principal, @PathVariable String id) {
        return ResponseEntity.ok(liabilityService.getLiability(resolveUserId(principal), id));
    }

    @PutMapping("/liabilities/{id}")
    public ResponseEntity<NetWorthLiabilityDto> updateLiability(@AuthenticationPrincipal UserPrincipal principal,
                                                                 @PathVariable String id, @RequestBody UpdateLiabilityRequest req) {
        return ResponseEntity.ok(liabilityService.updateLiability(resolveUserId(principal), id, req));
    }

    @PostMapping("/liabilities/{id}/delink")
    public ResponseEntity<NetWorthLiabilityDto> delinkLiability(@AuthenticationPrincipal UserPrincipal principal, @PathVariable String id) {
        return ResponseEntity.ok(liabilityService.delinkLiability(resolveUserId(principal), id));
    }

    @DeleteMapping("/liabilities/{id}")
    public ResponseEntity<Void> deleteLiability(@AuthenticationPrincipal UserPrincipal principal, @PathVariable String id) {
        liabilityService.deleteLiability(resolveUserId(principal), id);
        return ResponseEntity.noContent().build();
    }

    // ==================================================================
    // Assets CRUD
    // ==================================================================

    @GetMapping("/assets")
    @Operation(summary = "List all assets (manual + linked portfolio holdings)")
    public ResponseEntity<List<AssetDto>> listAssets(@AuthenticationPrincipal UserPrincipal principal) {
        return ResponseEntity.ok(assetService.listAssets(resolveUserId(principal)));
    }

    @PostMapping("/assets")
    public ResponseEntity<AssetDto> createAsset(@AuthenticationPrincipal UserPrincipal principal,
                                                 @Valid @RequestBody CreateAssetRequest req) {
        return ResponseEntity.status(HttpStatus.CREATED).body(assetService.createAsset(resolveUserId(principal), req));
    }

    @GetMapping("/assets/{id}")
    public ResponseEntity<AssetDto> getAsset(@AuthenticationPrincipal UserPrincipal principal, @PathVariable String id) {
        return ResponseEntity.ok(assetService.getAsset(resolveUserId(principal), id));
    }

    @PutMapping("/assets/{id}")
    public ResponseEntity<AssetDto> updateAsset(@AuthenticationPrincipal UserPrincipal principal,
                                                 @PathVariable String id, @RequestBody UpdateAssetRequest req) {
        return ResponseEntity.ok(assetService.updateAsset(resolveUserId(principal), id, req));
    }

    @PostMapping("/assets/{id}/delink")
    public ResponseEntity<AssetDto> delinkAsset(@AuthenticationPrincipal UserPrincipal principal, @PathVariable String id) {
        return ResponseEntity.ok(assetService.delinkAsset(resolveUserId(principal), id));
    }

    @DeleteMapping("/assets/{id}")
    public ResponseEntity<Void> deleteAsset(@AuthenticationPrincipal UserPrincipal principal, @PathVariable String id) {
        assetService.deleteAsset(resolveUserId(principal), id);
        return ResponseEntity.noContent().build();
    }

    // ==================================================================
    // Summary, Projections & Insights
    // ==================================================================

    @GetMapping("/summary")
    @Operation(summary = "Get consolidated Net Worth summary rollup")
    public ResponseEntity<NetWorthSummaryDto> getSummary(@AuthenticationPrincipal UserPrincipal principal) {
        return ResponseEntity.ok(analyticsService.getSummary(resolveUserId(principal)));
    }

    @PostMapping("/projections")
    @Operation(summary = "Calculate 3-scenario growth projections (Conservative, Moderate, Aggressive)")
    public ResponseEntity<NetWorthProjectionResponseDto> calculateProjections(@AuthenticationPrincipal UserPrincipal principal,
                                                                              @RequestBody NetWorthProjectionRequest req) {
        return ResponseEntity.ok(analyticsService.calculateProjections(resolveUserId(principal), req));
    }

    @GetMapping("/insights")
    @Operation(summary = "Get Net Worth Financial Health Insights panel & recommendation cards")
    public ResponseEntity<NetWorthInsightsDto> getInsights(@AuthenticationPrincipal UserPrincipal principal) {
        return ResponseEntity.ok(analyticsService.getInsights(resolveUserId(principal)));
    }

    @PostMapping("/sample-seed")
    @Operation(summary = "Seed realistic Indian Net Worth sample data")
    public ResponseEntity<NetWorthSummaryDto> seedSampleData(@AuthenticationPrincipal UserPrincipal principal) {
        return ResponseEntity.status(HttpStatus.CREATED).body(analyticsService.seedSampleData(resolveUserId(principal)));
    }
}
