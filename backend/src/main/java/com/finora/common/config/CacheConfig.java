package com.finora.common.config;

import com.github.benmanes.caffeine.cache.Caffeine;
import lombok.extern.slf4j.Slf4j;
import org.springframework.cache.CacheManager;
import org.springframework.cache.caffeine.CaffeineCacheManager;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.scheduling.annotation.Scheduled;

import java.util.concurrent.TimeUnit;

/**
 * Centralized Caffeine Caching configuration for Finora.
 * Configured with 5-minute TTL to respect external market API rate limits
 * while eliminating redundant requests across all asset valuation endpoints.
 */
@Slf4j
@Configuration
public class CacheConfig {

    public static final String STOCK_PRICES_CACHE = "stockPrices";
    public static final String MF_NAVS_CACHE = "mfNavs";
    public static final String METAL_PRICES_CACHE = "metalPrices";
    public static final String EXCHANGE_RATES_CACHE = "exchangeRates";
    public static final String SYMBOL_SEARCH_CACHE = "symbolSearch";

    @Bean
    public CacheManager cacheManager() {
        CaffeineCacheManager cacheManager = new CaffeineCacheManager(
                STOCK_PRICES_CACHE,
                MF_NAVS_CACHE,
                METAL_PRICES_CACHE,
                EXCHANGE_RATES_CACHE,
                SYMBOL_SEARCH_CACHE
        );
        cacheManager.setCaffeine(Caffeine.newBuilder()
                .expireAfterWrite(5, TimeUnit.MINUTES)
                .maximumSize(5000)
                .recordStats());
        return cacheManager;
    }

    /**
     * Heartbeat logger every 5 minutes for monitoring cache operations.
     */
    @Scheduled(fixedRate = 300000) // 5 minutes
    public void reportCacheHeartbeat() {
        log.debug("Caffeine 5-minute cache refresh cycle active: preserving API quota across asset classes.");
    }
}
