package com.finora.common.currency.dto;

import com.finora.common.currency.model.CurrencyCode;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class CurrencyMetadataDto {

    private String code;
    private String name;
    private String symbol;
    private String country;
    private String flag;
    private int decimalPlaces;

    public static CurrencyMetadataDto fromEnum(CurrencyCode currency) {
        return CurrencyMetadataDto.builder()
                .code(currency.getCode())
                .name(currency.getName())
                .symbol(currency.getSymbol())
                .country(currency.getCountry())
                .flag(currency.getFlag())
                .decimalPlaces(currency.getDecimalPlaces())
                .build();
    }
}
