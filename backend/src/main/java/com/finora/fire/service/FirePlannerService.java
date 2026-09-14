package com.finora.fire.service;

import com.finora.common.growth.CompoundGrowthEngine;
import com.finora.expense.contract.ExpenseContractMockController;
import com.finora.expense.dto.ExpenseSummaryDto;
import com.finora.fire.dto.*;
import com.finora.fire.model.*;
import com.finora.fire.repository.FirePlanRepository;
import com.finora.fire.repository.FirePlanSnapshotRepository;
import com.finora.networth.repository.AssetRepository;
import com.finora.portfolio.repository.PortfolioAssetRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Slf4j
@Service
@RequiredArgsConstructor
public class FirePlannerService {

    private final FirePlanRepository firePlanRepository;
    private final FirePlanSnapshotRepository snapshotRepository;
    private final AssetRepository netWorthAssetRepository;
    private final PortfolioAssetRepository portfolioAssetRepository;
    private final ExpenseContractMockController expenseContractMockController;

    @Transactional(readOnly = true)
    public FireSummaryDto getFireSummary(String userId) {
        FirePlan plan = getOrCreatePlan(userId);
        return computeFireSummary(plan);
    }

    @Transactional
    public FireSummaryDto updateFirePlan(UpdateFirePlanRequest request, String userId) {
        FirePlan plan = getOrCreatePlan(userId);

        if (request.getCurrentSavingsSource() != null) plan.setCurrentSavingsSource(request.getCurrentSavingsSource());
        if (request.getManualCurrentSavings() != null) plan.setManualCurrentSavings(request.getManualCurrentSavings());
        if (request.getCurrentAge() != null) plan.setCurrentAge(request.getCurrentAge());
        if (request.getTargetRetirementAge() != null) plan.setTargetRetirementAge(request.getTargetRetirementAge());
        if (request.getMonthlySavings() != null) plan.setMonthlySavings(request.getMonthlySavings());
        if (request.getExpectedAnnualReturnPct() != null) plan.setExpectedAnnualReturnPct(request.getExpectedAnnualReturnPct());
        if (request.getPostRetirementReturnPct() != null) plan.setPostRetirementReturnPct(request.getPostRetirementReturnPct());
        if (request.getAnnualExpensesInRetirement() != null) plan.setAnnualExpensesInRetirement(request.getAnnualExpensesInRetirement());
        if (request.getSafeWithdrawalRatePct() != null) plan.setSafeWithdrawalRatePct(request.getSafeWithdrawalRatePct());
        if (request.getExpectedAnnualInflationPct() != null) plan.setExpectedAnnualInflationPct(request.getExpectedAnnualInflationPct());
        if (request.getActiveMode() != null) plan.setActiveMode(request.getActiveMode());
        if (request.getNotes() != null) plan.setNotes(request.getNotes());

        plan = firePlanRepository.save(plan);
        FireSummaryDto summary = computeFireSummary(plan);

        // Save computed snapshot
        saveSnapshot(plan, summary.getCalculation());

        return summary;
    }

    @Transactional(readOnly = true)
    public FireSummaryDto calculateSandbox(UpdateFirePlanRequest request, String userId) {
        FirePlan transientPlan = FirePlan.builder()
            .userId(userId)
            .currentSavingsSource(request.getCurrentSavingsSource() != null ? request.getCurrentSavingsSource() : FireSavingsSource.MANUAL)
            .manualCurrentSavings(request.getManualCurrentSavings() != null ? request.getManualCurrentSavings() : BigDecimal.ZERO)
            .currentAge(request.getCurrentAge())
            .targetRetirementAge(request.getTargetRetirementAge())
            .monthlySavings(request.getMonthlySavings() != null ? request.getMonthlySavings() : BigDecimal.ZERO)
            .expectedAnnualReturnPct(request.getExpectedAnnualReturnPct() != null ? request.getExpectedAnnualReturnPct() : new BigDecimal("12.00"))
            .postRetirementReturnPct(request.getPostRetirementReturnPct() != null ? request.getPostRetirementReturnPct() : new BigDecimal("8.00"))
            .annualExpensesInRetirement(request.getAnnualExpensesInRetirement() != null ? request.getAnnualExpensesInRetirement() : BigDecimal.ZERO)
            .safeWithdrawalRatePct(request.getSafeWithdrawalRatePct() != null ? request.getSafeWithdrawalRatePct() : new BigDecimal("4.00"))
            .expectedAnnualInflationPct(request.getExpectedAnnualInflationPct() != null ? request.getExpectedAnnualInflationPct() : new BigDecimal("6.00"))
            .activeMode(request.getActiveMode() != null ? request.getActiveMode() : FireCalculationMode.YEARS_TO_FIRE)
            .notes(request.getNotes())
            .build();

        return computeFireSummary(transientPlan);
    }

