package com.finora.common.currency.model;

import lombok.Getter;
import lombok.RequiredArgsConstructor;

@Getter
@RequiredArgsConstructor
public enum CurrencyCode {
    INR("INR", "Indian Rupee", "₹", "India", "🇮🇳", 2),
    USD("USD", "United States Dollar", "$", "United States", "🇺🇸", 2),
    EUR("EUR", "Euro", "€", "European Union", "🇪🇺", 2),
    GBP("GBP", "British Pound", "£", "United Kingdom", "🇬🇧", 2),
    JPY("JPY", "Japanese Yen", "¥", "Japan", "🇯🇵", 0),
    AED("AED", "United Arab Emirates Dirham", "د.إ", "United Arab Emirates", "🇦🇪", 2),
    SGD("SGD", "Singapore Dollar", "S$", "Singapore", "🇸🇬", 2),
    CAD("CAD", "Canadian Dollar", "C$", "Canada", "🇨🇦", 2),
    AUD("AUD", "Australian Dollar", "A$", "Australia", "🇦🇺", 2);

    private final String code;
    private final String name;
    private final String symbol;
    private final String country;
    private final String flag;
    private final int decimalPlaces;

    public static CurrencyCode fromString(String code) {
        if (code == null || code.trim().isEmpty()) {
            return INR;
        }
        try {
            return CurrencyCode.valueOf(code.trim().toUpperCase());
        } catch (IllegalArgumentException ex) {
            return INR;
        }
    }
}
