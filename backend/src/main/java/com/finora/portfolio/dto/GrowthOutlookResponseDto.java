package com.finora.portfolio.dto;

import lombok.*;

import java.math.BigDecimal;
import java.util.List;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class GrowthOutlookResponseDto {

    private BigDecimal todayValue;
    private BigDecimal projectedValueNominal;
    private BigDecimal projectedValueReal; // null if no inflation rate supplied

    private List<GrowthProjectionPointDto> series;

    @Getter
    @Setter
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class GrowthProjectionPointDto {
        private int year;
        private BigDecimal nominalValue;
        private BigDecimal realValue; // "spending power" — null if no inflation rate supplied
    }
}
