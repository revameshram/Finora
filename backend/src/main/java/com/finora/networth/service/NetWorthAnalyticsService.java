package com.finora.networth.service;

import com.finora.common.growth.CompoundGrowthEngine;
import com.finora.common.growth.GrowthProjectionPoint;
import com.finora.networth.contract.dto.NetWorthLiabilityDto;
import com.finora.networth.dto.*;
import com.finora.networth.model.*;
import com.finora.networth.repository.AssetRepository;
import com.finora.networth.repository.GrowthScenarioRepository;
import com.finora.networth.repository.LiabilityRepository;
import com.finora.networth.repository.NetWorthSnapshotRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.*;
import java.util.stream.Collectors;

@Slf4j
@Service
@RequiredArgsConstructor
public class NetWorthAnalyticsService {

    private static final BigDecimal HUNDRED = BigDecimal.valueOf(100);

    private final NetWorthAssetService assetService;
    private final NetWorthLiabilityService liabilityService;
    private final AssetRepository assetRepository;
    private final LiabilityRepository liabilityRepository;
    private final NetWorthSnapshotRepository snapshotRepository;
    private final GrowthScenarioRepository growthScenarioRepository;
    private final CompoundGrowthEngine growthEngine;

    // ==================================================================
    // 1. Summary & Rollups
    // ==================================================================

    @Transactional(readOnly = true)
    public NetWorthSummaryDto getSummary(String userId) {
        List<AssetDto> allAssets = assetService.listAssets(userId);
        List<AssetDto> includedAssets = allAssets.stream().filter(AssetDto::isIncluded).collect(Collectors.toList());

        BigDecimal manualAssetsTotal = sumAsset(includedAssets.stream().filter(a -> !a.isLinked()).collect(Collectors.toList()));
        BigDecimal portfolioLinkedAssetsTotal = sumAsset(includedAssets.stream().filter(AssetDto::isLinked).collect(Collectors.toList()));
        BigDecimal totalAssets = manualAssetsTotal.add(portfolioLinkedAssetsTotal);

        List<NetWorthLiabilityDto> allLiabilities = liabilityService.listLiabilities(userId);
        List<NetWorthLiabilityDto> includedLiabilities = allLiabilities.stream().filter(NetWorthLiabilityDto::isIncluded).collect(Collectors.toList());
        BigDecimal totalLiabilities = includedLiabilities.stream()
                .map(NetWorthLiabilityDto::getBalance)
                .reduce(BigDecimal.ZERO, BigDecimal::add)
                .setScale(2, RoundingMode.HALF_UP);

        BigDecimal netWorth = totalAssets.subtract(totalLiabilities).setScale(2, RoundingMode.HALF_UP);

        BigDecimal debtToAsset = totalAssets.compareTo(BigDecimal.ZERO) > 0
                ? totalLiabilities.divide(totalAssets, 6, RoundingMode.HALF_UP).multiply(HUNDRED).setScale(2, RoundingMode.HALF_UP)
                : BigDecimal.ZERO;

        BigDecimal liquidAssets = includedAssets.stream()
                .filter(a -> a.getCategory() == AssetCategory.CASH_BANK || a.getCategory() == AssetCategory.INVESTMENTS || a.getCategory() == AssetCategory.GOLD_SILVER)
                .map(AssetDto::getValue)
                .reduce(BigDecimal.ZERO, BigDecimal::add);

        BigDecimal liquidityRatio = totalLiabilities.compareTo(BigDecimal.ZERO) > 0
                ? liquidAssets.divide(totalLiabilities, 6, RoundingMode.HALF_UP).multiply(HUNDRED).setScale(2, RoundingMode.HALF_UP)
                : (liquidAssets.compareTo(BigDecimal.ZERO) > 0 ? new BigDecimal("999.00") : BigDecimal.ZERO);

        int healthScore = computeHealthScore(debtToAsset, liquidityRatio, netWorth);

        // Record snapshot for velocity
        recordDailySnapshot(userId, totalAssets, totalLiabilities, netWorth, healthScore);
        BigDecimal thirtyDayVelocity = computeThirtyDayVelocity(userId);

        return NetWorthSummaryDto.builder()
                .totalAssets(totalAssets)
                .manualAssetsTotal(manualAssetsTotal)
                .portfolioLinkedAssetsTotal(portfolioLinkedAssetsTotal)
                .totalLiabilities(totalLiabilities)
                .netWorth(netWorth)
                .thirtyDayVelocity(thirtyDayVelocity)
                .debtToAssetRatioPct(debtToAsset)
                .liquidityRatioPct(liquidityRatio)
                .healthScore(healthScore)
                .assetsByCategory(buildAssetCategoryBreakdown(includedAssets, totalAssets))
                .liabilitiesByCategory(buildLiabilityCategoryBreakdown(includedLiabilities, totalLiabilities))
                .topAssets(buildTopAssets(includedAssets, totalAssets))
                .topLiabilities(buildTopLiabilities(includedLiabilities, totalLiabilities))
                .build();
    }

