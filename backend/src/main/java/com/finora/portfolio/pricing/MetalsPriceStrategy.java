package com.finora.portfolio.pricing;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import com.finora.common.currency.model.CurrencyCode;
import com.finora.common.currency.service.ExchangeRateProvider;
import com.finora.portfolio.model.AssetType;
import com.finora.portfolio.model.Market;
import com.finora.portfolio.model.MetalType;
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
import java.math.RoundingMode;
import java.time.Duration;
import java.time.LocalDateTime;
import java.util.EnumMap;
import java.util.Map;

/**
 * Multi-API Live Metals Pricing Strategy (Gold, Silver, Platinum).
 * Fetches real-time spot commodity prices in USD/oz and converts to INR/gram
 * using live exchange rates, with 5-minute Caffeine caching to prevent quota exhaustion.
 */
@Slf4j
@Component
public class MetalsPriceStrategy implements PriceProviderStrategy {

    private static final String GOLD_API_URL = "https://api.gold-api.com/price/%s";
    private static final String GOLDPRICE_ORG_URL = "https://data-asg.goldprice.org/dbXRates/INR";
    private static final BigDecimal TROY_OZ_TO_GRAMS = new BigDecimal("31.1034768");

    private final RestTemplate restTemplate;
    private final ExchangeRateProvider exchangeRateProvider;

    // Caffeine cache with 5-minute TTL
    private final Cache<String, PriceQuote> cache = Caffeine.newBuilder()
            .expireAfterWrite(Duration.ofMinutes(5))
            .maximumSize(100)
            .build();

    public MetalsPriceStrategy(RestTemplateBuilder restTemplateBuilder, ExchangeRateProvider exchangeRateProvider) {
        this.restTemplate = restTemplateBuilder
                .setConnectTimeout(Duration.ofSeconds(4))
                .setReadTimeout(Duration.ofSeconds(4))
                .build();
        this.exchangeRateProvider = exchangeRateProvider;
    }

    @Override
    public boolean supports(AssetType assetType, Market market) {
        return assetType == AssetType.METAL;
    }

    @Override
    public PriceQuote fetchPrice(String symbolOrCode, BigDecimal fallbackPrice) {
        PriceQuote cached = cache.getIfPresent(symbolOrCode);
        if (cached != null) {
            return cached;
        }

        MetalType metalType;
        try {
            metalType = MetalType.valueOf(symbolOrCode.toUpperCase());
        } catch (Exception e) {
            metalType = MetalType.GOLD;
        }

        // Provider 1: api.gold-api.com (Live spot commodity feed)
        PriceQuote quote = fetchFromGoldApi(metalType);
        if (quote != null) {
            cache.put(symbolOrCode, quote);
            return quote;
        }

        // Provider 2: goldprice.org INR spot feed
        quote = fetchFromGoldPriceOrg(metalType);
        if (quote != null) {
            cache.put(symbolOrCode, quote);
            return quote;
        }

        // Fallback: Last known price or realistic benchmark table
        log.warn("All live metals APIs failed for {}. Using realistic benchmark rates.", metalType);
        BigDecimal fallbackRate = staticFallbackPerGramInr().get(metalType);
        if (fallbackRate == null) {
            fallbackRate = fallbackPrice != null && fallbackPrice.compareTo(BigDecimal.ZERO) > 0
                    ? fallbackPrice : new BigDecimal("7500.00");
        }

        PriceQuote fallbackQuote = PriceQuote.builder()
                .price(fallbackRate)
                .live(false)
                .asOf(LocalDateTime.now())
                .source("static-benchmark-rate")
                .build();
        cache.put(symbolOrCode, fallbackQuote);
        return fallbackQuote;
    }

