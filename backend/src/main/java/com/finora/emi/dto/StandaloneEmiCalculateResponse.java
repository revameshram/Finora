package com.finora.emi.dto;

import lombok.*;

import java.math.BigDecimal;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class StandaloneEmiCalculateResponse {
    private BigDecimal monthlyEmi;
    private BigDecimal principalAmount;
    private BigDecimal totalInterestPayable;
    private BigDecimal totalPaymentPayable;
    private Double interestToPrincipalRatio;
    private Double principalPercentage;
    private Double interestPercentage;
}
