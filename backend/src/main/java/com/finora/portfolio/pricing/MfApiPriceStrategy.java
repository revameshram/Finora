package com.finora.portfolio.pricing;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import com.finora.portfolio.model.AssetType;
import com.finora.portfolio.model.Market;
import com.github.benmanes.caffeine.cache.Cache;
import com.github.benmanes.caffeine.cache.Caffeine;
import lombok.Data;
import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.web.client.RestTemplateBuilder;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpMethod;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Component;
import org.springframework.web.client.RestTemplate;

import java.math.BigDecimal;
import java.time.Duration;
import java.time.LocalDateTime;
import java.util.List;

/**
 * Multi-API Mutual Fund NAV Strategy.
 * Fetches real-time Net Asset Values from AMFI via mfapi.in endpoints,
 * cached with Caffeine (5-minute TTL) to avoid redundant requests and rate limit triggers.
 */
@Slf4j
@Component
public class MfApiPriceStrategy implements PriceProviderStrategy {

    private static final String NAV_LATEST_URL = "https://api.mfapi.in/mf/%s/latest";
    private static final String NAV_FULL_URL = "https://api.mfapi.in/mf/%s";

    private final RestTemplate restTemplate;
    
    // Caffeine cache with 5-minute TTL to prevent redundant fetching
    private final Cache<String, PriceQuote> cache = Caffeine.newBuilder()
            .expireAfterWrite(Duration.ofMinutes(5))
            .maximumSize(2000)
            .build();

    public MfApiPriceStrategy(RestTemplateBuilder restTemplateBuilder) {
        this.restTemplate = restTemplateBuilder
                .setConnectTimeout(Duration.ofSeconds(4))
                .setReadTimeout(Duration.ofSeconds(4))
                .build();
    }

    @Override
    public boolean supports(AssetType assetType, Market market) {
        return assetType == AssetType.MUTUAL_FUND;
    }

    @Override
    public PriceQuote fetchPrice(String symbolOrCode, BigDecimal fallbackPrice) {
        PriceQuote cached = cache.getIfPresent(symbolOrCode);
        if (cached != null) {
            return cached;
        }

        // Provider 1: Latest NAV endpoint
        PriceQuote quote = fetchFromLatestEndpoint(symbolOrCode);
        if (quote != null) {
            cache.put(symbolOrCode, quote);
            return quote;
        }

        // Provider 2: Full history endpoint as secondary fallback
        quote = fetchFromFullEndpoint(symbolOrCode);
        if (quote != null) {
            cache.put(symbolOrCode, quote);
            return quote;
        }

        log.warn("mfapi.in NAV fetch failed across all endpoints for scheme {}. Falling back to last-known NAV.", symbolOrCode);
        PriceQuote fallbackQuote = PriceQuote.builder()
                .price(fallbackPrice != null ? fallbackPrice : BigDecimal.ZERO)
                .live(false)
                .asOf(LocalDateTime.now())
                .source("fallback-last-known")
                .build();
        cache.put(symbolOrCode, fallbackQuote);
        return fallbackQuote;
    }

    private PriceQuote fetchFromLatestEndpoint(String schemeCode) {
        try {
            String url = String.format(NAV_LATEST_URL, schemeCode);
            HttpHeaders headers = new HttpHeaders();
            headers.set(HttpHeaders.USER_AGENT, "Mozilla/5.0 (Windows NT 10.0; Win64; x64) Finora/1.0");
            HttpEntity<Void> entity = new HttpEntity<>(headers);

            ResponseEntity<MfApiResponse> response = restTemplate.exchange(
                    url, HttpMethod.GET, entity, MfApiResponse.class);

            if (response.getBody() != null && response.getBody().getData() != null && !response.getBody().getData().isEmpty()) {
                String navStr = response.getBody().getData().get(0).getNav();
                if (navStr != null && !navStr.isBlank()) {
                    BigDecimal nav = new BigDecimal(navStr.trim());
                    return PriceQuote.builder()
                            .price(nav)
                            .live(true)
                            .asOf(LocalDateTime.now())
                            .source("mfapi.in")
                            .build();
                }
            }
        } catch (Exception ex) {
            log.debug("Primary mfapi.in latest endpoint failed for {}: {}", schemeCode, ex.getMessage());
        }
        return null;
    }

    private PriceQuote fetchFromFullEndpoint(String schemeCode) {
        try {
            String url = String.format(NAV_FULL_URL, schemeCode);
            HttpHeaders headers = new HttpHeaders();
            headers.set(HttpHeaders.USER_AGENT, "Mozilla/5.0 (Windows NT 10.0; Win64; x64) Finora/1.0");
            HttpEntity<Void> entity = new HttpEntity<>(headers);

            ResponseEntity<MfApiResponse> response = restTemplate.exchange(
                    url, HttpMethod.GET, entity, MfApiResponse.class);

            if (response.getBody() != null && response.getBody().getData() != null && !response.getBody().getData().isEmpty()) {
                String navStr = response.getBody().getData().get(0).getNav();
                if (navStr != null && !navStr.isBlank()) {
                    BigDecimal nav = new BigDecimal(navStr.trim());
                    return PriceQuote.builder()
                            .price(nav)
                            .live(true)
                            .asOf(LocalDateTime.now())
                            .source("mfapi.in-full")
                            .build();
                }
            }
        } catch (Exception ex) {
            log.debug("Secondary mfapi.in full endpoint failed for {}: {}", schemeCode, ex.getMessage());
        }
        return null;
    }

    @Data
    @JsonIgnoreProperties(ignoreUnknown = true)
    private static class MfApiResponse {
        private List<NavEntry> data;
    }

    @Data
    @JsonIgnoreProperties(ignoreUnknown = true)
    private static class NavEntry {
        private String nav;
        private String date;
    }
}
