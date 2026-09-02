package com.finora.common.currency.service;

import com.finora.common.currency.dto.ConversionRequest;
import com.finora.common.currency.dto.ConversionResponse;
import com.finora.common.currency.dto.CurrencyMetadataDto;
import com.finora.common.currency.dto.ExchangeRatesDto;
import com.finora.common.currency.model.CurrencyCode;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.text.NumberFormat;
import java.time.LocalDateTime;
import java.util.*;
import java.util.stream.Collectors;

@Slf4j
@Service
@RequiredArgsConstructor
public class CurrencyService {

    private final ExchangeRateProvider rateProvider;

    public List<CurrencyMetadataDto> getSupportedCurrencies() {
        return Arrays.stream(CurrencyCode.values())
                .map(CurrencyMetadataDto::fromEnum)
                .collect(Collectors.toList());
    }

    public ExchangeRatesDto getExchangeRates(CurrencyCode baseCurrency) {
        Map<CurrencyCode, BigDecimal> ratesMap = rateProvider.getRatesForBase(baseCurrency);
        Map<String, BigDecimal> stringRatesMap = new LinkedHashMap<>();

        for (Map.Entry<CurrencyCode, BigDecimal> entry : ratesMap.entrySet()) {
            stringRatesMap.put(entry.getKey().getCode(), entry.getValue());
        }

        return ExchangeRatesDto.builder()
                .baseCurrency(baseCurrency.getCode())
                .rates(stringRatesMap)
                .lastUpdated(rateProvider.getLastUpdatedTime())
                .isLive(rateProvider.isLive())
                .build();
    }

    public ConversionResponse convert(ConversionRequest request) {
        CurrencyCode from = CurrencyCode.fromString(request.getFromCurrency());
        CurrencyCode to = CurrencyCode.fromString(request.getToCurrency());
        BigDecimal amount = request.getAmount();

        BigDecimal rate = getRate(from, to);
        BigDecimal convertedAmount = amount.multiply(rate).setScale(to.getDecimalPlaces(), RoundingMode.HALF_UP);

        return ConversionResponse.builder()
                .originalAmount(amount)
                .fromCurrency(CurrencyMetadataDto.fromEnum(from))
                .convertedAmount(convertedAmount)
                .toCurrency(CurrencyMetadataDto.fromEnum(to))
                .exchangeRate(rate)
                .formattedOriginal(format(amount, from))
                .formattedConverted(format(convertedAmount, to))
                .timestamp(LocalDateTime.now())
                .build();
    }

    /**
     * Converts a foreign input amount to the user's base currency (e.g. INR) for database storage.
     */
    public BigDecimal convertToBase(BigDecimal foreignAmount, CurrencyCode sourceCurrency, CurrencyCode baseCurrency) {
        if (foreignAmount == null) {
            return BigDecimal.ZERO;
        }
        if (sourceCurrency == baseCurrency) {
            return foreignAmount.setScale(baseCurrency.getDecimalPlaces(), RoundingMode.HALF_UP);
        }
        BigDecimal rate = getRate(sourceCurrency, baseCurrency);
        return foreignAmount.multiply(rate).setScale(baseCurrency.getDecimalPlaces(), RoundingMode.HALF_UP);
    }

    /**
     * Converts a database-stored base currency amount (e.g. INR) to a display target currency.
     */
    public BigDecimal convertFromBase(BigDecimal baseAmount, CurrencyCode baseCurrency, CurrencyCode targetCurrency) {
        if (baseAmount == null) {
            return BigDecimal.ZERO;
        }
        if (baseCurrency == targetCurrency) {
            return baseAmount.setScale(targetCurrency.getDecimalPlaces(), RoundingMode.HALF_UP);
        }
        BigDecimal rate = getRate(baseCurrency, targetCurrency);
        return baseAmount.multiply(rate).setScale(targetCurrency.getDecimalPlaces(), RoundingMode.HALF_UP);
    }

    public BigDecimal getRate(CurrencyCode from, CurrencyCode to) {
        if (from == to) {
            return BigDecimal.ONE;
        }
        Map<CurrencyCode, BigDecimal> ratesForFrom = rateProvider.getRatesForBase(from);
        return ratesForFrom.getOrDefault(to, BigDecimal.ONE);
    }

    public String format(BigDecimal amount, CurrencyCode currency) {
        if (amount == null) {
            amount = BigDecimal.ZERO;
        }
        if (currency == CurrencyCode.INR) {
            return formatInr(amount);
        }

        NumberFormat format = NumberFormat.getCurrencyInstance(Locale.US);
        format.setGroupingUsed(true);
        format.setMaximumFractionDigits(currency.getDecimalPlaces());
        format.setMinimumFractionDigits(currency.getDecimalPlaces());
        return currency.getSymbol() + " " + String.format(Locale.US, "%,." + currency.getDecimalPlaces() + "f", amount);
    }

    private String formatInr(BigDecimal amount) {
        // Indian number formatting: e.g. 1,50,000.00
        BigDecimal scaled = amount.setScale(2, RoundingMode.HALF_UP);
        long wholePart = scaled.longValue();
        int fractionPart = scaled.remainder(BigDecimal.ONE).movePointRight(2).abs().intValue();

        StringBuilder sb = new StringBuilder();
        String wholeStr = String.valueOf(Math.abs(wholePart));

        if (wholeStr.length() <= 3) {
            sb.append(wholeStr);
        } else {
            String lastThree = wholeStr.substring(wholeStr.length() - 3);
            String remaining = wholeStr.substring(0, wholeStr.length() - 3);

            StringBuilder remFormatted = new StringBuilder();
            for (int i = 0; i < remaining.length(); i++) {
                if (i > 0 && (remaining.length() - i) % 2 == 0) {
                    remFormatted.append(",");
                }
                remFormatted.append(remaining.charAt(i));
            }
            sb.append(remFormatted).append(",").append(lastThree);
        }

        String sign = amount.compareTo(BigDecimal.ZERO) < 0 ? "-" : "";
        return sign + "₹" + sb + String.format(".%02d", fractionPart);
    }
}
