package com.finora.portfolio.dto;

import com.finora.portfolio.model.Capitalisation;
import com.finora.portfolio.model.MfCategory;
import lombok.*;

import java.math.BigDecimal;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class UpdateMutualFundHoldingRequest {
    private String schemeName;
    private MfCategory category;
    private Capitalisation capitalisation;
    private BigDecimal units;
    private BigDecimal avgNav;
}