    // ==================================================================
    // 2. Growth Projections (3 Scenarios + Portfolio Flat Nuance)
    // ==================================================================

    @Transactional(readOnly = true)
    public NetWorthProjectionResponseDto calculateProjections(String userId, NetWorthProjectionRequest req) {
        List<AssetDto> allAssets = assetService.listAssets(userId);
        List<AssetDto> includedAssets = allAssets.stream().filter(AssetDto::isIncluded).collect(Collectors.toList());

        BigDecimal portfolioLinkedAssetsTotal = sumAsset(includedAssets.stream().filter(AssetDto::isLinked).collect(Collectors.toList()));
        BigDecimal manualAssetsTotal = sumAsset(includedAssets.stream().filter(a -> !a.isLinked()).collect(Collectors.toList()));

        List<NetWorthLiabilityDto> includedLiabilities = liabilityService.listLiabilities(userId).stream()
                .filter(NetWorthLiabilityDto::isIncluded).collect(Collectors.toList());
        BigDecimal totalLiabilities = includedLiabilities.stream()
                .map(NetWorthLiabilityDto::getBalance)
                .reduce(BigDecimal.ZERO, BigDecimal::add)
                .setScale(2, RoundingMode.HALF_UP);

        BigDecimal currentNetWorth = manualAssetsTotal.add(portfolioLinkedAssetsTotal).subtract(totalLiabilities);

        NetWorthProjectionResponseDto.ScenarioProjectionDto conservative = buildScenarioProjection(
                "Conservative", req.getConservativeCagrPct(), manualAssetsTotal, portfolioLinkedAssetsTotal,
                totalLiabilities, req.getMonthlySavingsContribution(), req.getInflationPct(), req.getYears());

        NetWorthProjectionResponseDto.ScenarioProjectionDto moderate = buildScenarioProjection(
                "Moderate", req.getModerateCagrPct(), manualAssetsTotal, portfolioLinkedAssetsTotal,
                totalLiabilities, req.getMonthlySavingsContribution(), req.getInflationPct(), req.getYears());

        NetWorthProjectionResponseDto.ScenarioProjectionDto aggressive = buildScenarioProjection(
                "Aggressive", req.getAggressiveCagrPct(), manualAssetsTotal, portfolioLinkedAssetsTotal,
                totalLiabilities, req.getMonthlySavingsContribution(), req.getInflationPct(), req.getYears());

        return NetWorthProjectionResponseDto.builder()
                .currentNetWorth(currentNetWorth)
                .portfolioLinkedAssetsHeldFlat(portfolioLinkedAssetsTotal)
                .manualAssetsTotal(manualAssetsTotal)
                .totalLiabilities(totalLiabilities)
                .conservativeScenario(conservative)
                .moderateScenario(moderate)
                .aggressiveScenario(aggressive)
                .build();
    }

