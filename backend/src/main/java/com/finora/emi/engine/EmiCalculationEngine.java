package com.finora.emi.engine;

import com.finora.emi.dto.*;
import com.finora.emi.model.LoanPrepayment;
import com.finora.emi.model.PrepaymentImpact;
import com.finora.emi.model.PrepaymentType;
import org.springframework.stereotype.Component;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDate;
import java.util.*;

@Component
public class EmiCalculationEngine {

    /**
     * Standard reducing balance EMI formula:
     * E = P * r * (1+r)^n / ((1+r)^n - 1)
     */
    public BigDecimal calculateMonthlyEmi(BigDecimal principal, BigDecimal annualInterestRate, int tenureMonths) {
        if (principal == null || principal.compareTo(BigDecimal.ZERO) <= 0 || tenureMonths <= 0) {
            return BigDecimal.ZERO;
        }
        if (annualInterestRate == null || annualInterestRate.compareTo(BigDecimal.ZERO) <= 0) {
            return principal.divide(BigDecimal.valueOf(tenureMonths), 2, RoundingMode.HALF_UP);
        }

        double p = principal.doubleValue();
        double r = annualInterestRate.doubleValue() / (12.0 * 100.0);
        double n = tenureMonths;

        double emi = (p * r * Math.pow(1 + r, n)) / (Math.pow(1 + r, n) - 1);
        return BigDecimal.valueOf(emi).setScale(2, RoundingMode.HALF_UP);
    }