    private PriceQuote fetchFromGoldApi(MetalType metalType) {
        try {
            String symbol = switch (metalType) {
                case GOLD -> "XAU";
                case SILVER -> "XAG";
                case PLATINUM -> "XPT";
            };

            String url = String.format(GOLD_API_URL, symbol);
            HttpHeaders headers = new HttpHeaders();
            headers.set(HttpHeaders.USER_AGENT, "Mozilla/5.0 (Windows NT 10.0; Win64; x64) Finora/1.0");
            HttpEntity<Void> entity = new HttpEntity<>(headers);

            ResponseEntity<GoldApiResponse> response = restTemplate.exchange(
                    url, HttpMethod.GET, entity, GoldApiResponse.class);

            if (response.getBody() != null && response.getBody().getPrice() != null && response.getBody().getPrice() > 0) {
                BigDecimal usdPerTroyOz = BigDecimal.valueOf(response.getBody().getPrice());
                
                // Get live USD to INR rate (e.g. 84.50)
                BigDecimal usdToInrRate = getUsdToInrRate();
                
                // Price per gram INR = (USD_per_oz * USD_to_INR) / 31.1034768
                BigDecimal pricePerGramInr = usdPerTroyOz.multiply(usdToInrRate)
                        .divide(TROY_OZ_TO_GRAMS, 2, RoundingMode.HALF_UP);

                return PriceQuote.builder()
                        .price(pricePerGramInr)
                        .live(true)
                        .asOf(LocalDateTime.now())
                        .source("gold-api.com")
                        .build();
            }
        } catch (Exception ex) {
            log.debug("Primary Gold API fetch failed for {}: {}", metalType, ex.getMessage());
        }
        return null;
    }

    private PriceQuote fetchFromGoldPriceOrg(MetalType metalType) {
        try {
            HttpHeaders headers = new HttpHeaders();
            headers.set(HttpHeaders.USER_AGENT, "Mozilla/5.0 (Windows NT 10.0; Win64; x64) Finora/1.0");
            HttpEntity<Void> entity = new HttpEntity<>(headers);

            ResponseEntity<GoldPriceOrgResponse> response = restTemplate.exchange(
                    GOLDPRICE_ORG_URL, HttpMethod.GET, entity, GoldPriceOrgResponse.class);

            if (response.getBody() != null && response.getBody().getItems() != null && !response.getBody().getItems().isEmpty()) {
                GoldPriceOrgItem item = response.getBody().getItems().get(0);
                Double inrPerOz = metalType == MetalType.SILVER ? item.getXagPrice() : item.getXauPrice();

                if (inrPerOz != null && inrPerOz > 0) {
                    BigDecimal inrTotal = BigDecimal.valueOf(inrPerOz);
                    BigDecimal pricePerGramInr = inrTotal.divide(TROY_OZ_TO_GRAMS, 2, RoundingMode.HALF_UP);

                    return PriceQuote.builder()
                            .price(pricePerGramInr)
                            .live(true)
                            .asOf(LocalDateTime.now())
                            .source("goldprice.org")
                            .build();
                }
            }
        } catch (Exception ex) {
            log.debug("Secondary Goldprice.org fetch failed for {}: {}", metalType, ex.getMessage());
        }
        return null;
    }

    private BigDecimal getUsdToInrRate() {
        try {
            Map<CurrencyCode, BigDecimal> inrRates = exchangeRateProvider.getRatesForBase(CurrencyCode.INR);
            BigDecimal usdRateAgainstInr = inrRates.get(CurrencyCode.USD);
            if (usdRateAgainstInr != null && usdRateAgainstInr.compareTo(BigDecimal.ZERO) > 0) {
                // 1 INR = usdRate USD -> 1 USD = 1 / usdRate INR
                return BigDecimal.ONE.divide(usdRateAgainstInr, 4, RoundingMode.HALF_UP);
            }
        } catch (Exception e) {
            log.debug("Could not determine live USD/INR exchange rate for metal conversion, using 84.50: {}", e.getMessage());
        }
        return new BigDecimal("84.50");
    }

    private Map<MetalType, BigDecimal> staticFallbackPerGramInr() {
        Map<MetalType, BigDecimal> rates = new EnumMap<>(MetalType.class);
        rates.put(MetalType.GOLD, new BigDecimal("7550.00").setScale(2, RoundingMode.HALF_UP)); // 24K gold per gram
        rates.put(MetalType.SILVER, new BigDecimal("95.50").setScale(2, RoundingMode.HALF_UP));
        rates.put(MetalType.PLATINUM, new BigDecimal("3250.00").setScale(2, RoundingMode.HALF_UP));
        return rates;
    }

    @Data
    @JsonIgnoreProperties(ignoreUnknown = true)
    private static class GoldApiResponse {
        private String symbol;
        private String name;
        private Double price;
        private String updatedAt;
    }

    @Data
    @JsonIgnoreProperties(ignoreUnknown = true)
    private static class GoldPriceOrgResponse {
        private java.util.List<GoldPriceOrgItem> items;
    }

    @Data
    @JsonIgnoreProperties(ignoreUnknown = true)
    private static class GoldPriceOrgItem {
        private Double xauPrice;
        private Double xagPrice;
    }
}
