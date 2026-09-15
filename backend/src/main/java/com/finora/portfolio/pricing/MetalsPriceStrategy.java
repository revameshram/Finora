package com.finora.portfolio.pricing;

import com.finora.portfolio.model.AssetType;
import com.finora.portfolio.model.Market;
import com.finora.portfolio.model.MetalType;
import com.github.benmanes.caffeine.cache.Cache;
import com.github.benmanes.caffeine.cache.Caffeine;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Component;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.Duration;
import java.time.LocalDateTime;
import java.util.EnumMap;
import java.util.Map;

/**
 * Gold/Silver/Platinum spot price per gram (INR). No free, key-less, reliably-uptime metals-spot
 * API exists to depend on for an MVP, so this strategy is intentionally fallback-first: it always
 * serves from a static approximate-rate table (same resilience posture as
 * ExchangeRateProvider.getStaticFallbackInrRates()), clearly marked non-live. Swap in a real paid
 * feed here when one is provisioned — the Strategy/Factory seam is already in place for it.
 */
@Slf4j
@Component
public class MetalsPriceStrategy implements PriceProviderStrategy {

    private final Cache<String, PriceQuote> cache = Caffeine.newBuilder()
            .expireAfterWrite(Duration.ofMinutes(10))
            .maximumSize(10)
            .build();

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

        BigDecimal rate = staticFallbackPerGramInr().get(MetalType.valueOf(symbolOrCode));
        if (rate == null) {
            rate = fallbackPrice != null ? fallbackPrice : BigDecimal.ZERO;
        }

        PriceQuote quote = PriceQuote.builder()
                .price(rate)
                .live(false)
                .asOf(LocalDateTime.now())
                .source("static-approximate-rate")
                .build();
        cache.put(symbolOrCode, quote);
        return quote;
    }

    private Map<MetalType, BigDecimal> staticFallbackPerGramInr() {
        Map<MetalType, BigDecimal> rates = new EnumMap<>(MetalType.class);
        rates.put(MetalType.GOLD, new BigDecimal("7200.00").setScale(2, RoundingMode.HALF_UP)); // ~24K, approx
        rates.put(MetalType.SILVER, new BigDecimal("92.00").setScale(2, RoundingMode.HALF_UP));
        rates.put(MetalType.PLATINUM, new BigDecimal("3100.00").setScale(2, RoundingMode.HALF_UP));
        return rates;
    }
}
