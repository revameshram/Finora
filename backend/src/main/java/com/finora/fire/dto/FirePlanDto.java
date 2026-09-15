package com.finora.fire.dto;

import com.finora.fire.model.FireCalculationMode;
import com.finora.fire.model.FireSavingsSource;
import lombok.*;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class FirePlanDto {

    private String id;
    private String userId;
    private FireSavingsSource currentSavingsSource;
    private BigDecimal manualCurrentSavings;
    private BigDecimal effectiveCurrentSavings;
    private Integer currentAge;
    private Integer targetRetirementAge;
    private BigDecimal monthlySavings;
    private BigDecimal expectedAnnualReturnPct;
    private BigDecimal postRetirementReturnPct;
    private BigDecimal annualExpensesInRetirement;
    private BigDecimal safeWithdrawalRatePct;
    private BigDecimal swrMultiple; // e.g. 25x for 4%
    private BigDecimal expectedAnnualInflationPct;
    private FireCalculationMode activeMode;
    private String notes;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}
