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
 * Mutual funds, via mfapi.in's free scheme-NAV endpoint, keyed by scheme code.
 */
@Slf4j
@Component
public class MfApiPriceStrategy implements PriceProviderStrategy {

    private static final String NAV_URL = "https://api.mfapi.in/mf/%s/latest";

    private final RestTemplate restTemplate;
    private final Cache<String, PriceQuote> cache = Caffeine.newBuilder()
            .expireAfterWrite(Duration.ofMinutes(10))
            .maximumSize(1000)
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

        try {
            String url = String.format(NAV_URL, symbolOrCode);
            MfApiResponse response = restTemplate.getForObject(url, MfApiResponse.class);
            if (response == null || response.getData() == null || response.getData().isEmpty()) {
                throw new IllegalStateException("Empty mfapi.in response for scheme " + symbolOrCode);
            }
            BigDecimal nav = new BigDecimal(response.getData().get(0).getNav());

            PriceQuote quote = PriceQuote.builder()
                    .price(nav)
                    .live(true)
                    .asOf(LocalDateTime.now())
                    .source("mfapi.in")
                    .build();
            cache.put(symbolOrCode, quote);
            return quote;
        } catch (Exception ex) {
            log.warn("mfapi.in NAV fetch failed for scheme {}: {}. Falling back to last-known NAV.",
                    symbolOrCode, ex.getMessage());
            return PriceQuote.builder()
                    .price(fallbackPrice != null ? fallbackPrice : BigDecimal.ZERO)
                    .live(false)
                    .asOf(LocalDateTime.now())
                    .source("fallback-last-known")
                    .build();
        }
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
