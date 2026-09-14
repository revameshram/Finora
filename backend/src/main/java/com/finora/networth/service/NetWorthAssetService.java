package com.finora.networth.service;

import com.finora.common.linking.model.SourceModule;
import com.finora.networth.dto.AssetDto;
import com.finora.networth.dto.CreateAssetRequest;
import com.finora.networth.dto.UpdateAssetRequest;
import com.finora.networth.model.Asset;
import com.finora.networth.model.AssetCategory;
import com.finora.networth.repository.AssetRepository;
import com.finora.portfolio.service.AssetValuation;
import com.finora.portfolio.service.PortfolioAssetService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Slf4j
@Service
@RequiredArgsConstructor
public class NetWorthAssetService {

    private final AssetRepository assetRepository;
    private final PortfolioAssetService portfolioAssetService;

    @Transactional
    public AssetDto createAsset(String userId, CreateAssetRequest req) {
        Asset asset = Asset.builder()
                .id("ast_" + UUID.randomUUID().toString().substring(0, 8))
                .userId(userId)
                .name(req.getName())
                .category(req.getCategory())
                .value(scaleMoney(req.getValue()))
                .acquiredDate(req.getAcquiredDate())
                .growthRatePct(req.getGrowthRatePct() != null ? req.getGrowthRatePct() : BigDecimal.ZERO)
                .recurringInvestment(req.getRecurringInvestment() != null ? scaleMoney(req.getRecurringInvestment()) : BigDecimal.ZERO)
                .notes(req.getNotes())
                .isIncluded(true)
                .isLinked(false)
                .sourceModule(SourceModule.MANUAL)
                .build();

        return mapToDto(assetRepository.save(asset));
    }

    @Transactional(readOnly = true)
    public List<AssetDto> listAssets(String userId) {
        List<AssetDto> manualAssets = assetRepository.findByUserIdOrderByCreatedAtDesc(userId).stream()
                .map(this::mapToDto)
                .collect(Collectors.toList());

        List<AssetDto> linkedPortfolioAssets = collectLinkedPortfolioAssets(userId);

        List<AssetDto> combined = new ArrayList<>(manualAssets);
        combined.addAll(linkedPortfolioAssets);
        return combined;
    }

    @Transactional(readOnly = true)
    public AssetDto getAsset(String userId, String id) {
        return mapToDto(findAsset(userId, id));
    }

    @Transactional
    public AssetDto updateAsset(String userId, String id, UpdateAssetRequest req) {
        Asset asset = findAsset(userId, id);
        if (req.getName() != null) asset.setName(req.getName());
        if (req.getCategory() != null) asset.setCategory(req.getCategory());
        if (req.getValue() != null) asset.setValue(scaleMoney(req.getValue()));
        if (req.getAcquiredDate() != null) asset.setAcquiredDate(req.getAcquiredDate());
        if (req.getGrowthRatePct() != null) asset.setGrowthRatePct(req.getGrowthRatePct());
        if (req.getRecurringInvestment() != null) asset.setRecurringInvestment(scaleMoney(req.getRecurringInvestment()));
        if (req.getNotes() != null) asset.setNotes(req.getNotes());
        if (req.getIsIncluded() != null) asset.setIncluded(req.getIsIncluded());

        return mapToDto(assetRepository.save(asset));
    }

    @Transactional
    public void deleteAsset(String userId, String id) {
        Asset asset = findAsset(userId, id);
        assetRepository.delete(asset);
    }

    @Transactional
    public AssetDto delinkAsset(String userId, String id) {
        Asset asset = findAsset(userId, id);
        asset.setLinked(false);
        asset.setSourceModule(SourceModule.MANUAL);
        asset.setSourceEntityId(null);
        asset.setLinkedAt(null);
        return mapToDto(assetRepository.save(asset));
    }

    /**
     * Aggregates linked Portfolio Tracker holdings into read-only Net Worth asset DTOs.
     */
    public List<AssetDto> collectLinkedPortfolioAssets(String userId) {
        try {
            List<AssetValuation> valuations = portfolioAssetService.collectAllValuations(userId);
            return valuations.stream().map(v -> AssetDto.builder()
                    .id("pt_link_" + v.getId())
                    .name(v.getName() + " (" + v.getAssetType() + ")")
                    .category(mapPortfolioAssetCategory(v))
                    .value(v.getCurrentValue().setScale(2, RoundingMode.HALF_UP))
                    .growthRatePct(BigDecimal.ZERO) // Portfolio assets held flat in projection
                    .recurringInvestment(BigDecimal.ZERO)
                    .notes("Linked live from Portfolio Tracker")
                    .isIncluded(v.isIncluded())
                    .isLinked(true)
                    .sourceModule(SourceModule.PORTFOLIO)
                    .sourceEntityId(v.getId())
                    .linkedAt(LocalDateTime.now())
                    .build()).collect(Collectors.toList());
        } catch (Exception e) {
            log.warn("Failed to fetch linked portfolio valuations for user {}: {}", userId, e.getMessage());
            return new ArrayList<>();
        }
    }

    private AssetCategory mapPortfolioAssetCategory(AssetValuation v) {
        return switch (v.getAssetType()) {
            case STOCK, ETF, MUTUAL_FUND -> AssetCategory.INVESTMENTS;
            case DEPOSIT -> AssetCategory.CASH_BANK;
            case BOND -> AssetCategory.INVESTMENTS;
            case NPS -> AssetCategory.RETIREMENT_ACCOUNTS;
            case METAL -> AssetCategory.GOLD_SILVER;
            case REAL_ESTATE -> AssetCategory.REAL_ESTATE;
            case OTHER -> AssetCategory.OTHER;
        };
    }

    private Asset findAsset(String userId, String id) {
        return assetRepository.findByIdAndUserId(id, userId)
                .orElseThrow(() -> new IllegalArgumentException("Asset not found: " + id));
    }

    private AssetDto mapToDto(Asset a) {
        return AssetDto.builder()
                .id(a.getId())
                .name(a.getName())
                .category(a.getCategory())
                .value(a.getValue())
                .acquiredDate(a.getAcquiredDate())
                .growthRatePct(a.getGrowthRatePct())
                .recurringInvestment(a.getRecurringInvestment())
                .notes(a.getNotes())
                .isIncluded(a.isIncluded())
                .isLinked(a.isLinked())
                .sourceModule(a.getSourceModule())
                .sourceEntityId(a.getSourceEntityId())
                .linkedAt(a.getLinkedAt())
                .createdAt(a.getCreatedAt())
                .build();
    }

    private BigDecimal scaleMoney(BigDecimal val) {
        return val != null ? val.setScale(2, RoundingMode.HALF_UP) : BigDecimal.ZERO;
    }
}
