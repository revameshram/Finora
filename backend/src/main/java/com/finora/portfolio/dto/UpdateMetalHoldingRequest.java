package com.finora.portfolio.dto;

import lombok.*;

import java.math.BigDecimal;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class UpdateMetalHoldingRequest {
    private Integer purityKarat;
    private BigDecimal quantityGrams;
    private BigDecimal avgCostPerGram;
}
