package com.finora.portfolio.controller;

import com.finora.common.auth.security.UserPrincipal;
import com.finora.portfolio.dto.*;
import com.finora.portfolio.model.AssetType;
import com.finora.portfolio.model.Market;
import com.finora.portfolio.service.PortfolioAnalyticsService;
import com.finora.portfolio.service.PortfolioAssetService;
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
@RequestMapping("/api/v1/portfolio")
@RequiredArgsConstructor
@Tag(name = "Portfolio Tracker", description = "Multi-asset holdings, live pricing, dashboard, Growth Outlook & Equity Drawdown Check")
public class PortfolioController {

    private final PortfolioAssetService assetService;
    private final PortfolioAnalyticsService analyticsService;

    private String resolveUserId(UserPrincipal principal) {
        return principal != null ? principal.getId() : "usr_demo_user_001";
    }

    // ==================================================================
    // Stocks
    // ==================================================================

    @GetMapping("/stocks")
    public ResponseEntity<List<StockHoldingDto>> listStocks(@AuthenticationPrincipal UserPrincipal principal) {
        return ResponseEntity.ok(assetService.listStocks(resolveUserId(principal)));
    }

    @PostMapping("/stocks")
    @Operation(summary = "Add a Stock holding (Indian or US, via the market flag)")
    public ResponseEntity<StockHoldingDto> createStock(@AuthenticationPrincipal UserPrincipal principal,
                                                        @Valid @RequestBody CreateStockHoldingRequest req) {
        return ResponseEntity.status(HttpStatus.CREATED).body(assetService.createStock(resolveUserId(principal), req));
    }

    @GetMapping("/stocks/{id}")
    public ResponseEntity<StockHoldingDto> getStock(@AuthenticationPrincipal UserPrincipal principal, @PathVariable String id) {
        return ResponseEntity.ok(assetService.getStock(resolveUserId(principal), id));
    }

    @PutMapping("/stocks/{id}")
    public ResponseEntity<StockHoldingDto> updateStock(@AuthenticationPrincipal UserPrincipal principal,
                                                        @PathVariable String id, @RequestBody UpdateStockHoldingRequest req) {
        return ResponseEntity.ok(assetService.updateStock(resolveUserId(principal), id, req));
    }

    @PostMapping("/stocks/{id}/add-shares")
    @Operation(summary = "'Add Shares' variant — recomputes weighted-average cost")
    public ResponseEntity<StockHoldingDto> addSharesToStock(@AuthenticationPrincipal UserPrincipal principal,
                                                             @PathVariable String id, @Valid @RequestBody AddSharesRequest req) {
        return ResponseEntity.ok(assetService.addSharesToStock(resolveUserId(principal), id, req));
    }

    @DeleteMapping("/stocks/{id}")
    public ResponseEntity<Void> deleteStock(@AuthenticationPrincipal UserPrincipal principal, @PathVariable String id) {
        assetService.deleteStock(resolveUserId(principal), id);
        return ResponseEntity.noContent().build();
    }

    // ==================================================================
    // ETFs
    // ==================================================================

    @GetMapping("/etfs")
    public ResponseEntity<List<EtfHoldingDto>> listEtfs(@AuthenticationPrincipal UserPrincipal principal) {
        return ResponseEntity.ok(assetService.listEtfs(resolveUserId(principal)));
    }

    @PostMapping("/etfs")
    public ResponseEntity<EtfHoldingDto> createEtf(@AuthenticationPrincipal UserPrincipal principal,
                                                    @Valid @RequestBody CreateEtfHoldingRequest req) {
        return ResponseEntity.status(HttpStatus.CREATED).body(assetService.createEtf(resolveUserId(principal), req));
    }

    @GetMapping("/etfs/{id}")
    public ResponseEntity<EtfHoldingDto> getEtf(@AuthenticationPrincipal UserPrincipal principal, @PathVariable String id) {
        return ResponseEntity.ok(assetService.getEtf(resolveUserId(principal), id));
    }

    @PutMapping("/etfs/{id}")
    public ResponseEntity<EtfHoldingDto> updateEtf(@AuthenticationPrincipal UserPrincipal principal,
                                                    @PathVariable String id, @RequestBody UpdateEtfHoldingRequest req) {
        return ResponseEntity.ok(assetService.updateEtf(resolveUserId(principal), id, req));
    }

