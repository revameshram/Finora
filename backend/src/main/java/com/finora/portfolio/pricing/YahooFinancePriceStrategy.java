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
 * Multi-API Stock & ETF Pricing Strategy.
 * Features:
 * 1. Primary: Yahoo Finance Chart v8 (query1) with browser User-Agent headers.
 * 2. Secondary: Yahoo Finance query2 endpoint.
 * 3. Fallback: Last-known price marked non-live.
 * 4. Caffeine Cache: 5-minute TTL to respect rate limits and eliminate redundant calls.
 */
@Slf4j
@Component
public class YahooFinancePriceStrategy implements PriceProviderStrategy {

    private static final String YAHOO_URL_QUERY1 = "https://query1.finance.yahoo.com/v8/finance/chart/%s";
    private static final String YAHOO_URL_QUERY2 = "https://query2.finance.yahoo.com/v8/finance/chart/%s";

    private final RestTemplate restTemplate;
    
    // Caffeine cache with 5-minute TTL
    private final Cache<String, PriceQuote> cache = Caffeine.newBuilder()
            .expireAfterWrite(Duration.ofMinutes(5))
            .maximumSize(3000)
            .build();

    public YahooFinancePriceStrategy(RestTemplateBuilder restTemplateBuilder) {
        this.restTemplate = restTemplateBuilder
                .setConnectTimeout(Duration.ofSeconds(4))
                .setReadTimeout(Duration.ofSeconds(4))
                .build();
    }

    @Override
    public boolean supports(AssetType assetType, Market market) {
        return assetType == AssetType.STOCK || assetType == AssetType.ETF;
    }

    @Override
    public PriceQuote fetchPrice(String symbolOrCode, BigDecimal fallbackPrice) {
        PriceQuote cached = cache.getIfPresent(symbolOrCode);
        if (cached != null) {
            return cached;
        }

        // Provider 1: Yahoo Finance query1 endpoint
        PriceQuote quote = fetchFromYahoo(String.format(YAHOO_URL_QUERY1, symbolOrCode), "yahoo-finance-q1");
        if (quote != null) {
            cache.put(symbolOrCode, quote);
            return quote;
        }

        // Provider 2: Yahoo Finance query2 endpoint
        quote = fetchFromYahoo(String.format(YAHOO_URL_QUERY2, symbolOrCode), "yahoo-finance-q2");
        if (quote != null) {
            cache.put(symbolOrCode, quote);
            return quote;
        }

        // Fallback: Last known price
        log.warn("All live stock price APIs failed for {}. Falling back to last-known price.", symbolOrCode);
        PriceQuote fallbackQuote = PriceQuote.builder()
                .price(fallbackPrice != null ? fallbackPrice : BigDecimal.ZERO)
                .live(false)
                .asOf(LocalDateTime.now())
                .source("fallback-last-known")
                .build();
        cache.put(symbolOrCode, fallbackQuote);
        return fallbackQuote;
    }

    private PriceQuote fetchFromYahoo(String url, String sourceTag) {
        try {
            HttpHeaders headers = new HttpHeaders();
            headers.set(HttpHeaders.USER_AGENT, "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36");
            headers.set(HttpHeaders.ACCEPT, "application/json, text/plain, */*");
            headers.set(HttpHeaders.ACCEPT_LANGUAGE, "en-US,en;q=0.9");
            HttpEntity<Void> entity = new HttpEntity<>(headers);

            ResponseEntity<YahooChartResponse> response = restTemplate.exchange(
                    url, HttpMethod.GET, entity, YahooChartResponse.class);

            BigDecimal price = extractPrice(response.getBody());
            if (price != null && price.compareTo(BigDecimal.ZERO) > 0) {
                return PriceQuote.builder()
                        .price(price)
                        .live(true)
                        .asOf(LocalDateTime.now())
                        .source(sourceTag)
                        .build();
            }
        } catch (Exception ex) {
            log.debug("Yahoo endpoint {} failed: {}", url, ex.getMessage());
        }
        return null;
    }

    private BigDecimal extractPrice(YahooChartResponse response) {
        if (response == null || response.getChart() == null || response.getChart().getResult() == null) {
            return null;
        }
        List<Result> results = response.getChart().getResult();
        if (results.isEmpty() || results.get(0).getMeta() == null) {
            return null;
        }
        Double price = results.get(0).getMeta().getRegularMarketPrice();
        return price != null ? BigDecimal.valueOf(price) : null;
    }

    @Data
    @JsonIgnoreProperties(ignoreUnknown = true)
    private static class YahooChartResponse {
        private Chart chart;
    }

    @Data
    @JsonIgnoreProperties(ignoreUnknown = true)
    private static class Chart {
        private List<Result> result;
    }

    @Data
    @JsonIgnoreProperties(ignoreUnknown = true)
    private static class Result {
        private Meta meta;
    }

    @Data
    @JsonIgnoreProperties(ignoreUnknown = true)
    private static class Meta {
        private Double regularMarketPrice;
    }
}