    private NetWorthProjectionResponseDto.ScenarioProjectionDto buildScenarioProjection(
            String name, BigDecimal cagrPct, BigDecimal manualAssets, BigDecimal linkedAssetsFlat,
            BigDecimal liabilities, BigDecimal monthlySavings, BigDecimal inflationPct, int years) {

        int doublesInYears = cagrPct.compareTo(BigDecimal.ZERO) > 0
                ? (int) Math.round(72.0 / cagrPct.doubleValue())
                : 0;

        List<GrowthProjectionPoint> points = new ArrayList<>();
        for (int yr = 1; yr <= years; yr++) {
            BigDecimal fvManual = growthEngine.calculateFutureValueLumpSum(manualAssets, cagrPct, yr);
            BigDecimal fvAnnuity = growthEngine.calculateFutureValueAnnuity(monthlySavings, cagrPct, yr);
            BigDecimal nominalAssetTotal = fvManual.add(fvAnnuity).add(linkedAssetsFlat);
            BigDecimal nominalNetWorth = nominalAssetTotal.subtract(liabilities);
            if (nominalNetWorth.compareTo(BigDecimal.ZERO) < 0) nominalNetWorth = BigDecimal.ZERO;

            BigDecimal realNetWorth = growthEngine.calculateDiscountedRealValue(nominalNetWorth, inflationPct, yr);

            points.add(GrowthProjectionPoint.builder()
                    .year(yr)
                    .nominalValue(nominalNetWorth.setScale(2, RoundingMode.HALF_UP))
                    .realValue(realNetWorth.setScale(2, RoundingMode.HALF_UP))
                    .cumulativeContributions(manualAssets.add(linkedAssetsFlat).add(monthlySavings.multiply(BigDecimal.valueOf(yr * 12L))))
                    .interestEarned(nominalNetWorth.subtract(manualAssets.add(linkedAssetsFlat)))
                    .build());
        }

        GrowthProjectionPoint finalPoint = points.get(points.size() - 1);
        return NetWorthProjectionResponseDto.ScenarioProjectionDto.builder()
                .scenarioName(name)
                .cagrPct(cagrPct)
                .doublesInYears(doublesInYears)
                .projectedNetWorthNominal(finalPoint.getNominalValue())
                .projectedNetWorthReal(finalPoint.getRealValue())
                .yearlyPoints(points)
                .build();
    }

    // ==================================================================
    // 3. Financial Insights Panel (§5.4)
    // ==================================================================

    @Transactional(readOnly = true)
    public NetWorthInsightsDto getInsights(String userId) {
        NetWorthSummaryDto summary = getSummary(userId);

        String healthBadge = summary.getHealthScore() >= 80 ? "Excellent" : summary.getHealthScore() >= 50 ? "Good" : "Needs Attention";
        String debtStatus = summary.getDebtToAssetRatioPct().compareTo(new BigDecimal("30.00")) <= 0 ? "Healthy" : "High Debt Drag";
        String liqStatus = summary.getLiquidityRatioPct().compareTo(new BigDecimal("50.00")) >= 0 ? "Strong Cushion" : "Low Cushion";

        TopHoldingDto largestAsset = summary.getTopAssets().isEmpty() ? null : summary.getTopAssets().get(0);
        TopHoldingDto largestLiability = summary.getTopLiabilities().isEmpty() ? null : summary.getTopLiabilities().get(0);

        List<NetWorthInsightsDto.RecommendationCardDto> recs = new ArrayList<>();
        if (summary.getDebtToAssetRatioPct().compareTo(new BigDecimal("40.00")) > 0) {
            recs.add(NetWorthInsightsDto.RecommendationCardDto.builder()
                    .type("warning")
                    .title("High Debt-to-Asset Ratio (" + summary.getDebtToAssetRatioPct() + "%)")
                    .description("Over 40% of your total assets are burdened by debt. Consider prioritizing high-interest loan payoff.")
                    .actionLabel("Prepay Loans")
                    .actionModule("EMI_MANAGER")
                    .build());
        } else {
            recs.add(NetWorthInsightsDto.RecommendationCardDto.builder()
                    .type("positive")
                    .title("Manageable Debt Profile")
                    .description("Your debt-to-asset ratio is a healthy " + summary.getDebtToAssetRatioPct() + "%. Maintain your repayment velocity.")
                    .actionLabel("View Loans")
                    .actionModule("EMI_MANAGER")
                    .build());
        }

        if (summary.getPortfolioLinkedAssetsTotal().compareTo(BigDecimal.ZERO) == 0) {
            recs.add(NetWorthInsightsDto.RecommendationCardDto.builder()
                    .type("neutral")
                    .title("Link Portfolio Investments")
                    .description("No live holdings linked from Portfolio Tracker. Connect your stocks, mutual funds, and FDs to auto-sync values.")
                    .actionLabel("Open Portfolio")
                    .actionModule("PORTFOLIO")
                    .build());
        } else {
            recs.add(NetWorthInsightsDto.RecommendationCardDto.builder()
                    .type("positive")
                    .title("Live Portfolio Sync Active")
                    .description("₹" + summary.getPortfolioLinkedAssetsTotal() + " in investments actively feeding your balance sheet.")
                    .actionLabel("Manage Holdings")
                    .actionModule("PORTFOLIO")
                    .build());
        }

        return NetWorthInsightsDto.builder()
                .healthScore(summary.getHealthScore())
                .healthBadge(healthBadge)
                .debtToAssetRatioPct(summary.getDebtToAssetRatioPct())
                .debtToAssetStatus(debtStatus)
                .liquidityRatioPct(summary.getLiquidityRatioPct())
                .liquidityStatus(liqStatus)
                .largestAsset(largestAsset)
                .largestLiability(largestLiability)
                .recommendations(recs)
                .build();
    }

