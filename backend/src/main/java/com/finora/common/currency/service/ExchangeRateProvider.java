package com.finora.common.currency.service;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import com.fasterxml.jackson.annotation.JsonProperty;
import com.finora.common.currency.model.CurrencyCode;
import lombok.Data;
import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.web.client.RestTemplateBuilder;
import org.springframework.stereotype.Component;
import org.springframework.web.client.RestTemplate;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.Duration;
import java.time.Instant;
import java.time.LocalDateTime;
import java.util.Collections;
import java.util.EnumMap;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;

@Slf4j
@Component
public class ExchangeRateProvider {

    private static final String API_URL = "https://open.er-api.com/v6/latest/INR";
    private static final Duration CACHE_TTL = Duration.ofHours(1);

    private final RestTemplate restTemplate;
    
    // In-memory cache: Base Currency -> (Target Currency -> Rate)
    private final Map<CurrencyCode, Map<CurrencyCode, BigDecimal>> cachedRates = new ConcurrentHashMap<>();
    private Instant lastFetchTime = Instant.EPOCH;
    private boolean isLastFetchLive = false;

    public ExchangeRateProvider(RestTemplateBuilder restTemplateBuilder) {
        this.restTemplate = restTemplateBuilder
                .setConnectTimeout(Duration.ofSeconds(4))
                .setReadTimeout(Duration.ofSeconds(4))
                .build();
    }

    public synchronized Map<CurrencyCode, BigDecimal> getRatesForBase(CurrencyCode baseCurrency) {
        ensureCacheValid();
        Map<CurrencyCode, BigDecimal> baseRates = cachedRates.get(baseCurrency);
        if (baseRates == null) {
            baseRates = deriveRatesForBase(baseCurrency);
            cachedRates.put(baseCurrency, baseRates);
        }
        return Collections.unmodifiableMap(baseRates);
    }

    public boolean isLive() {
        return isLastFetchLive;
    }

    public LocalDateTime getLastUpdatedTime() {
        return LocalDateTime.ofInstant(lastFetchTime, java.time.ZoneId.systemDefault());
    }

    private void ensureCacheValid() {
        if (Instant.now().isAfter(lastFetchTime.plus(CACHE_TTL)) || !cachedRates.containsKey(CurrencyCode.INR)) {
            fetchLiveRates();
        }
    }

    private void fetchLiveRates() {
        try {
            log.info("Fetching live currency exchange rates from {}", API_URL);
            OpenExchangeRatesResponse response = restTemplate.getForObject(API_URL, OpenExchangeRatesResponse.class);

            if (response != null && "success".equalsIgnoreCase(response.getResult()) && response.getRates() != null) {
                Map<CurrencyCode, BigDecimal> inrRates = new EnumMap<>(CurrencyCode.class);
                inrRates.put(CurrencyCode.INR, BigDecimal.ONE);

                for (CurrencyCode code : CurrencyCode.values()) {
                    Double rateDouble = response.getRates().get(code.getCode());
                    if (rateDouble != null) {
                        inrRates.put(code, BigDecimal.valueOf(rateDouble).setScale(8, RoundingMode.HALF_UP));
                    }
                }

                // Fill any missing with fallback
                fillMissingWithFallback(inrRates, CurrencyCode.INR);

                cachedRates.clear();
                cachedRates.put(CurrencyCode.INR, inrRates);
                lastFetchTime = Instant.now();
                isLastFetchLive = true;
                log.info("Successfully fetched and cached live exchange rates for {} currencies", inrRates.size());
                return;
            }
        } catch (Exception ex) {
            log.warn("Failed to fetch live exchange rates from API: {}. Using fallback rates.", ex.getMessage());
        }

        if (!cachedRates.containsKey(CurrencyCode.INR)) {
            cachedRates.put(CurrencyCode.INR, getStaticFallbackInrRates());
            lastFetchTime = Instant.now();
            isLastFetchLive = false;
        }
    }

    private Map<CurrencyCode, BigDecimal> deriveRatesForBase(CurrencyCode targetBase) {
        Map<CurrencyCode, BigDecimal> inrRates = cachedRates.getOrDefault(CurrencyCode.INR, getStaticFallbackInrRates());
        BigDecimal inrToTarget = inrRates.getOrDefault(targetBase, BigDecimal.ONE);

        Map<CurrencyCode, BigDecimal> derived = new EnumMap<>(CurrencyCode.class);
        for (Map.Entry<CurrencyCode, BigDecimal> entry : inrRates.entrySet()) {
            CurrencyCode dest = entry.getKey();
            BigDecimal inrToDest = entry.getValue();

            // Rate from targetBase to dest = (INR -> dest) / (INR -> targetBase)
            BigDecimal rate = inrToDest.divide(inrToTarget, 8, RoundingMode.HALF_UP);
            derived.put(dest, rate);
        }
        return derived;
    }

    private Map<CurrencyCode, BigDecimal> getStaticFallbackInrRates() {
        Map<CurrencyCode, BigDecimal> fallback = new EnumMap<>(CurrencyCode.class);
        fallback.put(CurrencyCode.INR, BigDecimal.ONE);
        fallback.put(CurrencyCode.USD, new BigDecimal("0.011983")); // ~83.45 INR
        fallback.put(CurrencyCode.EUR, new BigDecimal("0.010989")); // ~91.00 INR
        fallback.put(CurrencyCode.GBP, new BigDecimal("0.009434")); // ~106.00 INR
        fallback.put(CurrencyCode.JPY, new BigDecimal("1.730100")); // ~0.58 INR
        fallback.put(CurrencyCode.AED, new BigDecimal("0.044010")); // ~22.72 INR
        fallback.put(CurrencyCode.SGD, new BigDecimal("0.015748")); // ~63.50 INR
        fallback.put(CurrencyCode.CAD, new BigDecimal("0.016393")); // ~61.00 INR
        fallback.put(CurrencyCode.AUD, new BigDecimal("0.017857")); // ~56.00 INR
        return fallback;
    }

    private void fillMissingWithFallback(Map<CurrencyCode, BigDecimal> rates, CurrencyCode base) {
        Map<CurrencyCode, BigDecimal> fallback = getStaticFallbackInrRates();
        for (CurrencyCode code : CurrencyCode.values()) {
            rates.putIfAbsent(code, fallback.getOrDefault(code, BigDecimal.ONE));
        }
    }

    @Data
    @JsonIgnoreProperties(ignoreUnknown = true)
    private static class OpenExchangeRatesResponse {
        private String result;
        @JsonProperty("rates")
        private Map<String, Double> rates;
    }
}