    @PostMapping("/etfs/{id}/add-shares")
    public ResponseEntity<EtfHoldingDto> addSharesToEtf(@AuthenticationPrincipal UserPrincipal principal,
                                                         @PathVariable String id, @Valid @RequestBody AddSharesRequest req) {
        return ResponseEntity.ok(assetService.addSharesToEtf(resolveUserId(principal), id, req));
    }

    @DeleteMapping("/etfs/{id}")
    public ResponseEntity<Void> deleteEtf(@AuthenticationPrincipal UserPrincipal principal, @PathVariable String id) {
        assetService.deleteEtf(resolveUserId(principal), id);
        return ResponseEntity.noContent().build();
    }

    // ==================================================================
    // Mutual Funds
    // ==================================================================

    @GetMapping("/mutual-funds")
    public ResponseEntity<List<MutualFundHoldingDto>> listMutualFunds(@AuthenticationPrincipal UserPrincipal principal) {
        return ResponseEntity.ok(assetService.listMutualFunds(resolveUserId(principal)));
    }

    @PostMapping("/mutual-funds")
    public ResponseEntity<MutualFundHoldingDto> createMutualFund(@AuthenticationPrincipal UserPrincipal principal,
                                                                  @Valid @RequestBody CreateMutualFundHoldingRequest req) {
        return ResponseEntity.status(HttpStatus.CREATED).body(assetService.createMutualFund(resolveUserId(principal), req));
    }

    @GetMapping("/mutual-funds/{id}")
    public ResponseEntity<MutualFundHoldingDto> getMutualFund(@AuthenticationPrincipal UserPrincipal principal, @PathVariable String id) {
        return ResponseEntity.ok(assetService.getMutualFund(resolveUserId(principal), id));
    }

    @PutMapping("/mutual-funds/{id}")
    public ResponseEntity<MutualFundHoldingDto> updateMutualFund(@AuthenticationPrincipal UserPrincipal principal,
                                                                  @PathVariable String id, @RequestBody UpdateMutualFundHoldingRequest req) {
        return ResponseEntity.ok(assetService.updateMutualFund(resolveUserId(principal), id, req));
    }

    @DeleteMapping("/mutual-funds/{id}")
    public ResponseEntity<Void> deleteMutualFund(@AuthenticationPrincipal UserPrincipal principal, @PathVariable String id) {
        assetService.deleteMutualFund(resolveUserId(principal), id);
        return ResponseEntity.noContent().build();
    }

    // ==================================================================
    // NPS/UPS
    // ==================================================================

    @GetMapping("/nps")
    public ResponseEntity<List<NpsHoldingDto>> listNps(@AuthenticationPrincipal UserPrincipal principal) {
        return ResponseEntity.ok(assetService.listNps(resolveUserId(principal)));
    }

    @PostMapping("/nps")
    public ResponseEntity<NpsHoldingDto> createNps(@AuthenticationPrincipal UserPrincipal principal,
                                                    @Valid @RequestBody CreateNpsHoldingRequest req) {
        return ResponseEntity.status(HttpStatus.CREATED).body(assetService.createNps(resolveUserId(principal), req));
    }

    @GetMapping("/nps/{id}")
    public ResponseEntity<NpsHoldingDto> getNps(@AuthenticationPrincipal UserPrincipal principal, @PathVariable String id) {
        return ResponseEntity.ok(assetService.getNps(resolveUserId(principal), id));
    }

    @PutMapping("/nps/{id}")
    public ResponseEntity<NpsHoldingDto> updateNps(@AuthenticationPrincipal UserPrincipal principal,
                                                    @PathVariable String id, @RequestBody UpdateNpsHoldingRequest req) {
        return ResponseEntity.ok(assetService.updateNps(resolveUserId(principal), id, req));
    }

    @DeleteMapping("/nps/{id}")
    public ResponseEntity<Void> deleteNps(@AuthenticationPrincipal UserPrincipal principal, @PathVariable String id) {
        assetService.deleteNps(resolveUserId(principal), id);
        return ResponseEntity.noContent().build();
    }

    // ==================================================================
    // Deposits (FD/RD)
    // ==================================================================

    @GetMapping("/deposits")
    public ResponseEntity<List<DepositDto>> listDeposits(@AuthenticationPrincipal UserPrincipal principal) {
        return ResponseEntity.ok(assetService.listDeposits(resolveUserId(principal)));
    }

