package com.finora.portfolio.pricing;

import com.finora.portfolio.model.AssetType;
import com.finora.portfolio.model.Market;
import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import com.github.benmanes.caffeine.cache.Cache;
import com.github.benmanes.caffeine.cache.Caffeine;
import lombok.Data;
import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.web.client.RestTemplateBuilder;
import org.springframework.stereotype.Component;
import org.springframework.web.client.RestTemplate;

import java.math.BigDecimal;
import java.time.Duration;
import java.time.LocalDateTime;
import java.util.List;

/**
 * Stocks + ETFs, both markets (Indian symbols carry the .NS suffix, applied by the caller before
 * this strategy ever sees the symbol — see PortfolioPricingService.resolveSymbol). Caffeine-cached
 * with a short TTL to avoid rate-limiting live lookups, per §6.7.
 */
@Slf4j
@Component
public class YahooFinancePriceStrategy implements PriceProviderStrategy {

    private static final String QUOTE_URL = "https://query1.finance.yahoo.com/v8/finance/chart/%s";

    private final RestTemplate restTemplate;
    private final Cache<String, PriceQuote> cache = Caffeine.newBuilder()
            .expireAfterWrite(Duration.ofMinutes(5))
            .maximumSize(1000)
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

        try {
            String url = String.format(QUOTE_URL, symbolOrCode);
            YahooChartResponse response = restTemplate.getForObject(url, YahooChartResponse.class);
            BigDecimal price = extractPrice(response);
            if (price == null) {
                throw new IllegalStateException("No regularMarketPrice in Yahoo response for " + symbolOrCode);
            }

            PriceQuote quote = PriceQuote.builder()
                    .price(price)
                    .live(true)
                    .asOf(LocalDateTime.now())
                    .source("yahoo-finance")
                    .build();
            cache.put(symbolOrCode, quote);
            return quote;
        } catch (Exception ex) {
            log.warn("Yahoo Finance price fetch failed for {}: {}. Falling back to last-known price.",
                    symbolOrCode, ex.getMessage());
            return PriceQuote.builder()
                    .price(fallbackPrice != null ? fallbackPrice : BigDecimal.ZERO)
                    .live(false)
                    .asOf(LocalDateTime.now())
                    .source("fallback-last-known")
                    .build();
        }
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
