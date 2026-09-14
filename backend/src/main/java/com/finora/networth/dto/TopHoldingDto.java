package com.finora.networth.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class TopHoldingDto {

    private String id;
    private String name;
    private String type; // ASSET or LIABILITY
    private String category;
    private BigDecimal amount;
    private BigDecimal percentageOfTotal;
}