    @PostMapping("/deposits")
    public ResponseEntity<DepositDto> createDeposit(@AuthenticationPrincipal UserPrincipal principal,
                                                     @Valid @RequestBody CreateDepositRequest req) {
        return ResponseEntity.status(HttpStatus.CREATED).body(assetService.createDeposit(resolveUserId(principal), req));
    }

    @GetMapping("/deposits/{id}")
    public ResponseEntity<DepositDto> getDeposit(@AuthenticationPrincipal UserPrincipal principal, @PathVariable String id) {
        return ResponseEntity.ok(assetService.getDeposit(resolveUserId(principal), id));
    }

    @PutMapping("/deposits/{id}")
    public ResponseEntity<DepositDto> updateDeposit(@AuthenticationPrincipal UserPrincipal principal,
                                                     @PathVariable String id, @RequestBody UpdateDepositRequest req) {
        return ResponseEntity.ok(assetService.updateDeposit(resolveUserId(principal), id, req));
    }

    @GetMapping("/deposits/{id}/schedule")
    @Operation(summary = "Computed FD/RD schedule: Date, Deposit, Earned Interest, Capital, Status")
    public ResponseEntity<List<DepositScheduleEntryDto>> getDepositSchedule(@AuthenticationPrincipal UserPrincipal principal,
                                                                             @PathVariable String id) {
        return ResponseEntity.ok(assetService.getDepositSchedule(resolveUserId(principal), id));
    }

    @DeleteMapping("/deposits/{id}")
    public ResponseEntity<Void> deleteDeposit(@AuthenticationPrincipal UserPrincipal principal, @PathVariable String id) {
        assetService.deleteDeposit(resolveUserId(principal), id);
        return ResponseEntity.noContent().build();
    }

    // ==================================================================
    // Bonds
    // ==================================================================

    @GetMapping("/bonds")
    public ResponseEntity<List<BondDto>> listBonds(@AuthenticationPrincipal UserPrincipal principal) {
        return ResponseEntity.ok(assetService.listBonds(resolveUserId(principal)));
    }

    @PostMapping("/bonds")
    public ResponseEntity<BondDto> createBond(@AuthenticationPrincipal UserPrincipal principal,
                                               @Valid @RequestBody CreateBondRequest req) {
        return ResponseEntity.status(HttpStatus.CREATED).body(assetService.createBond(resolveUserId(principal), req));
    }

    @GetMapping("/bonds/{id}")
    public ResponseEntity<BondDto> getBond(@AuthenticationPrincipal UserPrincipal principal, @PathVariable String id) {
        return ResponseEntity.ok(assetService.getBond(resolveUserId(principal), id));
    }

    @PutMapping("/bonds/{id}")
    public ResponseEntity<BondDto> updateBond(@AuthenticationPrincipal UserPrincipal principal,
                                               @PathVariable String id, @RequestBody UpdateBondRequest req) {
        return ResponseEntity.ok(assetService.updateBond(resolveUserId(principal), id, req));
    }

    @GetMapping("/bonds/{id}/schedule")
    @Operation(summary = "Computed Bond schedule: Date, Coupon, Capital, Payout, Status (extends the FD pattern, §6.6 #4)")
    public ResponseEntity<List<BondScheduleEntryDto>> getBondSchedule(@AuthenticationPrincipal UserPrincipal principal,
                                                                       @PathVariable String id) {
        return ResponseEntity.ok(assetService.getBondSchedule(resolveUserId(principal), id));
    }

    @DeleteMapping("/bonds/{id}")
    public ResponseEntity<Void> deleteBond(@AuthenticationPrincipal UserPrincipal principal, @PathVariable String id) {
        assetService.deleteBond(resolveUserId(principal), id);
        return ResponseEntity.noContent().build();
    }

    // ==================================================================
    // Metals
    // ==================================================================

    @GetMapping("/metals")
    public ResponseEntity<List<MetalHoldingDto>> listMetals(@AuthenticationPrincipal UserPrincipal principal) {
        return ResponseEntity.ok(assetService.listMetals(resolveUserId(principal)));
    }

    @PostMapping("/metals")
    public ResponseEntity<MetalHoldingDto> createMetal(@AuthenticationPrincipal UserPrincipal principal,
                                                        @Valid @RequestBody CreateMetalHoldingRequest req) {
        return ResponseEntity.status(HttpStatus.CREATED).body(assetService.createMetal(resolveUserId(principal), req));
    }

