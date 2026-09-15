package com.finora.portfolio.pricing;

import com.finora.portfolio.model.AssetType;
import com.finora.portfolio.model.Market;
import com.finora.portfolio.model.PriceSnapshot;
import com.finora.portfolio.repository.PriceSnapshotRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.UUID;

/**
 * Orchestrates the pricing layer: resolve Strategy via Factory, fetch (cached), and record the
 * daily snapshot that dashboard 1D-change / growth-chart math reads back.
 */
@Service
@RequiredArgsConstructor
public class PortfolioPricingService {

    private final PriceProviderFactory priceProviderFactory;
    private final PriceSnapshotRepository snapshotRepository;

    public PriceQuote getLivePrice(AssetType assetType, Market market, String symbolOrCode, BigDecimal fallbackPrice) {
        String resolvedSymbol = resolveSymbol(assetType, market, symbolOrCode);
        PriceProviderStrategy strategy = priceProviderFactory.resolve(assetType, market);
        return strategy.fetchPrice(resolvedSymbol, fallbackPrice);
    }

    /**
     * Applies the .NS suffix for NSE-listed stocks/ETFs; every other asset type's lookup key is
     * used as-is (US ticker, mfapi.in scheme code, or the MetalType name for the manual/static path).
     */
    private String resolveSymbol(AssetType assetType, Market market, String symbolOrCode) {
        if ((assetType == AssetType.STOCK || assetType == AssetType.ETF) && market == Market.NSE) {
            return symbolOrCode.toUpperCase() + ".NS";
        }
        return symbolOrCode;
    }

    public void recordSnapshot(String userId, String holdingId, AssetType assetType,
                                BigDecimal investedAmount, BigDecimal currentValue) {
        LocalDate today = LocalDate.now();
        PriceSnapshot snapshot = snapshotRepository.findByHoldingIdAndCapturedDate(holdingId, today)
                .orElseGet(() -> PriceSnapshot.builder()
                        .id("snap_" + UUID.randomUUID().toString().substring(0, 8))
                        .userId(userId)
                        .holdingId(holdingId)
                        .assetType(assetType)
                        .capturedDate(today)
                        .investedAmount(BigDecimal.ZERO)
                        .currentValue(BigDecimal.ZERO)
                        .build());
        snapshot.setInvestedAmount(investedAmount);
        snapshot.setCurrentValue(currentValue);
        snapshotRepository.save(snapshot);
    }
}
