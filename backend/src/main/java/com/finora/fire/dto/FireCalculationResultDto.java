package com.finora.fire.dto;

import lombok.*;

import java.math.BigDecimal;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class FireCalculationResultDto {

    private BigDecimal fireNumber;
    private BigDecimal swrMultiple; // e.g., 25x for 4% SWR
    private BigDecimal yearsToFire;
    private Integer computedRetirementAge;
    private BigDecimal requiredMonthlySavings;
    private BigDecimal currentProgressPercentage;
    private Boolean isInputsValid;
    private String validationMessage;
}