    @GetMapping("/metals/{id}")
    public ResponseEntity<MetalHoldingDto> getMetal(@AuthenticationPrincipal UserPrincipal principal, @PathVariable String id) {
        return ResponseEntity.ok(assetService.getMetal(resolveUserId(principal), id));
    }

    @PutMapping("/metals/{id}")
    public ResponseEntity<MetalHoldingDto> updateMetal(@AuthenticationPrincipal UserPrincipal principal,
                                                        @PathVariable String id, @RequestBody UpdateMetalHoldingRequest req) {
        return ResponseEntity.ok(assetService.updateMetal(resolveUserId(principal), id, req));
    }

    @DeleteMapping("/metals/{id}")
    public ResponseEntity<Void> deleteMetal(@AuthenticationPrincipal UserPrincipal principal, @PathVariable String id) {
        assetService.deleteMetal(resolveUserId(principal), id);
        return ResponseEntity.noContent().build();
    }

    // ==================================================================
    // Real Estate
    // ==================================================================

    @GetMapping("/real-estate")
    public ResponseEntity<List<RealEstateDto>> listRealEstate(@AuthenticationPrincipal UserPrincipal principal) {
        return ResponseEntity.ok(assetService.listRealEstate(resolveUserId(principal)));
    }

    @PostMapping("/real-estate")
    public ResponseEntity<RealEstateDto> createRealEstate(@AuthenticationPrincipal UserPrincipal principal,
                                                           @Valid @RequestBody CreateRealEstateRequest req) {
        return ResponseEntity.status(HttpStatus.CREATED).body(assetService.createRealEstate(resolveUserId(principal), req));
    }

    @GetMapping("/real-estate/{id}")
    public ResponseEntity<RealEstateDto> getRealEstate(@AuthenticationPrincipal UserPrincipal principal, @PathVariable String id) {
        return ResponseEntity.ok(assetService.getRealEstate(resolveUserId(principal), id));
    }

    @PutMapping("/real-estate/{id}")
    public ResponseEntity<RealEstateDto> updateRealEstate(@AuthenticationPrincipal UserPrincipal principal,
                                                           @PathVariable String id, @RequestBody UpdateRealEstateRequest req) {
        return ResponseEntity.ok(assetService.updateRealEstate(resolveUserId(principal), id, req));
    }

    @DeleteMapping("/real-estate/{id}")
    public ResponseEntity<Void> deleteRealEstate(@AuthenticationPrincipal UserPrincipal principal, @PathVariable String id) {
        assetService.deleteRealEstate(resolveUserId(principal), id);
        return ResponseEntity.noContent().build();
    }

    // ==================================================================
    // Others
    // ==================================================================

    @GetMapping("/others")
    public ResponseEntity<List<OtherInstrumentDto>> listOtherInstruments(@AuthenticationPrincipal UserPrincipal principal) {
        return ResponseEntity.ok(assetService.listOtherInstruments(resolveUserId(principal)));
    }

    @PostMapping("/others")
    @Operation(summary = "Add an 'Others' instrument with a Category Mix percentage split (validated to sum to 100%)")
    public ResponseEntity<OtherInstrumentDto> createOtherInstrument(@AuthenticationPrincipal UserPrincipal principal,
                                                                     @Valid @RequestBody CreateOtherInstrumentRequest req) {
        return ResponseEntity.status(HttpStatus.CREATED).body(assetService.createOtherInstrument(resolveUserId(principal), req));
    }

    @GetMapping("/others/{id}")
    public ResponseEntity<OtherInstrumentDto> getOtherInstrument(@AuthenticationPrincipal UserPrincipal principal, @PathVariable String id) {
        return ResponseEntity.ok(assetService.getOtherInstrument(resolveUserId(principal), id));
    }

    @PutMapping("/others/{id}")
    public ResponseEntity<OtherInstrumentDto> updateOtherInstrument(@AuthenticationPrincipal UserPrincipal principal,
                                                                     @PathVariable String id, @RequestBody UpdateOtherInstrumentRequest req) {
        return ResponseEntity.ok(assetService.updateOtherInstrument(resolveUserId(principal), id, req));
    }

