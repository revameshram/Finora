package com.finora.common.currency.service;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import com.fasterxml.jackson.annotation.JsonProperty;
import com.finora.common.currency.model.CurrencyCode;
import com.github.benmanes.caffeine.cache.Cache;
import com.github.benmanes.caffeine.cache.Caffeine;
import lombok.Data;
import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.web.client.RestTemplateBuilder;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpMethod;
import org.springframework.http.ResponseEntity;
import org.springframework.scheduling.annotation.Scheduled;
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

/**
 * Multi-API Exchange Rate Provider with Caffeine 5-minute caching & fallback resilience.
 * Fetches real-time foreign exchange rates for all supported currencies.
 */
@Slf4j
@Component
public class ExchangeRateProvider {

    private static final String API_PRIMARY = "https://open.er-api.com/v6/latest/INR";
    private static final String API_FALLBACK_1 = "https://api.frankfurter.dev/v1/latest?base=INR";
    private static final String API_FALLBACK_2 = "https://api.exchangerate.fun/latest";

    private final RestTemplate restTemplate;

    // Caffeine cache with 5-minute TTL to respect rate limits and prevent redundant calls
    private final Cache<CurrencyCode, Map<CurrencyCode, BigDecimal>> rateCache = Caffeine.newBuilder()
            .expireAfterWrite(Duration.ofMinutes(5))
            .maximumSize(50)
            .build();

    private Instant lastFetchTime = Instant.EPOCH;
    private boolean isLastFetchLive = false;

    public ExchangeRateProvider(RestTemplateBuilder restTemplateBuilder) {
        this.restTemplate = restTemplateBuilder
                .setConnectTimeout(Duration.ofSeconds(4))
                .setReadTimeout(Duration.ofSeconds(4))
                .build();
    }

    public synchronized Map<CurrencyCode, BigDecimal> getRatesForBase(CurrencyCode baseCurrency) {
        Map<CurrencyCode, BigDecimal> cached = rateCache.getIfPresent(baseCurrency);
        if (cached != null) {
            return cached;
        }

        Map<CurrencyCode, BigDecimal> inrRates = rateCache.getIfPresent(CurrencyCode.INR);
        if (inrRates == null) {
            inrRates = fetchLiveRates();
            rateCache.put(CurrencyCode.INR, inrRates);
        }

        if (baseCurrency == CurrencyCode.INR) {
            return Collections.unmodifiableMap(inrRates);
        }

        Map<CurrencyCode, BigDecimal> derived = deriveRatesForBase(inrRates, baseCurrency);
        rateCache.put(baseCurrency, derived);
        return Collections.unmodifiableMap(derived);
    }

    public boolean isLive() {
        return isLastFetchLive;
    }

    public LocalDateTime getLastUpdatedTime() {
        return LocalDateTime.ofInstant(lastFetchTime, java.time.ZoneId.systemDefault());
    }

    /**
     * Proactively refresh exchange rates every 5 minutes in the background.
     */
    @Scheduled(fixedRate = 300000, initialDelay = 10000)
    public void scheduledRateRefresh() {
        try {
            Map<CurrencyCode, BigDecimal> freshRates = fetchLiveRates();
            rateCache.invalidateAll();
            rateCache.put(CurrencyCode.INR, freshRates);
            log.debug("Proactive 5-minute exchange rate refresh completed successfully.");
        } catch (Exception e) {
            log.warn("Scheduled exchange rate refresh failed: {}", e.getMessage());
        }
    }

