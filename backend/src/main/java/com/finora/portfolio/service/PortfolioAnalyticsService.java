package com.finora.portfolio.service;

import com.finora.portfolio.dto.*;
import com.finora.portfolio.model.*;
import com.finora.portfolio.repository.*;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.*;
import java.util.stream.Collectors;

/**
 * §6.2 Dashboard, §6.3 Growth Outlook, §6.4 Equity Drawdown Check — all read-only aggregation
 * over the valuations PortfolioAssetService.collectAllValuations() unifies across the 9 tables.
 */
@Service
@RequiredArgsConstructor
public class PortfolioAnalyticsService {

    private static final BigDecimal HUNDRED = BigDecimal.valueOf(100);

    private final PortfolioAssetService assetService;
    private final MutualFundHoldingRepository mutualFundHoldingRepository;
    private final NpsHoldingRepository npsHoldingRepository;
    private final NpsSchemeAllocationRepository npsSchemeAllocationRepository;
    private final MetalHoldingRepository metalHoldingRepository;
    private final PriceSnapshotRepository priceSnapshotRepository;
    private final GrowthAssumptionsRepository growthAssumptionsRepository;

    // ==================================================================
    // Dashboard (§6.2)
    // ==================================================================

    @Transactional(readOnly = true)
    public PortfolioDashboardDto getDashboard(String userId) {
        List<AssetValuation> all = assetService.collectAllValuations(userId);
        List<AssetValuation> included = all.stream().filter(AssetValuation::isIncluded).collect(Collectors.toList());

        BigDecimal presentValue = sum(included, AssetValuation::getCurrentValue);
        BigDecimal totalInvested = sum(included, AssetValuation::getInvestedAmount);
        BigDecimal overallGainLoss = presentValue.subtract(totalInvested);

        long compositionCount = included.stream().map(AssetValuation::getAssetType).distinct().count();

        Optional<AssetValuation> highestProfit = included.stream().max(Comparator.comparing(AssetValuation::gainLoss));
        Optional<AssetValuation> highestLoss = included.stream().min(Comparator.comparing(AssetValuation::gainLoss));

        BigDecimal[] oneDayChange = computeOneDayChange(userId);

        return PortfolioDashboardDto.builder()
                .presentValue(presentValue)
                .totalInvested(totalInvested)
                .overallGainLoss(overallGainLoss)
                .overallGainLossPct(pct(totalInvested, overallGainLoss))
                .portfolioCompositionCount((int) compositionCount)
                .highestProfitHolding(highestProfit.map(this::toMoverDto).orElse(null))
                .highestLossHolding(highestLoss.map(this::toMoverDto).orElse(null))
                .oneDayChangeAmount(oneDayChange[0])
                .oneDayChangePct(oneDayChange[1])
                .assetAllocation(buildAssetAllocation(included, presentValue))
                .portfolioByCategory(buildBreakdownByAssetType(included, presentValue))
                .mutualFundByCategory(buildMutualFundByCategory(userId))
                .mutualFundByCapitalisation(buildMutualFundByCapitalisation(userId))
                .npsSchemeAllocation(buildNpsAllocationSummary(userId))
                .metalsMiniPanel(buildMetalsMiniPanel(userId))
                .growthChartSeries(buildGrowthChartSeries(userId))
                .build();
    }

    private PortfolioDashboardDto.HighestMoverDto toMoverDto(AssetValuation v) {
        return PortfolioDashboardDto.HighestMoverDto.builder()
                .holdingId(v.getId()).name(v.getName())
                .gainLoss(v.gainLoss()).gainLossPct(pct(v.getInvestedAmount(), v.gainLoss()))
                .build();
    }