    // ==================================================================
    // 4. Sample Data Seeder
    // ==================================================================

    @Transactional
    public NetWorthSummaryDto seedSampleData(String userId) {
        // Clear existing manual assets and liabilities for user
        assetRepository.deleteAll(assetRepository.findByUserIdOrderByCreatedAtDesc(userId).stream().filter(a -> !a.isLinked()).collect(Collectors.toList()));
        liabilityRepository.deleteAll(liabilityRepository.findByUserIdOrderByCreatedAtDesc(userId).stream().filter(l -> !l.isLinked()).collect(Collectors.toList()));

        // Create realistic Indian Net Worth fixtures
        assetService.createAsset(userId, CreateAssetRequest.builder()
                .name("HDFC Bank Savings Account")
                .category(AssetCategory.CASH_BANK)
                .value(new BigDecimal("250000.00"))
                .growthRatePct(new BigDecimal("3.50"))
                .notes("Primary liquid cash")
                .build());

        assetService.createAsset(userId, CreateAssetRequest.builder()
                .name("ICICI Bank Fixed Deposit")
                .category(AssetCategory.CASH_BANK)
                .value(new BigDecimal("500000.00"))
                .growthRatePct(new BigDecimal("7.20"))
                .notes("Emergency fund deposit")
                .build());

        assetService.createAsset(userId, CreateAssetRequest.builder()
                .name("Whitefield 3BHK Apartment")
                .category(AssetCategory.REAL_ESTATE)
                .value(new BigDecimal("8500000.00"))
                .growthRatePct(new BigDecimal("8.00"))
                .notes("Primary residence")
                .build());

        assetService.createAsset(userId, CreateAssetRequest.builder()
                .name("Sovereign Gold Bonds (2028)")
                .category(AssetCategory.GOLD_SILVER)
                .value(new BigDecimal("320000.00"))
                .growthRatePct(new BigDecimal("9.50"))
                .notes("2.5% annual coupon")
                .build());

        liabilityService.createLiability(userId, "HDFC Home Loan", LiabilityCategory.HOME_LOAN,
                new BigDecimal("4250000.00"), LocalDate.of(2022, 5, 1), new BigDecimal("8.50"), new BigDecimal("45000.00"), "Flat mortgage");

        liabilityService.createLiability(userId, "HDFC Regalia Credit Card", LiabilityCategory.CREDIT_CARD,
                new BigDecimal("45000.00"), LocalDate.now(), new BigDecimal("42.00"), new BigDecimal("45000.00"), "Monthly statement balance");

        return getSummary(userId);
    }

    // ==================================================================
    // Helpers & Snapshots
    // ==================================================================

    private void recordDailySnapshot(String userId, BigDecimal assets, BigDecimal liabilities, BigDecimal netWorth, int score) {
        LocalDate today = LocalDate.now();
        NetWorthSnapshot snap = snapshotRepository.findByUserIdAndSnapshotDate(userId, today)
                .orElseGet(() -> NetWorthSnapshot.builder()
                        .id("snap_nw_" + UUID.randomUUID().toString().substring(0, 8))
                        .userId(userId)
                        .snapshotDate(today)
                        .build());
        snap.setTotalAssets(assets);
        snap.setTotalLiabilities(liabilities);
        snap.setNetWorth(netWorth);
        snap.setHealthScore(score);
        snapshotRepository.save(snap);
    }