    /**
     * Generates a complete month-by-month and year-by-year Amortization Schedule.
     */
    public AmortizationScheduleDto generateAmortizationSchedule(
            String loanId,
            BigDecimal sanctionedAmount,
            BigDecimal annualInterestRate,
            int tenureMonths,
            LocalDate startDate,
            BigDecimal initialEmi,
            List<LoanPrepayment> prepayments
    ) {
        if (startDate == null) {
            startDate = LocalDate.now();
        }
        if (initialEmi == null || initialEmi.compareTo(BigDecimal.ZERO) <= 0) {
            initialEmi = calculateMonthlyEmi(sanctionedAmount, annualInterestRate, tenureMonths);
        }

        double monthlyRate = annualInterestRate.doubleValue() / (12.0 * 100.0);
        BigDecimal currentBalance = sanctionedAmount;
        BigDecimal currentEmi = initialEmi;

        List<AmortizationMonthDto> monthlyList = new ArrayList<>();
        Map<Integer, List<AmortizationMonthDto>> yearlyMap = new LinkedHashMap<>();

        BigDecimal totalPrincipalPaid = BigDecimal.ZERO;
        BigDecimal totalInterestPaid = BigDecimal.ZERO;
        BigDecimal totalPrepaymentsPaid = BigDecimal.ZERO;

        int monthIndex = 1;
        LocalDate currentPaymentDate = startDate.plusMonths(1);

        // Prepayment map keyed by Month Index or matching dates
        Map<Integer, BigDecimal> monthPrepayments = buildPrepaymentsMap(startDate, tenureMonths, prepayments);

        while (currentBalance.compareTo(BigDecimal.ZERO) > 0 && monthIndex <= (tenureMonths * 2)) {
            BigDecimal opening = currentBalance;
            BigDecimal interest = opening.multiply(BigDecimal.valueOf(monthlyRate)).setScale(2, RoundingMode.HALF_UP);

            BigDecimal emi = currentEmi;
            BigDecimal principalPortion;

            if (opening.add(interest).compareTo(emi) <= 0 || (monthIndex == tenureMonths && opening.compareTo(emi.multiply(BigDecimal.valueOf(1.1))) <= 0)) {
                // Final payoff installment
                principalPortion = opening;
                emi = opening.add(interest);
            } else {
                principalPortion = emi.subtract(interest);
                if (principalPortion.compareTo(opening) > 0) {
                    principalPortion = opening;
                    emi = principalPortion.add(interest);
                }
            }

            BigDecimal prepay = monthPrepayments.getOrDefault(monthIndex, BigDecimal.ZERO);
            if (prepay.compareTo(BigDecimal.ZERO) > 0) {
                BigDecimal maxPrepay = opening.subtract(principalPortion);
                if (prepay.compareTo(maxPrepay) > 0) {
                    prepay = maxPrepay;
                }
            }

            BigDecimal closing = opening.subtract(principalPortion).subtract(prepay);
            if (closing.compareTo(BigDecimal.ZERO) < 0) {
                closing = BigDecimal.ZERO;
            }

            AmortizationMonthDto monthDto = AmortizationMonthDto.builder()
                    .monthIndex(monthIndex)
                    .installmentNumber(monthIndex)
                    .paymentDate(currentPaymentDate)
                    .openingBalance(opening)
                    .emiAmount(emi)
                    .principalComponent(principalPortion)
                    .interestComponent(interest)
                    .prepaymentAmount(prepay)
                    .totalMonthlyPaid(emi.add(prepay))
                    .closingBalance(closing)
                    .isPaid(false)
                    .build();

            monthlyList.add(monthDto);

            int calYear = currentPaymentDate.getYear();
            yearlyMap.computeIfAbsent(calYear, k -> new ArrayList<>()).add(monthDto);

            totalPrincipalPaid = totalPrincipalPaid.add(principalPortion);
            totalInterestPaid = totalInterestPaid.add(interest);
            totalPrepaymentsPaid = totalPrepaymentsPaid.add(prepay);

            currentBalance = closing;
            if (currentBalance.compareTo(BigDecimal.ZERO) <= 0) {
                break;
            }

            // Check if any prepayment in this month requested EMI reduction instead of tenure reduction
            LoanPrepayment activePrepay = getPrepaymentForMonth(monthIndex, startDate, prepayments);
            if (activePrepay != null && activePrepay.getImpact() == PrepaymentImpact.REDUCE_EMI) {
                int remainingMonths = tenureMonths - monthIndex;
                if (remainingMonths > 0) {
                    currentEmi = calculateMonthlyEmi(currentBalance, annualInterestRate, remainingMonths);
                }
            }

            monthIndex++;
            currentPaymentDate = currentPaymentDate.plusMonths(1);
        }

        // Aggregate Yearly Schedules
        List<AmortizationYearDto> yearlyList = new ArrayList<>();
        int yearIdx = 1;
        for (Map.Entry<Integer, List<AmortizationMonthDto>> entry : yearlyMap.entrySet()) {
            int calYear = entry.getKey();
            List<AmortizationMonthDto> mList = entry.getValue();

            BigDecimal yOpening = mList.get(0).getOpeningBalance();
            BigDecimal yClosing = mList.get(mList.size() - 1).getClosingBalance();
            BigDecimal yEmi = mList.stream().map(AmortizationMonthDto::getEmiAmount).reduce(BigDecimal.ZERO, BigDecimal::add);
            BigDecimal yPrincipal = mList.stream().map(AmortizationMonthDto::getPrincipalComponent).reduce(BigDecimal.ZERO, BigDecimal::add);
            BigDecimal yInterest = mList.stream().map(AmortizationMonthDto::getInterestComponent).reduce(BigDecimal.ZERO, BigDecimal::add);
            BigDecimal yPrepay = mList.stream().map(AmortizationMonthDto::getPrepaymentAmount).reduce(BigDecimal.ZERO, BigDecimal::add);

            yearlyList.add(AmortizationYearDto.builder()
                    .yearIndex(yearIdx++)
                    .calendarYear(calYear)
                    .openingBalance(yOpening)
                    .totalEmiPaid(yEmi)
                    .totalPrincipalPaid(yPrincipal)
                    .totalInterestPaid(yInterest)
                    .totalPrepaymentPaid(yPrepay)
                    .closingBalance(yClosing)
                    .months(mList)
                    .build());
        }

        int actualTenure = monthlyList.size();
        int monthsSaved = Math.max(0, tenureMonths - actualTenure);

        // Baseline Interest without any prepayments for comparison
        BigDecimal baselineInterest = calculateBaselineInterest(sanctionedAmount, annualInterestRate, tenureMonths);
        BigDecimal interestSaved = baselineInterest.subtract(totalInterestPaid);
        if (interestSaved.compareTo(BigDecimal.ZERO) < 0) {
            interestSaved = BigDecimal.ZERO;
        }

        LocalDate payoffDate = monthlyList.isEmpty() ? startDate : monthlyList.get(monthlyList.size() - 1).getPaymentDate();

        return AmortizationScheduleDto.builder()
                .loanId(loanId)
                .sanctionedAmount(sanctionedAmount)
                .currentOutstanding(currentBalance)
                .monthlyEmi(initialEmi)
                .annualInterestRate(annualInterestRate)
                .originalTenureMonths(tenureMonths)
                .actualTenureMonths(actualTenure)
                .monthsSaved(monthsSaved)
                .startDate(startDate)
                .projectedPayoffDate(payoffDate)
                .totalPrincipalPaid(totalPrincipalPaid)
                .totalInterestPaid(totalInterestPaid)
                .totalPrepaymentPaid(totalPrepaymentsPaid)
                .totalAmountPayable(totalPrincipalPaid.add(totalInterestPaid).add(totalPrepaymentsPaid))
                .totalInterestSaved(interestSaved)
                .yearlySchedules(yearlyList)
                .monthlySchedules(monthlyList)
                .build();
    }

