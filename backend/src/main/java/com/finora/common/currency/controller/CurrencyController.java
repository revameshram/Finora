package com.finora.common.currency.controller;

import com.finora.common.currency.dto.ConversionRequest;
import com.finora.common.currency.dto.ConversionResponse;
import com.finora.common.currency.dto.CurrencyMetadataDto;
import com.finora.common.currency.dto.ExchangeRatesDto;
import com.finora.common.currency.model.CurrencyCode;
import com.finora.common.currency.service.CurrencyService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.math.BigDecimal;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/v1/currencies")
@RequiredArgsConstructor
@Tag(name = "Currency Service", description = "Endpoints for live exchange rates, currency metadata, and two-way conversion")
public class CurrencyController {

    private final CurrencyService currencyService;

    @GetMapping("/supported")
    @Operation(summary = "Get list of all supported currencies with country, name, symbol, and flag")
    public ResponseEntity<List<CurrencyMetadataDto>> getSupportedCurrencies() {
        return ResponseEntity.ok(currencyService.getSupportedCurrencies());
    }

    @GetMapping("/rates")
    @Operation(summary = "Get live cached exchange rates against base currency (default: INR)")
    public ResponseEntity<ExchangeRatesDto> getExchangeRates(
            @RequestParam(name = "base", defaultValue = "INR") String baseCurrency) {
        CurrencyCode base = CurrencyCode.fromString(baseCurrency);
        return ResponseEntity.ok(currencyService.getExchangeRates(base));
    }

    @PostMapping("/convert")
    @Operation(summary = "Convert an amount between any two supported currencies")
    public ResponseEntity<ConversionResponse> convert(@Valid @RequestBody ConversionRequest request) {
        return ResponseEntity.ok(currencyService.convert(request));
    }

    @PostMapping("/to-base")
    @Operation(summary = "Convert incoming foreign amount to user base currency (INR) for database persistence")
    public ResponseEntity<Map<String, Object>> convertToBase(
            @RequestParam(name = "amount") BigDecimal amount,
            @RequestParam(name = "fromCurrency") String fromCurrency,
            @RequestParam(name = "baseCurrency", defaultValue = "INR") String baseCurrency) {

        CurrencyCode from = CurrencyCode.fromString(fromCurrency);
        CurrencyCode base = CurrencyCode.fromString(baseCurrency);

        BigDecimal baseAmount = currencyService.convertToBase(amount, from, base);
        BigDecimal rate = currencyService.getRate(from, base);

        return ResponseEntity.ok(Map.of(
                "inputAmount", amount,
                "inputCurrency", from.getCode(),
                "baseAmount", baseAmount,
                "baseCurrency", base.getCode(),
                "exchangeRate", rate,
                "formattedBase", currencyService.format(baseAmount, base)
        ));
    }
}
