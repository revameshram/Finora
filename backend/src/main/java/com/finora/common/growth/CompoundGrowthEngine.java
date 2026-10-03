package com.finora.common.growth;

import org.springframework.stereotype.Component;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.util.ArrayList;
import java.util.List;

/**
 * Shared Growth Engine Library (§5.3 / §7.8 / §11) owned by Net Worth Tracker and consumed
 * by Goal Manager and FIRE Planner.
 *
 * Provides pure mathematical implementations for compound growth, Future Value (FV) of annuity (SIP),
 * inflation-adjusted real purchasing power discounting, and reverse SIP target costing.
 */
@Component
public class CompoundGrowthEngine {

    private static final BigDecimal HUNDRED = BigDecimal.valueOf(100);

    public static BigDecimal calculateCompoundGrowth(BigDecimal presentValue, double annualRate, double years) {
        if (presentValue == null || presentValue.compareTo(BigDecimal.ZERO) == 0 || years <= 0) {
            return presentValue != null ? presentValue : BigDecimal.ZERO;
        }
        double fv = presentValue.doubleValue() * Math.pow(1.0 + annualRate, years);
        return BigDecimal.valueOf(fv).setScale(4, RoundingMode.HALF_UP);
    }

    public static BigDecimal calculateAnnuityFutureValue(BigDecimal annualContribution, double annualRate, double years) {
        if (annualContribution == null || annualContribution.compareTo(BigDecimal.ZERO) == 0 || years <= 0) {
            return BigDecimal.ZERO;
        }
        double pmt = annualContribution.doubleValue();
        if (annualRate == 0) {
            return BigDecimal.valueOf(pmt * years).setScale(4, RoundingMode.HALF_UP);
        }
        double fv = pmt * ((Math.pow(1.0 + annualRate, years) - 1.0) / annualRate);
        return BigDecimal.valueOf(fv).setScale(4, RoundingMode.HALF_UP);
    }

    public static BigDecimal calculateRequiredMonthlySip(BigDecimal targetShortfall, double annualRate, int months) {
        if (targetShortfall == null || targetShortfall.compareTo(BigDecimal.ZERO) <= 0 || months <= 0) {
            return BigDecimal.ZERO;
        }
        double shortfall = targetShortfall.doubleValue();
        double monthlyRate = annualRate / 12.0;
        if (monthlyRate == 0) {
            return BigDecimal.valueOf(shortfall / months).setScale(2, RoundingMode.HALF_UP);
        }
        double factor = (Math.pow(1.0 + monthlyRate, months) - 1.0) / monthlyRate;
        return BigDecimal.valueOf(shortfall / factor).setScale(2, RoundingMode.HALF_UP);
    }

    /**
     * Future Value of a Lump Sum: FV = PV * (1 + r)^n
     */
    public BigDecimal calculateFutureValueLumpSum(BigDecimal presentValue, BigDecimal annualRatePct, int years) {
        if (presentValue == null || presentValue.compareTo(BigDecimal.ZERO) == 0) {
            return BigDecimal.ZERO;
        }
        if (annualRatePct == null || annualRatePct.compareTo(BigDecimal.ZERO) == 0 || years <= 0) {
            return presentValue.setScale(2, RoundingMode.HALF_UP);
        }
        double r = annualRatePct.doubleValue() / 100.0;
        double fv = presentValue.doubleValue() * Math.pow(1 + r, years);
        return BigDecimal.valueOf(fv).setScale(2, RoundingMode.HALF_UP);
    }

    /**
     * Future Value of a Monthly Annuity (SIP): FV = PMT * (((1 + r/12)^(n*12) - 1) / (r/12))
     */
    public BigDecimal calculateFutureValueAnnuity(BigDecimal monthlyContribution, BigDecimal annualRatePct, int years) {
        if (monthlyContribution == null || monthlyContribution.compareTo(BigDecimal.ZERO) == 0 || years <= 0) {
            return BigDecimal.ZERO;
        }
        double pmt = monthlyContribution.doubleValue();
        double annualRate = annualRatePct != null ? annualRatePct.doubleValue() / 100.0 : 0.0;
        double monthlyRate = annualRate / 12.0;
        int totalMonths = years * 12;

        double fv;
        if (monthlyRate == 0) {
            fv = pmt * totalMonths;
        } else {
            fv = pmt * ((Math.pow(1 + monthlyRate, totalMonths) - 1) / monthlyRate);
        }
        return BigDecimal.valueOf(fv).setScale(2, RoundingMode.HALF_UP);
    }

