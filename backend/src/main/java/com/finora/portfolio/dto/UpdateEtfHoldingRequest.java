package com.finora.portfolio.dto;

import lombok.*;

import java.math.BigDecimal;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class UpdateEtfHoldingRequest {
    private String ticker;
    private BigDecimal quantity;
    private BigDecimal avgCostPerUnit;
}
