package com.finora.portfolio.pricing;

import com.finora.portfolio.model.AssetType;
import com.finora.portfolio.model.Market;

import java.math.BigDecimal;

/**
 * One live-price Strategy per asset type (Master Reference §6.7: "Strategy+Factory+Caffeine
 * pricing-layer design"). Each strategy owns its own resolution logic and caching; the Factory
 * just picks the right one.
 */
public interface PriceProviderStrategy {

    boolean supports(AssetType assetType, Market market);

    /**
     * @param symbolOrCode    fully-resolved lookup key (e.g. "RELIANCE.NS", a mfapi.in scheme code)
     * @param fallbackPrice   the holding's last-known price, returned (marked non-live) on fetch failure
     */
    PriceQuote fetchPrice(String symbolOrCode, BigDecimal fallbackPrice);
}