    private BigDecimal[] computeOneDayChange(String userId) {
        List<PriceSnapshot> snapshots = priceSnapshotRepository.findByUserIdOrderByCapturedDateAsc(userId);
        if (snapshots.isEmpty()) {
            return new BigDecimal[]{BigDecimal.ZERO, BigDecimal.ZERO};
        }
        Map<LocalDate, BigDecimal> byDate = new TreeMap<>();
        for (PriceSnapshot s : snapshots) {
            byDate.merge(s.getCapturedDate(), s.getCurrentValue(), BigDecimal::add);
        }
        List<LocalDate> dates = new ArrayList<>(byDate.keySet());
        if (dates.size() < 2) {
            return new BigDecimal[]{BigDecimal.ZERO, BigDecimal.ZERO};
        }
        BigDecimal today = byDate.get(dates.get(dates.size() - 1));
        BigDecimal yesterday = byDate.get(dates.get(dates.size() - 2));
        BigDecimal change = today.subtract(yesterday);
        return new BigDecimal[]{change.setScale(2, RoundingMode.HALF_UP), pct(yesterday, change)};
    }

    private List<PortfolioDashboardDto.BreakdownEntryDto> buildAssetAllocation(List<AssetValuation> included, BigDecimal total) {
        Map<String, BigDecimal> buckets = new LinkedHashMap<>();
        buckets.put("Equity", BigDecimal.ZERO);
        buckets.put("Debt", BigDecimal.ZERO);
        buckets.put("Others", BigDecimal.ZERO);
        for (AssetValuation v : included) {
            String bucket = topLevelBucket(v);
            buckets.merge(bucket, v.getCurrentValue(), BigDecimal::add);
        }
        return toBreakdownList(buckets, total);
    }

    private String topLevelBucket(AssetValuation v) {
        return switch (v.getAssetType()) {
            case STOCK, ETF -> "Equity";
            case MUTUAL_FUND -> "EQUITY".equals(v.getCategory()) ? "Equity" : "DEBT".equals(v.getCategory()) ? "Debt" : "Others";
            case DEPOSIT, BOND -> "Debt";
            case NPS, METAL, REAL_ESTATE, OTHER -> "Others";
        };
    }

    private List<PortfolioDashboardDto.BreakdownEntryDto> buildBreakdownByAssetType(List<AssetValuation> included, BigDecimal total) {
        Map<String, BigDecimal> byType = new LinkedHashMap<>();
        for (AssetValuation v : included) {
            byType.merge(v.getAssetType().name(), v.getCurrentValue(), BigDecimal::add);
        }
        return toBreakdownList(byType, total);
    }

    private List<PortfolioDashboardDto.BreakdownEntryDto> buildMutualFundByCategory(String userId) {
        List<MutualFundHolding> mfs = mutualFundHoldingRepository.findByUserIdOrderByCreatedAtDesc(userId).stream()
                .filter(m -> m.isIncluded()).collect(Collectors.toList());
        BigDecimal total = mfs.stream().map(m -> m.getUnits().multiply(m.getCurrentNav())).reduce(BigDecimal.ZERO, BigDecimal::add);
        Map<String, BigDecimal> byCategory = new LinkedHashMap<>();
        for (MutualFundHolding m : mfs) {
            byCategory.merge(m.getCategory().name(), m.getUnits().multiply(m.getCurrentNav()), BigDecimal::add);
        }
        return toBreakdownList(byCategory, total);
    }

    private List<PortfolioDashboardDto.BreakdownEntryDto> buildMutualFundByCapitalisation(String userId) {
        List<MutualFundHolding> mfs = mutualFundHoldingRepository.findByUserIdOrderByCreatedAtDesc(userId).stream()
                .filter(m -> m.isIncluded() && m.getCapitalisation() != null).collect(Collectors.toList());
        BigDecimal total = mfs.stream().map(m -> m.getUnits().multiply(m.getCurrentNav())).reduce(BigDecimal.ZERO, BigDecimal::add);
        Map<String, BigDecimal> byCap = new LinkedHashMap<>();
        for (MutualFundHolding m : mfs) {
            byCap.merge(m.getCapitalisation().name(), m.getUnits().multiply(m.getCurrentNav()), BigDecimal::add);
        }
        return toBreakdownList(byCap, total);
    }

