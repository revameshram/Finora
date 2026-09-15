package com.finora.portfolio.pricing;

import com.finora.portfolio.model.AssetType;
import com.finora.portfolio.model.Market;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Component;

import java.util.List;

/**
 * Factory keyed on asset_type (+ market), resolving to the one Strategy bean that supports it.
 */
@Component
@RequiredArgsConstructor
public class PriceProviderFactory {

    private final List<PriceProviderStrategy> strategies;

    public PriceProviderStrategy resolve(AssetType assetType, Market market) {
        return strategies.stream()
                .filter(s -> s.supports(assetType, market))
                .findFirst()
                .orElseThrow(() -> new IllegalStateException(
                        "No price provider strategy registered for asset type " + assetType));
    }
}