    @DeleteMapping("/others/{id}")
    public ResponseEntity<Void> deleteOtherInstrument(@AuthenticationPrincipal UserPrincipal principal, @PathVariable String id) {
        assetService.deleteOtherInstrument(resolveUserId(principal), id);
        return ResponseEntity.noContent().build();
    }

    // ==================================================================
    // Analytics: Dashboard, Growth Outlook, Equity Drawdown Check
    // ==================================================================

    @GetMapping("/dashboard")
    @Operation(summary = "Present Value, Total Invested, allocation & category breakdowns, growth chart (§6.2)")
    public ResponseEntity<PortfolioDashboardDto> getDashboard(@AuthenticationPrincipal UserPrincipal principal) {
        return ResponseEntity.ok(analyticsService.getDashboard(resolveUserId(principal)));
    }

    @GetMapping("/growth-outlook/assumptions")
    public ResponseEntity<GrowthOutlookRequest> getGrowthAssumptions(@AuthenticationPrincipal UserPrincipal principal) {
        return ResponseEntity.ok(analyticsService.getGrowthAssumptions(resolveUserId(principal)));
    }

    @PostMapping("/growth-outlook")
    @Operation(summary = "Portfolio Growth Outlook: compound growth + FV-of-annuity, optional inflation-adjusted series (§6.3)")
    public ResponseEntity<GrowthOutlookResponseDto> calculateGrowthOutlook(@AuthenticationPrincipal UserPrincipal principal,
                                                                            @Valid @RequestBody GrowthOutlookRequest req) {
        return ResponseEntity.ok(analyticsService.calculateGrowthOutlook(resolveUserId(principal), req));
    }

    @PostMapping("/growth-outlook/reset")
    public ResponseEntity<Void> resetGrowthAssumptions(@AuthenticationPrincipal UserPrincipal principal) {
        analyticsService.resetGrowthAssumptions(resolveUserId(principal));
        return ResponseEntity.noContent().build();
    }

    @PostMapping("/drawdown-check")
    @Operation(summary = "Equity Drawdown Check: applies the drop only to the equity bucket (§6.4)")
    public ResponseEntity<DrawdownCheckResponseDto> calculateDrawdown(@AuthenticationPrincipal UserPrincipal principal,
                                                                       @Valid @RequestBody DrawdownCheckRequest req) {
        return ResponseEntity.ok(analyticsService.calculateDrawdown(resolveUserId(principal), req));
    }

    // ==================================================================
    // Universal conventions: search, live-price preview, refresh, cross-module summary, seeding
    // ==================================================================

    @GetMapping("/search")
    @Operation(summary = "Search-as-you-type (3+ chars) symbol lookup for the Add Stock/ETF modal")
    public ResponseEntity<List<SymbolSearchResultDto>> search(@RequestParam(required = false) String assetType,
                                                               @RequestParam String query) {
        return ResponseEntity.ok(assetService.searchSymbols(assetType, query));
    }

    @GetMapping("/live-price")
    @Operation(summary = "Preview the current live price before submitting an Add Holding form")
    public ResponseEntity<LivePriceQuoteDto> getLivePrice(@RequestParam AssetType assetType,
                                                           @RequestParam(required = false) Market market,
                                                           @RequestParam String symbol) {
        return ResponseEntity.ok(assetService.getLivePricePreview(assetType, market, symbol));
    }

    @PostMapping("/refresh-prices")
    @Operation(summary = "Refresh live prices for all holdings and record today's valuation snapshot")
    public ResponseEntity<Void> refreshPrices(@AuthenticationPrincipal UserPrincipal principal) {
        assetService.refreshAllPrices(resolveUserId(principal));
        return ResponseEntity.noContent().build();
    }

    @GetMapping("/summary")
    @Operation(summary = "Read-only holdings summary for Net Worth Tracker's Link Investments / Goal Manager (§6.6 #6)")
    public ResponseEntity<List<PortfolioHoldingSummaryDto>> getSummary(@AuthenticationPrincipal UserPrincipal principal) {
        return ResponseEntity.ok(assetService.getPortfolioSummary(resolveUserId(principal)));
    }

    @PostMapping("/seed-sample-data")
    @Operation(summary = "1-click seeder: a realistic starter portfolio (stocks, MF, gold, FD)")
    public ResponseEntity<Void> seedSampleData(@AuthenticationPrincipal UserPrincipal principal) {
        assetService.seedSampleData(resolveUserId(principal));
        return ResponseEntity.noContent().build();
    }
}