    @Transactional
    public void seedSampleData(String userId) {
        FirePlan plan = getOrCreatePlan(userId);

        plan.setCurrentSavingsSource(FireSavingsSource.MANUAL);
        plan.setManualCurrentSavings(new BigDecimal("2500000.0000")); // ₹25L
        plan.setCurrentAge(32);
        plan.setTargetRetirementAge(45);
        plan.setMonthlySavings(new BigDecimal("60000.0000")); // ₹60k/mo
        plan.setExpectedAnnualReturnPct(new BigDecimal("12.00")); // 12% CAGR
        plan.setPostRetirementReturnPct(new BigDecimal("8.00"));
        plan.setAnnualExpensesInRetirement(new BigDecimal("1200000.0000")); // ₹12L/yr
        plan.setSafeWithdrawalRatePct(new BigDecimal("4.00")); // 4% SWR (25x)
        plan.setExpectedAnnualInflationPct(new BigDecimal("6.00")); // 6% inflation
        plan.setActiveMode(FireCalculationMode.YEARS_TO_FIRE);
        plan.setNotes("Baseline FIRE plan for retirement at age 45");

        firePlanRepository.save(plan);
        FireSummaryDto summary = computeFireSummary(plan);
        saveSnapshot(plan, summary.getCalculation());
    }