    /**
     * Prepayment Optimizer Simulation: Baseline vs Simulated Strategy
     */
    public PrepaymentSimulationResultDto simulatePrepaymentScenario(
            BigDecimal sanctionedAmount,
            BigDecimal annualInterestRate,
            int tenureMonths,
            LocalDate startDate,
            PrepaymentSimulationRequest request
    ) {
        if (startDate == null) startDate = LocalDate.now();

        // 1. Baseline Schedule without extra prepayments
        AmortizationScheduleDto baseline = generateAmortizationSchedule(
                "baseline", sanctionedAmount, annualInterestRate, tenureMonths, startDate, null, Collections.emptyList()
        );

        // 2. Build simulated prepayment list
        List<LoanPrepayment> prepays = new ArrayList<>();
        LocalDate prepayDate = request.getSimulationDate() != null ? request.getSimulationDate() : startDate.plusMonths(request.getStartMonthIndex() != null ? request.getStartMonthIndex() : 12);

        prepays.add(LoanPrepayment.builder()
                .id("sim_prepay_1")
                .loanId("sim_loan")
                .paymentDate(prepayDate)
                .amount(request.getAmount())
                .prepaymentType(request.getPrepaymentType() != null ? request.getPrepaymentType() : PrepaymentType.ONE_TIME)
                .impact(request.getImpact() != null ? request.getImpact() : PrepaymentImpact.REDUCE_TENURE)
                .build());

        // 3. Simulated Schedule
        AmortizationScheduleDto simulated = generateAmortizationSchedule(
                "simulated", sanctionedAmount, annualInterestRate, tenureMonths, startDate, null, prepays
        );

        BigDecimal interestSaved = baseline.getTotalInterestPaid().subtract(simulated.getTotalInterestPaid());
        if (interestSaved.compareTo(BigDecimal.ZERO) < 0) interestSaved = BigDecimal.ZERO;

        int monthsSaved = Math.max(0, baseline.getActualTenureMonths() - simulated.getActualTenureMonths());

        double savingsPct = baseline.getTotalInterestPaid().compareTo(BigDecimal.ZERO) > 0
                ? (interestSaved.doubleValue() * 100.0) / baseline.getTotalInterestPaid().doubleValue()
                : 0.0;

        BigDecimal newMonthlyEmi = request.getImpact() == PrepaymentImpact.REDUCE_EMI && !simulated.getMonthlySchedules().isEmpty()
                ? simulated.getMonthlySchedules().get(simulated.getMonthlySchedules().size() - 1).getEmiAmount()
                : baseline.getMonthlyEmi();

        return PrepaymentSimulationResultDto.builder()
                .baselineTotalInterest(baseline.getTotalInterestPaid())
                .baselineTotalPayment(baseline.getTotalAmountPayable())
                .baselineTenureMonths(baseline.getActualTenureMonths())
                .baselinePayoffDate(baseline.getProjectedPayoffDate())
                .simulatedTotalInterest(simulated.getTotalInterestPaid())
                .simulatedTotalPayment(simulated.getTotalAmountPayable())
                .simulatedTenureMonths(simulated.getActualTenureMonths())
                .simulatedPayoffDate(simulated.getProjectedPayoffDate())
                .simulatedNewMonthlyEmi(newMonthlyEmi)
                .totalInterestSaved(interestSaved)
                .monthsSaved(monthsSaved)
                .interestSavingsPercent(Math.round(savingsPct * 10.0) / 10.0)
                .totalPrepaymentInvested(request.getAmount())
                .build();
    }

