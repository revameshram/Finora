package com.finora.fire.dto;

import com.finora.fire.model.FireCalculationMode;
import com.finora.fire.model.FireSavingsSource;
import lombok.*;

import java.math.BigDecimal;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class UpdateFirePlanRequest {

    private FireSavingsSource currentSavingsSource;
    private BigDecimal manualCurrentSavings;
    private Integer currentAge;
    private Integer targetRetirementAge;
    private BigDecimal monthlySavings;
    private BigDecimal expectedAnnualReturnPct;
    private BigDecimal postRetirementReturnPct;
    private BigDecimal annualExpensesInRetirement;
    private BigDecimal safeWithdrawalRatePct;
    private BigDecimal expectedAnnualInflationPct;
    private FireCalculationMode activeMode;
    private String notes;
}