    private PortfolioDashboardDto.NpsAllocationSummaryDto buildNpsAllocationSummary(String userId) {
        List<NpsHolding> npsHoldings = npsHoldingRepository.findByUserIdOrderByCreatedAtDesc(userId);
        BigDecimal totalValue = BigDecimal.ZERO;
        BigDecimal eq = BigDecimal.ZERO, debt = BigDecimal.ZERO, gsec = BigDecimal.ZERO, alt = BigDecimal.ZERO;
        for (NpsHolding h : npsHoldings) {
            BigDecimal value = h.getUnits().multiply(h.getCurrentNav());
            NpsSchemeAllocation a = npsSchemeAllocationRepository.findByNpsHoldingId(h.getId()).orElse(null);
            if (a == null) continue;
            totalValue = totalValue.add(value);
            eq = eq.add(value.multiply(a.getEquityPct()));
            debt = debt.add(value.multiply(a.getCorporateDebtPct()));
            gsec = gsec.add(value.multiply(a.getGovernmentSecuritiesPct()));
            alt = alt.add(value.multiply(a.getAlternativePct()));
        }
        if (totalValue.compareTo(BigDecimal.ZERO) == 0) {
            return PortfolioDashboardDto.NpsAllocationSummaryDto.builder()
                    .equityPct(BigDecimal.ZERO).corporateDebtPct(BigDecimal.ZERO)
                    .governmentSecuritiesPct(BigDecimal.ZERO).alternativePct(BigDecimal.ZERO).build();
        }
        return PortfolioDashboardDto.NpsAllocationSummaryDto.builder()
                .equityPct(eq.divide(totalValue, 4, RoundingMode.HALF_UP).setScale(2, RoundingMode.HALF_UP))
                .corporateDebtPct(debt.divide(totalValue, 4, RoundingMode.HALF_UP).setScale(2, RoundingMode.HALF_UP))
                .governmentSecuritiesPct(gsec.divide(totalValue, 4, RoundingMode.HALF_UP).setScale(2, RoundingMode.HALF_UP))
                .alternativePct(alt.divide(totalValue, 4, RoundingMode.HALF_UP).setScale(2, RoundingMode.HALF_UP))
                .build();
    }

    private PortfolioDashboardDto.MetalsMiniPanelDto buildMetalsMiniPanel(String userId) {
        List<MetalHolding> metals = metalHoldingRepository.findByUserIdOrderByCreatedAtDesc(userId).stream()
                .filter(m -> m.isIncluded()).collect(Collectors.toList());
        BigDecimal totalInvested = metals.stream().map(MetalHolding::getInvestedAmount).reduce(BigDecimal.ZERO, BigDecimal::add);
        BigDecimal totalValue = metals.stream()
                .map(m -> m.getQuantityGrams().multiply(m.getCurrentPricePerGram()))
                .reduce(BigDecimal.ZERO, BigDecimal::add);
        Map<String, BigDecimal> byType = new LinkedHashMap<>();
        for (MetalHolding m : metals) {
            byType.merge(m.getMetalType().name(), m.getQuantityGrams().multiply(m.getCurrentPricePerGram()), BigDecimal::add);
        }
        return PortfolioDashboardDto.MetalsMiniPanelDto.builder()
                .totalInvested(totalInvested.setScale(2, RoundingMode.HALF_UP))
                .totalValue(totalValue.setScale(2, RoundingMode.HALF_UP))
                .gainLoss(totalValue.subtract(totalInvested).setScale(2, RoundingMode.HALF_UP))
                .byMetalType(toBreakdownList(byType, totalValue))
                .build();
    }