    /**
     * Standalone Quick EMI Calculation for UI Sliders & Metrics
     */
    public StandaloneEmiCalculateResponse calculateStandalone(StandaloneEmiCalculateRequest request) {
        BigDecimal emi = calculateMonthlyEmi(request.getPrincipalAmount(), request.getAnnualInterestRate(), request.getTenureMonths());
        BigDecimal totalPayment = emi.multiply(BigDecimal.valueOf(request.getTenureMonths())).setScale(2, RoundingMode.HALF_UP);
        BigDecimal totalInterest = totalPayment.subtract(request.getPrincipalAmount());
        if (totalInterest.compareTo(BigDecimal.ZERO) < 0) totalInterest = BigDecimal.ZERO;

        double principal = request.getPrincipalAmount().doubleValue();
        double total = totalPayment.doubleValue();
        double interest = totalInterest.doubleValue();

        double principalPct = total > 0 ? (principal * 100.0) / total : 100.0;
        double interestPct = total > 0 ? (interest * 100.0) / total : 0.0;
        double ratio = principal > 0 ? interest / principal : 0.0;

        return StandaloneEmiCalculateResponse.builder()
                .monthlyEmi(emi)
                .principalAmount(request.getPrincipalAmount())
                .totalInterestPayable(totalInterest)
                .totalPaymentPayable(totalPayment)
                .interestToPrincipalRatio(Math.round(ratio * 100.0) / 100.0)
                .principalPercentage(Math.round(principalPct * 10.0) / 10.0)
                .interestPercentage(Math.round(interestPct * 10.0) / 10.0)
                .build();
    }

    // --- Internal Helpers ---

    private Map<Integer, BigDecimal> buildPrepaymentsMap(LocalDate startDate, int tenureMonths, List<LoanPrepayment> prepayments) {
        Map<Integer, BigDecimal> map = new HashMap<>();
        if (prepayments == null || prepayments.isEmpty()) return map;

        for (LoanPrepayment p : prepayments) {
            if (p.getPrepaymentType() == PrepaymentType.ONE_TIME) {
                int monthIdx = calculateMonthDifference(startDate, p.getPaymentDate());
                if (monthIdx >= 1) {
                    map.merge(monthIdx, p.getAmount(), BigDecimal::add);
                }
            } else if (p.getPrepaymentType() == PrepaymentType.RECURRING_ANNUAL) {
                int startMonth = calculateMonthDifference(startDate, p.getPaymentDate());
                for (int m = Math.max(1, startMonth); m <= tenureMonths; m += 12) {
                    map.merge(m, p.getAmount(), BigDecimal::add);
                }
            } else if (p.getPrepaymentType() == PrepaymentType.RECURRING_MONTHLY) {
                int startMonth = calculateMonthDifference(startDate, p.getPaymentDate());
                for (int m = Math.max(1, startMonth); m <= tenureMonths; m++) {
                    map.merge(m, p.getAmount(), BigDecimal::add);
                }
            }
        }
        return map;
    }

    private LoanPrepayment getPrepaymentForMonth(int monthIndex, LocalDate startDate, List<LoanPrepayment> prepayments) {
        if (prepayments == null) return null;
        for (LoanPrepayment p : prepayments) {
            int targetMonth = calculateMonthDifference(startDate, p.getPaymentDate());
            if (targetMonth == monthIndex) {
                return p;
            }
        }
        return null;
    }

    private int calculateMonthDifference(LocalDate start, LocalDate target) {
        if (start == null || target == null) return 1;
        int diffYears = target.getYear() - start.getYear();
        int diffMonths = target.getMonthValue() - start.getMonthValue();
        return Math.max(1, (diffYears * 12) + diffMonths);
    }

    private BigDecimal calculateBaselineInterest(BigDecimal principal, BigDecimal annualRate, int tenureMonths) {
        BigDecimal emi = calculateMonthlyEmi(principal, annualRate, tenureMonths);
        BigDecimal total = emi.multiply(BigDecimal.valueOf(tenureMonths));
        BigDecimal interest = total.subtract(principal);
        return interest.compareTo(BigDecimal.ZERO) > 0 ? interest : BigDecimal.ZERO;
    }
}