    private BigDecimal computeThirtyDayVelocity(String userId) {
        List<NetWorthSnapshot> snaps = snapshotRepository.findByUserIdOrderBySnapshotDateAsc(userId);
        if (snaps.size() < 2) return BigDecimal.ZERO;
        NetWorthSnapshot latest = snaps.get(snaps.size() - 1);
        NetWorthSnapshot first = snaps.get(0);
        return latest.getNetWorth().subtract(first.getNetWorth()).setScale(2, RoundingMode.HALF_UP);
    }

    private int computeHealthScore(BigDecimal debtToAsset, BigDecimal liquidityRatio, BigDecimal netWorth) {
        if (netWorth.compareTo(BigDecimal.ZERO) <= 0) return 30;
        int score = 100;
        if (debtToAsset.compareTo(new BigDecimal("50.00")) > 0) score -= 30;
        else if (debtToAsset.compareTo(new BigDecimal("30.00")) > 0) score -= 15;

        if (liquidityRatio.compareTo(new BigDecimal("20.00")) < 0) score -= 20;
        return Math.max(10, Math.min(100, score));
    }

    private BigDecimal sumAsset(List<AssetDto> list) {
        return list.stream().map(AssetDto::getValue).reduce(BigDecimal.ZERO, BigDecimal::add).setScale(2, RoundingMode.HALF_UP);
    }

    private List<CategoryBreakdownDto> buildAssetCategoryBreakdown(List<AssetDto> assets, BigDecimal total) {
        Map<String, BigDecimal> amounts = new LinkedHashMap<>();
        for (AssetDto a : assets) {
            amounts.merge(a.getCategory().name(), a.getValue(), BigDecimal::add);
        }
        return toCategoryList(amounts, total);
    }

    private List<CategoryBreakdownDto> buildLiabilityCategoryBreakdown(List<NetWorthLiabilityDto> liabilities, BigDecimal total) {
        Map<String, BigDecimal> amounts = new LinkedHashMap<>();
        for (NetWorthLiabilityDto l : liabilities) {
            amounts.merge(l.getCategory(), l.getBalance(), BigDecimal::add);
        }
        return toCategoryList(amounts, total);
    }

    private List<CategoryBreakdownDto> toCategoryList(Map<String, BigDecimal> amounts, BigDecimal total) {
        return amounts.entrySet().stream()
                .filter(e -> e.getValue().compareTo(BigDecimal.ZERO) > 0)
                .map(e -> CategoryBreakdownDto.builder()
                        .category(e.getKey())
                        .amount(e.getValue().setScale(2, RoundingMode.HALF_UP))
                        .percentage(total.compareTo(BigDecimal.ZERO) > 0
                                ? e.getValue().divide(total, 6, RoundingMode.HALF_UP).multiply(HUNDRED).setScale(2, RoundingMode.HALF_UP)
                                : BigDecimal.ZERO)
                        .build())
                .collect(Collectors.toList());
    }

    private List<TopHoldingDto> buildTopAssets(List<AssetDto> assets, BigDecimal total) {
        return assets.stream()
                .sorted(Comparator.comparing(AssetDto::getValue).reversed())
                .limit(5)
                .map(a -> TopHoldingDto.builder()
                        .id(a.getId())
                        .name(a.getName())
                        .type("ASSET")
                        .category(a.getCategory().name())
                        .amount(a.getValue())
                        .percentageOfTotal(total.compareTo(BigDecimal.ZERO) > 0
                                ? a.getValue().divide(total, 6, RoundingMode.HALF_UP).multiply(HUNDRED).setScale(2, RoundingMode.HALF_UP)
                                : BigDecimal.ZERO)
                        .build())
                .collect(Collectors.toList());
    }

    private List<TopHoldingDto> buildTopLiabilities(List<NetWorthLiabilityDto> liabilities, BigDecimal total) {
        return liabilities.stream()
                .sorted(Comparator.comparing(NetWorthLiabilityDto::getBalance).reversed())
                .limit(5)
                .map(l -> TopHoldingDto.builder()
                        .id(l.getId())
                        .name(l.getName())
                        .type("LIABILITY")
                        .category(l.getCategory())
                        .amount(l.getBalance())
                        .percentageOfTotal(total.compareTo(BigDecimal.ZERO) > 0
                                ? l.getBalance().divide(total, 6, RoundingMode.HALF_UP).multiply(HUNDRED).setScale(2, RoundingMode.HALF_UP)
                                : BigDecimal.ZERO)
                        .build())
                .collect(Collectors.toList());
    }
}
