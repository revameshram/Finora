package com.finora.common.currency.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.Map;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ExchangeRatesDto {

    private String baseCurrency;
    private Map<String, BigDecimal> rates;
    private LocalDateTime lastUpdated;
    private boolean isLive;
}