    /**
     * Inflation Discounting: Real FV = Nominal FV / (1 + i)^n
     */
    public BigDecimal calculateDiscountedRealValue(BigDecimal nominalValue, BigDecimal inflationRatePct, int years) {
        if (nominalValue == null) return BigDecimal.ZERO;
        if (inflationRatePct == null || inflationRatePct.compareTo(BigDecimal.ZERO) == 0 || years <= 0) {
            return nominalValue.setScale(2, RoundingMode.HALF_UP);
        }
        double inf = inflationRatePct.doubleValue() / 100.0;
        double real = nominalValue.doubleValue() / Math.pow(1 + inf, years);
        return BigDecimal.valueOf(real).setScale(2, RoundingMode.HALF_UP);
    }

    /**
     * Reverse SIP Target Costing: Calculates the required monthly contribution (PMT) needed to achieve
     * a target future value given an initial present value, annual return, and time horizon.
     */
    public BigDecimal calculateRequiredMonthlySavings(BigDecimal targetFutureValue, BigDecimal presentValue,
                                                       BigDecimal annualRatePct, BigDecimal inflationRatePct,
                                                       int years) {
        if (targetFutureValue == null || targetFutureValue.compareTo(BigDecimal.ZERO) <= 0 || years <= 0) {
            return BigDecimal.ZERO;
        }

        // Adjust target for inflation if specified
        BigDecimal adjustedTarget = inflationRatePct != null && inflationRatePct.compareTo(BigDecimal.ZERO) > 0
                ? targetFutureValue.multiply(BigDecimal.valueOf(Math.pow(1 + inflationRatePct.doubleValue() / 100.0, years)))
                : targetFutureValue;

        BigDecimal fvPresentValue = calculateFutureValueLumpSum(presentValue, annualRatePct, years);
        BigDecimal shortfall = adjustedTarget.subtract(fvPresentValue);
        if (shortfall.compareTo(BigDecimal.ZERO) <= 0) {
            return BigDecimal.ZERO; // Current lump sum alone fulfills target
        }

        double annualRate = annualRatePct != null ? annualRatePct.doubleValue() / 100.0 : 0.0;
        double monthlyRate = annualRate / 12.0;
        int totalMonths = years * 12;

        double requiredPmt;
        if (monthlyRate == 0) {
            requiredPmt = shortfall.doubleValue() / totalMonths;
        } else {
            double annuityFactor = (Math.pow(1 + monthlyRate, totalMonths) - 1) / monthlyRate;
            requiredPmt = shortfall.doubleValue() / annuityFactor;
        }
        return BigDecimal.valueOf(requiredPmt).setScale(2, RoundingMode.HALF_UP);
    }

    /**
     * Generates a year-by-year growth projection series combining lump sum growth and monthly annuity.
     */
    public List<GrowthProjectionPoint> generateProjectionSeries(BigDecimal presentValue, BigDecimal monthlySavings,
                                                                 BigDecimal annualRatePct, BigDecimal inflationRatePct,
                                                                 int totalYears) {
        List<GrowthProjectionPoint> series = new ArrayList<>();
        BigDecimal pv = presentValue != null ? presentValue : BigDecimal.ZERO;
        BigDecimal pmt = monthlySavings != null ? monthlySavings : BigDecimal.ZERO;

        for (int year = 1; year <= totalYears; year++) {
            BigDecimal fvLump = calculateFutureValueLumpSum(pv, annualRatePct, year);
            BigDecimal fvAnnuity = calculateFutureValueAnnuity(pmt, annualRatePct, year);
            BigDecimal nominalTotal = fvLump.add(fvAnnuity);
            BigDecimal realTotal = calculateDiscountedRealValue(nominalTotal, inflationRatePct, year);
            BigDecimal totalContributed = pv.add(pmt.multiply(BigDecimal.valueOf(year * 12L)));
            BigDecimal interestEarned = nominalTotal.subtract(totalContributed);
            if (interestEarned.compareTo(BigDecimal.ZERO) < 0) interestEarned = BigDecimal.ZERO;

            series.add(GrowthProjectionPoint.builder()
                    .year(year)
                    .nominalValue(nominalTotal)
                    .realValue(realTotal)
                    .cumulativeContributions(totalContributed.setScale(2, RoundingMode.HALF_UP))
                    .interestEarned(interestEarned.setScale(2, RoundingMode.HALF_UP))
                    .build());
        }
        return series;
    }
}