    private Map<CurrencyCode, BigDecimal> fetchLiveRates() {
        // Attempt 1: Open Exchange Rates API
        try {
            log.debug("Fetching exchange rates from primary API: {}", API_PRIMARY);
            HttpHeaders headers = new HttpHeaders();
            headers.set(HttpHeaders.USER_AGENT, "Finora-Personal-Finance/1.0");
            HttpEntity<Void> entity = new HttpEntity<>(headers);

            ResponseEntity<OpenExchangeRatesResponse> resp = restTemplate.exchange(
                    API_PRIMARY, HttpMethod.GET, entity, OpenExchangeRatesResponse.class);

            if (resp.getBody() != null && "success".equalsIgnoreCase(resp.getBody().getResult()) && resp.getBody().getRates() != null) {
                Map<CurrencyCode, BigDecimal> inrRates = new EnumMap<>(CurrencyCode.class);
                inrRates.put(CurrencyCode.INR, BigDecimal.ONE);

                for (CurrencyCode code : CurrencyCode.values()) {
                    Double rateDouble = resp.getBody().getRates().get(code.getCode());
                    if (rateDouble != null) {
                        inrRates.put(code, BigDecimal.valueOf(rateDouble).setScale(8, RoundingMode.HALF_UP));
                    }
                }
                fillMissingWithFallback(inrRates);
                lastFetchTime = Instant.now();
                isLastFetchLive = true;
                return inrRates;
            }
        } catch (Exception ex) {
            log.warn("Primary exchange rate API failed: {}. Trying fallback provider 1...", ex.getMessage());
        }

        // Attempt 2: Frankfurter ECB API
        try {
            log.debug("Fetching exchange rates from fallback API 1: {}", API_FALLBACK_1);
            FrankfurterResponse resp = restTemplate.getForObject(API_FALLBACK_1, FrankfurterResponse.class);
            if (resp != null && resp.getRates() != null) {
                Map<CurrencyCode, BigDecimal> inrRates = new EnumMap<>(CurrencyCode.class);
                inrRates.put(CurrencyCode.INR, BigDecimal.ONE);

                for (CurrencyCode code : CurrencyCode.values()) {
                    Double rate = resp.getRates().get(code.getCode());
                    if (rate != null) {
                        inrRates.put(code, BigDecimal.valueOf(rate).setScale(8, RoundingMode.HALF_UP));
                    }
                }
                fillMissingWithFallback(inrRates);
                lastFetchTime = Instant.now();
                isLastFetchLive = true;
                return inrRates;
            }
        } catch (Exception ex) {
            log.warn("Fallback exchange rate API 1 failed: {}. Trying fallback provider 2...", ex.getMessage());
        }

        // Attempt 3: FreeExchangeRateApi
        try {
            log.debug("Fetching exchange rates from fallback API 2: {}", API_FALLBACK_2);
            FreeExchangeResponse resp = restTemplate.getForObject(API_FALLBACK_2, FreeExchangeResponse.class);
            if (resp != null && resp.getRates() != null && resp.getRates().containsKey("INR")) {
                Double inrBase = resp.getRates().get("INR");
                if (inrBase != null && inrBase > 0) {
                    Map<CurrencyCode, BigDecimal> inrRates = new EnumMap<>(CurrencyCode.class);
                    inrRates.put(CurrencyCode.INR, BigDecimal.ONE);

                    for (CurrencyCode code : CurrencyCode.values()) {
                        Double rateAgainstUsd = resp.getRates().get(code.getCode());
                        if (rateAgainstUsd != null) {
                            BigDecimal inrRate = BigDecimal.valueOf(rateAgainstUsd / inrBase).setScale(8, RoundingMode.HALF_UP);
                            inrRates.put(code, inrRate);
                        }
                    }
                    fillMissingWithFallback(inrRates);
                    lastFetchTime = Instant.now();
                    isLastFetchLive = true;
                    return inrRates;
                }
            }
        } catch (Exception ex) {
            log.warn("Fallback exchange rate API 2 failed: {}. Using static benchmark rates.", ex.getMessage());
        }

        // Last resort: Static realistic fallback rates
        Map<CurrencyCode, BigDecimal> fallback = getStaticFallbackInrRates();
        lastFetchTime = Instant.now();
        isLastFetchLive = false;
        return fallback;
    }

    private Map<CurrencyCode, BigDecimal> deriveRatesForBase(Map<CurrencyCode, BigDecimal> inrRates, CurrencyCode targetBase) {
        BigDecimal inrToTarget = inrRates.getOrDefault(targetBase, BigDecimal.ONE);
        Map<CurrencyCode, BigDecimal> derived = new EnumMap<>(CurrencyCode.class);

        for (Map.Entry<CurrencyCode, BigDecimal> entry : inrRates.entrySet()) {
            CurrencyCode dest = entry.getKey();
            BigDecimal inrToDest = entry.getValue();
            BigDecimal rate = inrToDest.divide(inrToTarget, 8, RoundingMode.HALF_UP);
            derived.put(dest, rate);
        }
        return derived;
    }

    private Map<CurrencyCode, BigDecimal> getStaticFallbackInrRates() {
        Map<CurrencyCode, BigDecimal> fallback = new EnumMap<>(CurrencyCode.class);
        fallback.put(CurrencyCode.INR, BigDecimal.ONE);
        fallback.put(CurrencyCode.USD, new BigDecimal("0.011850")); // ~84.38 INR
        fallback.put(CurrencyCode.EUR, new BigDecimal("0.010850")); // ~92.16 INR
        fallback.put(CurrencyCode.GBP, new BigDecimal("0.009250")); // ~108.10 INR
        fallback.put(CurrencyCode.JPY, new BigDecimal("1.785000")); // ~0.56 INR
        fallback.put(CurrencyCode.AED, new BigDecimal("0.043500")); // ~22.98 INR
        fallback.put(CurrencyCode.SGD, new BigDecimal("0.015600")); // ~64.10 INR
        fallback.put(CurrencyCode.CAD, new BigDecimal("0.016100")); // ~62.11 INR
        fallback.put(CurrencyCode.AUD, new BigDecimal("0.017700")); // ~56.49 INR
        return fallback;
    }

    private void fillMissingWithFallback(Map<CurrencyCode, BigDecimal> rates) {
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

    @Data
    @JsonIgnoreProperties(ignoreUnknown = true)
    private static class FrankfurterResponse {
        private Map<String, Double> rates;
    }

    @Data
    @JsonIgnoreProperties(ignoreUnknown = true)
    private static class FreeExchangeResponse {
        private Map<String, Double> rates;
    }
}