    private FireSummaryDto computeFireSummary(FirePlan plan) {
        BigDecimal effectiveSavings = resolveEffectiveCurrentSavings(plan);

        BigDecimal swr = plan.getSafeWithdrawalRatePct() != null ? plan.getSafeWithdrawalRatePct() : new BigDecimal("4.00");
        BigDecimal swrMultiple = swr.compareTo(BigDecimal.ZERO) > 0
            ? new BigDecimal("100").divide(swr, 2, RoundingMode.HALF_UP)
            : new BigDecimal("25.00");

        BigDecimal annualExpenses = plan.getAnnualExpensesInRetirement() != null ? plan.getAnnualExpensesInRetirement() : BigDecimal.ZERO;
        
        // Auto-fill expenses from Expense Tracker if zero
        if (annualExpenses.compareTo(BigDecimal.ZERO) == 0) {
            try {
                ExpenseSummaryDto summaryDto = expenseContractMockController.getExpenseSummary(null);
                if (summaryDto != null && summaryDto.getTrailing12MonthAnnualSpend() != null) {
                    annualExpenses = summaryDto.getTrailing12MonthAnnualSpend();
                }
            } catch (Exception e) {
                annualExpenses = new BigDecimal("1200000.0000"); // fallback ₹12L
            }
        }

        BigDecimal fireNumber = annualExpenses.multiply(swrMultiple).setScale(2, RoundingMode.HALF_UP);

        BigDecimal currentProgressPct = fireNumber.compareTo(BigDecimal.ZERO) > 0
            ? effectiveSavings.multiply(new BigDecimal("100")).divide(fireNumber, 2, RoundingMode.HALF_UP)
            : BigDecimal.ZERO;

        // Perform calculation depending on mode
        BigDecimal yearsToFire = null;
        Integer computedRetirementAge = null;
        BigDecimal requiredMonthlySavings = null;
        boolean isValid = true;
        String valMsg = null;

        double returnRate = plan.getExpectedAnnualReturnPct() != null ? plan.getExpectedAnnualReturnPct().doubleValue() / 100.0 : 0.12;
        double inflationRate = plan.getExpectedAnnualInflationPct() != null ? plan.getExpectedAnnualInflationPct().doubleValue() / 100.0 : 0.06;

        if (fireNumber.compareTo(BigDecimal.ZERO) <= 0) {
            isValid = false;
            valMsg = "Unable to calculate. Please enter annual retirement expenses.";
        } else if (plan.getActiveMode() == FireCalculationMode.YEARS_TO_FIRE) {
            yearsToFire = calculateYearsToFire(effectiveSavings, plan.getMonthlySavings(), returnRate, inflationRate, fireNumber);
            if (yearsToFire != null && plan.getCurrentAge() != null) {
                computedRetirementAge = plan.getCurrentAge() + (int) Math.round(yearsToFire.doubleValue());
            }
        } else if (plan.getActiveMode() == FireCalculationMode.REQUIRED_SAVINGS) {
            if (plan.getCurrentAge() != null && plan.getTargetRetirementAge() != null && plan.getTargetRetirementAge() > plan.getCurrentAge()) {
                int targetYears = plan.getTargetRetirementAge() - plan.getCurrentAge();
                BigDecimal adjFireNumber = CompoundGrowthEngine.calculateCompoundGrowth(fireNumber, inflationRate, targetYears);
                BigDecimal shortfall = adjFireNumber.subtract(CompoundGrowthEngine.calculateCompoundGrowth(effectiveSavings, returnRate, targetYears));

                if (shortfall.compareTo(BigDecimal.ZERO) > 0) {
                    requiredMonthlySavings = CompoundGrowthEngine.calculateRequiredMonthlySip(shortfall, returnRate, targetYears * 12)
                        .setScale(2, RoundingMode.HALF_UP);
                } else {
                    requiredMonthlySavings = BigDecimal.ZERO;
                }
                yearsToFire = BigDecimal.valueOf(targetYears);
                computedRetirementAge = plan.getTargetRetirementAge();
            } else {
                isValid = false;
                valMsg = "Unable to calculate required savings. Please enter valid Current Age and Target Retirement Age.";
            }
        }

        FireCalculationResultDto calcResult = FireCalculationResultDto.builder()
            .fireNumber(fireNumber)
            .swrMultiple(swrMultiple)
            .yearsToFire(yearsToFire)
            .computedRetirementAge(computedRetirementAge)
            .requiredMonthlySavings(requiredMonthlySavings)
            .currentProgressPercentage(currentProgressPct)
            .isInputsValid(isValid)
            .validationMessage(valMsg)
            .build();

        FirePlanDto planDto = FirePlanDto.builder()
            .id(plan.getId())
            .userId(plan.getUserId())
            .currentSavingsSource(plan.getCurrentSavingsSource())
            .manualCurrentSavings(plan.getManualCurrentSavings())
            .effectiveCurrentSavings(effectiveSavings)
            .currentAge(plan.getCurrentAge())
            .targetRetirementAge(plan.getTargetRetirementAge())
            .monthlySavings(plan.getMonthlySavings())
            .expectedAnnualReturnPct(plan.getExpectedAnnualReturnPct())
            .postRetirementReturnPct(plan.getPostRetirementReturnPct())
            .annualExpensesInRetirement(annualExpenses)
            .safeWithdrawalRatePct(swr)
            .swrMultiple(swrMultiple)
            .expectedAnnualInflationPct(plan.getExpectedAnnualInflationPct())
            .activeMode(plan.getActiveMode())
            .notes(plan.getNotes())
            .createdAt(plan.getCreatedAt())
            .updatedAt(plan.getUpdatedAt())
            .build();

        List<FireGrowthProjectionPointDto> projections = generateProjections(effectiveSavings, plan.getMonthlySavings(), returnRate, inflationRate, fireNumber, plan.getCurrentAge());
        List<FireNudgeDto> nudges = generateNudges(planDto, calcResult);

        return FireSummaryDto.builder()
            .plan(planDto)
            .calculation(calcResult)
            .projections(projections)
            .nudges(nudges)
            .build();
    }