    private List<PortfolioDashboardDto.GrowthChartPointDto> buildGrowthChartSeries(String userId) {
        List<PriceSnapshot> snapshots = priceSnapshotRepository.findByUserIdOrderByCapturedDateAsc(userId);
        Map<LocalDate, BigDecimal[]> byDate = new TreeMap<>(); // [invested, worth]
        for (PriceSnapshot s : snapshots) {
            byDate.merge(s.getCapturedDate(), new BigDecimal[]{s.getInvestedAmount(), s.getCurrentValue()},
                    (a, b) -> new BigDecimal[]{a[0].add(b[0]), a[1].add(b[1])});
        }
        return byDate.entrySet().stream()
                .map(e -> PortfolioDashboardDto.GrowthChartPointDto.builder()
                        .date(e.getKey()).invested(e.getValue()[0]).worth(e.getValue()[1]).build())
                .collect(Collectors.toList());
    }

    private List<PortfolioDashboardDto.BreakdownEntryDto> toBreakdownList(Map<String, BigDecimal> amounts, BigDecimal total) {
        return amounts.entrySet().stream()
                .filter(e -> e.getValue().compareTo(BigDecimal.ZERO) > 0)
                .map(e -> PortfolioDashboardDto.BreakdownEntryDto.builder()
                        .label(e.getKey()).amount(e.getValue().setScale(2, RoundingMode.HALF_UP))
                        .percentage(pct(total, e.getValue()))
                        .build())
                .collect(Collectors.toList());
    }

    // ==================================================================
    // Growth Outlook (§6.3)
    // ==================================================================

    @Transactional(readOnly = true)
    public GrowthOutlookRequest getGrowthAssumptions(String userId) {
        return growthAssumptionsRepository.findById(userId)
                .map(a -> GrowthOutlookRequest.builder()
                        .expectedReturnPct(a.getExpectedReturnPct()).years(a.getYears())
                        .monthlySavings(a.getMonthlySavings()).inflationPct(a.getInflationPct())
                        .build())
                .orElseGet(() -> GrowthOutlookRequest.builder()
                        .expectedReturnPct(new BigDecimal("12.0")).years(10)
                        .monthlySavings(BigDecimal.ZERO).inflationPct(new BigDecimal("6.0"))
                        .build());
    }

    @Transactional
    public void resetGrowthAssumptions(String userId) {
        growthAssumptionsRepository.deleteById(userId);
    }

    @Transactional
    public GrowthOutlookResponseDto calculateGrowthOutlook(String userId, GrowthOutlookRequest req) {
        growthAssumptionsRepository.save(GrowthAssumptions.builder()
                .userId(userId).expectedReturnPct(req.getExpectedReturnPct()).years(req.getYears())
                .monthlySavings(req.getMonthlySavings()).inflationPct(req.getInflationPct())
                .updatedAt(LocalDateTime.now())
                .build());

        BigDecimal todayValue = sum(
                assetService.collectAllValuations(userId).stream().filter(AssetValuation::isIncluded).collect(Collectors.toList()),
                AssetValuation::getCurrentValue);

        double pv = todayValue.doubleValue();
        double annualRate = req.getExpectedReturnPct().doubleValue() / 100.0;
        double monthlyRate = annualRate / 12.0;
        double monthlySavings = req.getMonthlySavings().doubleValue();
        Double inflationRate = req.getInflationPct() != null ? req.getInflationPct().doubleValue() / 100.0 : null;

        List<GrowthOutlookResponseDto.GrowthProjectionPointDto> series = new ArrayList<>();
        for (int year = 1; year <= req.getYears(); year++) {
            int months = year * 12;
            double fvPv = pv * Math.pow(1 + annualRate, year);
            double fvAnnuity = monthlyRate > 0
                    ? monthlySavings * ((Math.pow(1 + monthlyRate, months) - 1) / monthlyRate)
                    : monthlySavings * months;
            double nominal = fvPv + fvAnnuity;
            Double real = inflationRate != null ? nominal / Math.pow(1 + inflationRate, year) : null;

            series.add(GrowthOutlookResponseDto.GrowthProjectionPointDto.builder()
                    .year(year)
                    .nominalValue(BigDecimal.valueOf(nominal).setScale(2, RoundingMode.HALF_UP))
                    .realValue(real != null ? BigDecimal.valueOf(real).setScale(2, RoundingMode.HALF_UP) : null)
                    .build());
        }

        GrowthOutlookResponseDto.GrowthProjectionPointDto last = series.get(series.size() - 1);
        return GrowthOutlookResponseDto.builder()
                .todayValue(todayValue.setScale(2, RoundingMode.HALF_UP))
                .projectedValueNominal(last.getNominalValue())
                .projectedValueReal(last.getRealValue())
                .series(series)
                .build();
    }

