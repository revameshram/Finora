package com.finora.portfolio.dto;

import com.finora.portfolio.model.BondStatus;
import lombok.*;

import java.math.BigDecimal;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class UpdateBondRequest {
    private BigDecimal currentPrice;
    private BondStatus status;
}
