package com.finora.portfolio.dto;

import com.finora.portfolio.model.MetalType;
import lombok.*;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class MetalHoldingDto {
    private String id;
    private MetalType metalType;
    private Integer purityKarat;
    private BigDecimal quantityGrams;
    private BigDecimal avgCostPerGram;
    private BigDecimal investedAmount;
    private BigDecimal currentPricePerGram;
    private boolean isLive;
    private LocalDateTime livePriceAsOf;
    private BigDecimal currentValue;
    private BigDecimal gainLoss;
    private BigDecimal gainLossPct;
    private Boolean isIncluded;
    private LocalDateTime createdAt;
}
