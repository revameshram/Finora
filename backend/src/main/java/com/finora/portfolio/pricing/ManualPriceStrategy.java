package com.finora.portfolio.pricing;

import com.finora.portfolio.model.AssetType;
import com.finora.portfolio.model.Market;
import org.springframework.stereotype.Component;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.Set;

/**
 * NPS/Deposits/Bonds/Real Estate/Others: no live source, just echoes back the holding's own
 * stored value. Exists so PriceProviderFactory has one uniform lookup path for every asset type.
 */
@Component
public class ManualPriceStrategy implements PriceProviderStrategy {

    private static final Set<AssetType> MANUAL_TYPES = Set.of(
            AssetType.NPS, AssetType.DEPOSIT, AssetType.BOND, AssetType.REAL_ESTATE, AssetType.OTHER);

    @Override
    public boolean supports(AssetType assetType, Market market) {
        return MANUAL_TYPES.contains(assetType);
    }

    @Override
    public PriceQuote fetchPrice(String symbolOrCode, BigDecimal fallbackPrice) {
        return PriceQuote.builder()
                .price(fallbackPrice != null ? fallbackPrice : BigDecimal.ZERO)
                .live(false)
                .asOf(LocalDateTime.now())
                .source("manual")
                .build();
    }
}