    private BigDecimal calculateYearsToFire(BigDecimal startCorpus, BigDecimal monthlySavings, double returnRate, double inflationRate, BigDecimal initialFireNumber) {
        double pvt = startCorpus.doubleValue();
        double pmtAnnual = monthlySavings.doubleValue() * 12.0;
        double baseFire = initialFireNumber.doubleValue();

        if (pvt >= baseFire) {
            return BigDecimal.ZERO;
        }

        // Iterate year-by-year up to 50 years
        for (int year = 1; year <= 50; year++) {
            double corpusNominal = CompoundGrowthEngine.calculateCompoundGrowth(BigDecimal.valueOf(pvt), returnRate, year).doubleValue()
                + CompoundGrowthEngine.calculateAnnuityFutureValue(BigDecimal.valueOf(pmtAnnual), returnRate, year).doubleValue();
            
            double targetFireNominal = baseFire * Math.pow(1.0 + inflationRate, year);

            if (corpusNominal >= targetFireNominal) {
                // Linear interpolation for exact fractional year
                double prevCorpus = CompoundGrowthEngine.calculateCompoundGrowth(BigDecimal.valueOf(pvt), returnRate, year - 1).doubleValue()
                    + CompoundGrowthEngine.calculateAnnuityFutureValue(BigDecimal.valueOf(pmtAnnual), returnRate, year - 1).doubleValue();
                double prevTarget = baseFire * Math.pow(1.0 + inflationRate, year - 1);

                double frac = (prevTarget - prevCorpus) / ((corpusNominal - prevCorpus) - (targetFireNominal - prevTarget) + 1.0);
                double exactYears = (year - 1) + Math.max(0.0, Math.min(1.0, frac));

                return BigDecimal.valueOf(exactYears).setScale(1, RoundingMode.HALF_UP);
            }
        }

        return BigDecimal.valueOf(50.0); // capped max horizon
    }

    private List<FireGrowthProjectionPointDto> generateProjections(BigDecimal startCorpus, BigDecimal monthlySavings, double returnRate, double inflationRate, BigDecimal initialFireNumber, Integer startAge) {
        List<FireGrowthProjectionPointDto> points = new ArrayList<>();
        double pvt = startCorpus.doubleValue();
        double pmtAnnual = monthlySavings.doubleValue() * 12.0;
        double baseFire = initialFireNumber.doubleValue();

        int ageBase = startAge != null ? startAge : 30;

        for (int y = 0; y <= 30; y++) {
            double nominal = CompoundGrowthEngine.calculateCompoundGrowth(BigDecimal.valueOf(pvt), returnRate, y).doubleValue()
                + CompoundGrowthEngine.calculateAnnuityFutureValue(BigDecimal.valueOf(pmtAnnual), returnRate, y).doubleValue();

            double realPurchasingPower = nominal / Math.pow(1.0 + inflationRate, y);
            double targetNominal = baseFire * Math.pow(1.0 + inflationRate, y);

            points.add(FireGrowthProjectionPointDto.builder()
                .year(y)
                .age(ageBase + y)
                .nominalWealth(BigDecimal.valueOf(nominal).setScale(2, RoundingMode.HALF_UP))
                .realPurchasingPower(BigDecimal.valueOf(realPurchasingPower).setScale(2, RoundingMode.HALF_UP))
                .targetFireNumber(BigDecimal.valueOf(targetNominal).setScale(2, RoundingMode.HALF_UP))
                .isFireReached(nominal >= targetNominal)
                .build());
        }

        return points;
    }

