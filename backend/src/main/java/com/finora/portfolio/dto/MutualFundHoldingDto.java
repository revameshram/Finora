package com.finora.portfolio.dto;

import com.finora.portfolio.model.Capitalisation;
import com.finora.portfolio.model.MfCategory;
import lombok.*;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class MutualFundHoldingDto {
    private String id;
    private String schemeCode;
    private String schemeName;
    private MfCategory category;
    private Capitalisation capitalisation;
    private BigDecimal units;
    private BigDecimal avgNav;
    private BigDecimal investedAmount;
    private BigDecimal currentNav;
    private boolean isLive;
    private LocalDateTime livePriceAsOf;
    private BigDecimal currentValue;
    private BigDecimal gainLoss;
    private BigDecimal gainLossPct;
    private Boolean isIncluded;
    private LocalDateTime createdAt;
}