    // ==================================================================
    // Equity Drawdown Check (§6.4)
    // ==================================================================

    @Transactional(readOnly = true)
    public DrawdownCheckResponseDto calculateDrawdown(String userId, DrawdownCheckRequest req) {
        List<AssetValuation> included = assetService.collectAllValuations(userId).stream()
                .filter(AssetValuation::isIncluded).collect(Collectors.toList());

        BigDecimal portfolioValueBefore = sum(included, AssetValuation::getCurrentValue);
        BigDecimal equityBefore = included.stream()
                .map(v -> v.getCurrentValue().multiply(v.getEquityFraction()))
                .reduce(BigDecimal.ZERO, BigDecimal::add)
                .setScale(2, RoundingMode.HALF_UP);

        BigDecimal dropFraction = req.getDropPct().divide(HUNDRED, 6, RoundingMode.HALF_UP);
        BigDecimal equityAfter = equityBefore.multiply(BigDecimal.ONE.subtract(dropFraction)).setScale(2, RoundingMode.HALF_UP);
        BigDecimal equityLoss = equityBefore.subtract(equityAfter);
        BigDecimal portfolioValueAfter = portfolioValueBefore.subtract(equityLoss);

        BigDecimal recoveryYears = BigDecimal.ZERO;
        if (equityLoss.compareTo(BigDecimal.ZERO) > 0 && equityAfter.compareTo(BigDecimal.ZERO) > 0
                && req.getRecoveryReturnPct().compareTo(BigDecimal.ZERO) > 0) {
            double ratio = equityBefore.doubleValue() / equityAfter.doubleValue();
            double r = req.getRecoveryReturnPct().doubleValue() / 100.0;
            recoveryYears = BigDecimal.valueOf(Math.log(ratio) / Math.log(1 + r)).setScale(2, RoundingMode.HALF_UP);
        }

        return DrawdownCheckResponseDto.builder()
                .equityBeforeDrop(equityBefore)
                .equityAfterDrop(equityAfter)
                .equityLoss(equityLoss)
                .portfolioValueBeforeDrop(portfolioValueBefore)
                .portfolioValueAfterDrop(portfolioValueAfter)
                .portfolioLevelImpactPct(pct(portfolioValueBefore, equityLoss.negate()))
                .estimatedYearsToRecover(recoveryYears)
                .build();
    }

    // ==================================================================
    // Shared helpers
    // ==================================================================

    private BigDecimal sum(List<AssetValuation> list, java.util.function.Function<AssetValuation, BigDecimal> extractor) {
        return list.stream().map(extractor).reduce(BigDecimal.ZERO, BigDecimal::add).setScale(2, RoundingMode.HALF_UP);
    }

    private BigDecimal pct(BigDecimal base, BigDecimal delta) {
        if (base == null || base.compareTo(BigDecimal.ZERO) == 0) return BigDecimal.ZERO;
        return delta.divide(base, 6, RoundingMode.HALF_UP).multiply(HUNDRED).setScale(2, RoundingMode.HALF_UP);
    }
}