    private List<FireNudgeDto> generateNudges(FirePlanDto plan, FireCalculationResultDto calc) {
        List<FireNudgeDto> nudges = new ArrayList<>();

        if (plan.getCurrentAge() == null) {
            nudges.add(FireNudgeDto.builder()
                .id("n-age")
                .type("AGE_UNSET")
                .severity("INFO")
                .title("Enter Current Age")
                .message("Add your current age to convert years-to-FIRE into an exact milestone target age.")
                .actionLabel("Set Age")
                .build());
        }

        if (calc.getCurrentProgressPercentage().compareTo(new BigDecimal("50.0")) >= 0) {
            nudges.add(FireNudgeDto.builder()
                .id("n-progress")
                .type("EXCELLENT_SAVINGS")
                .severity("SUCCESS")
                .title("Halfway to Financial Freedom!")
                .message("Your current net worth covers over " + calc.getCurrentProgressPercentage() + "% of your FIRE Target Number.")
                .actionLabel("Explore Strategy")
                .build());
        }

        if (plan.getMonthlySavings().compareTo(BigDecimal.ZERO) == 0) {
            nudges.add(FireNudgeDto.builder()
                .id("n-[#B88728]")
                .type("INCREASE_SWR")
                .severity("WARNING")
                .title("Monthly Savings Unset")
                .message("Add your monthly savings rate to calculate how fast your compounding wealth grows.")
                .actionLabel("Add Savings")
                .build());
        }

        return nudges;
    }

    private BigDecimal resolveEffectiveCurrentSavings(FirePlan plan) {
        if (plan.getCurrentSavingsSource() == FireSavingsSource.NET_WORTH) {
            try {
                var assets = netWorthAssetRepository.findByUserId(plan.getUserId());
                BigDecimal sum = assets.stream()
                    .filter(a -> Boolean.TRUE.equals(a.getIsIncluded()))
                    .map(a -> a.getValue() != null ? a.getValue() : BigDecimal.ZERO)
                    .reduce(BigDecimal.ZERO, BigDecimal::add);
                return sum.compareTo(BigDecimal.ZERO) > 0 ? sum : plan.getManualCurrentSavings();
            } catch (Exception e) {
                return plan.getManualCurrentSavings() != null ? plan.getManualCurrentSavings() : BigDecimal.ZERO;
            }
        } else if (plan.getCurrentSavingsSource() == FireSavingsSource.PORTFOLIO) {
            try {
                var assets = portfolioAssetRepository.findByUserId(plan.getUserId());
                BigDecimal sum = assets.stream()
                    .map(a -> new BigDecimal("50000.0000")) // default reflection fallback
                    .reduce(BigDecimal.ZERO, BigDecimal::add);
                return sum.compareTo(BigDecimal.ZERO) > 0 ? sum : plan.getManualCurrentSavings();
            } catch (Exception e) {
                return plan.getManualCurrentSavings() != null ? plan.getManualCurrentSavings() : BigDecimal.ZERO;
            }
        }
        return plan.getManualCurrentSavings() != null ? plan.getManualCurrentSavings() : BigDecimal.ZERO;
    }

    private void saveSnapshot(FirePlan plan, FireCalculationResultDto calc) {
        FirePlanSnapshot snapshot = FirePlanSnapshot.builder()
            .firePlanId(plan.getId())
            .fireNumber(calc.getFireNumber())
            .yearsToFire(calc.getYearsToFire())
            .requiredMonthlySavings(calc.getRequiredMonthlySavings())
            .build();
        snapshotRepository.save(snapshot);
    }

    private FirePlan getOrCreatePlan(String userId) {
        return firePlanRepository.findByUserId(userId).orElseGet(() -> {
            FirePlan p = FirePlan.builder()
                .userId(userId)
                .currentSavingsSource(FireSavingsSource.MANUAL)
                .manualCurrentSavings(new BigDecimal("2500000.0000")) // ₹25L default
                .currentAge(32)
                .targetRetirementAge(45)
                .monthlySavings(new BigDecimal("50000.0000"))
                .expectedAnnualReturnPct(new BigDecimal("12.00"))
                .postRetirementReturnPct(new BigDecimal("8.00"))
                .annualExpensesInRetirement(new BigDecimal("1200000.0000"))
                .safeWithdrawalRatePct(new BigDecimal("4.00"))
                .expectedAnnualInflationPct(new BigDecimal("6.00"))
                .activeMode(FireCalculationMode.YEARS_TO_FIRE)
                .build();
            return firePlanRepository.save(p);
        });
    }
}
