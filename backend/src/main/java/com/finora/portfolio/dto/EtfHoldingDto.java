package com.finora.portfolio.dto;

import com.finora.portfolio.model.Market;
import lombok.*;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class EtfHoldingDto {
    private String id;
    private String name;
    private String ticker;
    private Market market;
    private BigDecimal quantity;
    private BigDecimal avgCostPerUnit;
    private BigDecimal investedAmount;
    private BigDecimal currentPrice;
    private boolean isLive;
    private LocalDateTime livePriceAsOf;
    private BigDecimal currentValue;
    private BigDecimal gainLoss;
    private BigDecimal gainLossPct;
    private Boolean isIncluded;
    private LocalDateTime createdAt;
}
