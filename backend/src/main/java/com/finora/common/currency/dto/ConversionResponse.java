package com.finora.common.currency.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ConversionResponse {

    private BigDecimal originalAmount;
    private CurrencyMetadataDto fromCurrency;
    private BigDecimal convertedAmount;
    private CurrencyMetadataDto toCurrency;
    private BigDecimal exchangeRate;
    private String formattedOriginal;
    private String formattedConverted;
    private LocalDateTime timestamp;
}
