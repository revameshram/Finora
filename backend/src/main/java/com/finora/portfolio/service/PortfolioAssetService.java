package com.finora.portfolio.service;

import com.finora.common.linking.model.SourceModule;
import com.finora.portfolio.dto.*;
import com.finora.portfolio.model.*;
import com.finora.portfolio.pricing.PortfolioPricingService;
import com.finora.portfolio.pricing.PriceQuote;
import com.finora.portfolio.repository.*;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.*;
import java.util.stream.Collectors;

/**
 * CRUD across all 9 Portfolio Tracker asset-type tables (§6.5/§6.7), plus the universal
 * "live price as purchase price" / inline live-price conventions (§2.4/§6.6), symbol search,
 * the cross-module summary read, and the sample-data seeder.
 */
@Slf4j
@Service
@RequiredArgsConstructor
public class PortfolioAssetService {

    private final StockHoldingRepository stockHoldingRepository;
    private final EtfHoldingRepository etfHoldingRepository;
    private final MutualFundHoldingRepository mutualFundHoldingRepository;
    private final NpsHoldingRepository npsHoldingRepository;
    private final NpsSchemeAllocationRepository npsSchemeAllocationRepository;
    private final DepositRepository depositRepository;
    private final BondRepository bondRepository;
    private final MetalHoldingRepository metalHoldingRepository;
    private final RealEstateRepository realEstateRepository;
    private final OtherInstrumentRepository otherInstrumentRepository;
    private final OtherInstrumentCategoryMixRepository categoryMixRepository;
    private final PortfolioPricingService pricingService;

    private static final BigDecimal HUNDRED = BigDecimal.valueOf(100);
    private static final BigDecimal PCT_TOLERANCE = new BigDecimal("0.1");

    // ==================================================================
    // Stocks
    // ==================================================================

    @Transactional
    public StockHoldingDto createStock(String userId, CreateStockHoldingRequest req) {
        PriceQuote quote = pricingService.getLivePrice(AssetType.STOCK, req.getMarket(), req.getTicker(), req.getCostPerUnit());
        BigDecimal costPerUnit = req.isUseLivePriceAsPurchasePrice() || req.getCostPerUnit() == null
                ? quote.getPrice() : req.getCostPerUnit();
        costPerUnit = nonNull(costPerUnit);

        StockHolding holding = StockHolding.builder()
                .id(genId("pt_stk"))
                .userId(userId)
                .name(req.getTicker().toUpperCase())
                .ticker(req.getTicker().toUpperCase())
                .market(req.getMarket())
                .quantity(scaleQty(req.getQuantity()))
                .avgCostPerUnit(scaleMoney(costPerUnit))
                .investedAmount(scaleMoney(req.getQuantity().multiply(costPerUnit)))
                .currentPrice(scaleMoney(quote.getPrice()))
                .lastPriceUpdate(quote.getAsOf())
                .priceIsLive(quote.isLive())
                .build();
        applyManualLinkDefaults(holding);

        return mapStock(stockHoldingRepository.save(holding));
    }

    @Transactional(readOnly = true)
    public List<StockHoldingDto> listStocks(String userId) {
        return stockHoldingRepository.findByUserIdOrderByCreatedAtDesc(userId).stream()
                .map(this::mapStock).collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public StockHoldingDto getStock(String userId, String id) {
        return mapStock(findStock(userId, id));
    }

    @Transactional
    public StockHoldingDto updateStock(String userId, String id, UpdateStockHoldingRequest req) {
        StockHolding holding = findStock(userId, id);
        if (req.getTicker() != null) {
            holding.setTicker(req.getTicker().toUpperCase());
            holding.setName(req.getTicker().toUpperCase());
        }
        if (req.getQuantity() != null) holding.setQuantity(scaleQty(req.getQuantity()));
        if (req.getAvgCostPerUnit() != null) {
            holding.setAvgCostPerUnit(scaleMoney(req.getAvgCostPerUnit()));
            holding.setInvestedAmount(scaleMoney(holding.getQuantity().multiply(holding.getAvgCostPerUnit())));
        }
        return mapStock(stockHoldingRepository.save(holding));
    }

    @Transactional
    public StockHoldingDto addSharesToStock(String userId, String id, AddSharesRequest req) {
        StockHolding holding = findStock(userId, id);
        PriceQuote quote = pricingService.getLivePrice(AssetType.STOCK, holding.getMarket(), holding.getTicker(), req.getCostPerUnit());
        BigDecimal newCost = req.isUseLivePriceAsPurchasePrice() || req.getCostPerUnit() == null
                ? quote.getPrice() : req.getCostPerUnit();
        newCost = nonNull(newCost);

        BigDecimal oldQty = holding.getQuantity();
        BigDecimal oldInvested = holding.getInvestedAmount();
        BigDecimal newQty = oldQty.add(req.getQuantity());
        BigDecimal newInvested = oldInvested.add(req.getQuantity().multiply(newCost));
        BigDecimal newAvgCost = newQty.compareTo(BigDecimal.ZERO) == 0
                ? BigDecimal.ZERO : newInvested.divide(newQty, 4, RoundingMode.HALF_UP);

        holding.setQuantity(scaleQty(newQty));
        holding.setInvestedAmount(scaleMoney(newInvested));
        holding.setAvgCostPerUnit(scaleMoney(newAvgCost));
        holding.setCurrentPrice(scaleMoney(quote.getPrice()));
        holding.setLastPriceUpdate(quote.getAsOf());
        holding.setPriceIsLive(quote.isLive());

        return mapStock(stockHoldingRepository.save(holding));
    }

    @Transactional
    public void deleteStock(String userId, String id) {
        stockHoldingRepository.delete(findStock(userId, id));
    }

    private StockHolding findStock(String userId, String id) {
        return stockHoldingRepository.findByIdAndUserId(id, userId)
                .orElseThrow(() -> new IllegalArgumentException("Stock holding not found: " + id));
    }

    private StockHoldingDto mapStock(StockHolding h) {
        BigDecimal currentValue = scaleMoney(h.getQuantity().multiply(h.getCurrentPrice()));
        BigDecimal gainLoss = currentValue.subtract(h.getInvestedAmount());
        return StockHoldingDto.builder()
                .id(h.getId()).name(h.getName()).ticker(h.getTicker()).market(h.getMarket())
                .quantity(h.getQuantity()).avgCostPerUnit(h.getAvgCostPerUnit()).investedAmount(h.getInvestedAmount())
                .currentPrice(h.getCurrentPrice()).isLive(h.isPriceIsLive()).livePriceAsOf(h.getLastPriceUpdate())
                .currentValue(currentValue).gainLoss(gainLoss).gainLossPct(pct(h.getInvestedAmount(), gainLoss))
                .isIncluded(h.isIncluded()).createdAt(h.getCreatedAt())
                .build();
    }

    // ==================================================================
    // ETFs
    // ==================================================================

    @Transactional
    public EtfHoldingDto createEtf(String userId, CreateEtfHoldingRequest req) {
        PriceQuote quote = pricingService.getLivePrice(AssetType.ETF, req.getMarket(), req.getTicker(), req.getCostPerUnit());
        BigDecimal costPerUnit = req.isUseLivePriceAsPurchasePrice() || req.getCostPerUnit() == null
                ? quote.getPrice() : req.getCostPerUnit();
        costPerUnit = nonNull(costPerUnit);

        EtfHolding holding = EtfHolding.builder()
                .id(genId("pt_etf"))
                .userId(userId)
                .name(req.getTicker().toUpperCase())
                .ticker(req.getTicker().toUpperCase())
                .market(req.getMarket())
                .quantity(scaleQty(req.getQuantity()))
                .avgCostPerUnit(scaleMoney(costPerUnit))
                .investedAmount(scaleMoney(req.getQuantity().multiply(costPerUnit)))
                .currentPrice(scaleMoney(quote.getPrice()))
                .lastPriceUpdate(quote.getAsOf())
                .priceIsLive(quote.isLive())
                .build();
        applyManualLinkDefaults(holding);

        return mapEtf(etfHoldingRepository.save(holding));
    }

    @Transactional(readOnly = true)
    public List<EtfHoldingDto> listEtfs(String userId) {
        return etfHoldingRepository.findByUserIdOrderByCreatedAtDesc(userId).stream()
                .map(this::mapEtf).collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public EtfHoldingDto getEtf(String userId, String id) {
        return mapEtf(findEtf(userId, id));
    }

    @Transactional
    public EtfHoldingDto updateEtf(String userId, String id, UpdateEtfHoldingRequest req) {
        EtfHolding holding = findEtf(userId, id);
        if (req.getTicker() != null) {
            holding.setTicker(req.getTicker().toUpperCase());
            holding.setName(req.getTicker().toUpperCase());
        }
        if (req.getQuantity() != null) holding.setQuantity(scaleQty(req.getQuantity()));
        if (req.getAvgCostPerUnit() != null) {
            holding.setAvgCostPerUnit(scaleMoney(req.getAvgCostPerUnit()));
            holding.setInvestedAmount(scaleMoney(holding.getQuantity().multiply(holding.getAvgCostPerUnit())));
        }
        return mapEtf(etfHoldingRepository.save(holding));
    }

    @Transactional
    public EtfHoldingDto addSharesToEtf(String userId, String id, AddSharesRequest req) {
        EtfHolding holding = findEtf(userId, id);
        PriceQuote quote = pricingService.getLivePrice(AssetType.ETF, holding.getMarket(), holding.getTicker(), req.getCostPerUnit());
        BigDecimal newCost = req.isUseLivePriceAsPurchasePrice() || req.getCostPerUnit() == null
                ? quote.getPrice() : req.getCostPerUnit();
        newCost = nonNull(newCost);

        BigDecimal oldQty = holding.getQuantity();
        BigDecimal oldInvested = holding.getInvestedAmount();
        BigDecimal newQty = oldQty.add(req.getQuantity());
        BigDecimal newInvested = oldInvested.add(req.getQuantity().multiply(newCost));
        BigDecimal newAvgCost = newQty.compareTo(BigDecimal.ZERO) == 0
                ? BigDecimal.ZERO : newInvested.divide(newQty, 4, RoundingMode.HALF_UP);

        holding.setQuantity(scaleQty(newQty));
        holding.setInvestedAmount(scaleMoney(newInvested));
        holding.setAvgCostPerUnit(scaleMoney(newAvgCost));
        holding.setCurrentPrice(scaleMoney(quote.getPrice()));
        holding.setLastPriceUpdate(quote.getAsOf());
        holding.setPriceIsLive(quote.isLive());

        return mapEtf(etfHoldingRepository.save(holding));
    }

    @Transactional
    public void deleteEtf(String userId, String id) {
        etfHoldingRepository.delete(findEtf(userId, id));
    }

    private EtfHolding findEtf(String userId, String id) {
        return etfHoldingRepository.findByIdAndUserId(id, userId)
                .orElseThrow(() -> new IllegalArgumentException("ETF holding not found: " + id));
    }

    private EtfHoldingDto mapEtf(EtfHolding h) {
        BigDecimal currentValue = scaleMoney(h.getQuantity().multiply(h.getCurrentPrice()));
        BigDecimal gainLoss = currentValue.subtract(h.getInvestedAmount());
        return EtfHoldingDto.builder()
                .id(h.getId()).name(h.getName()).ticker(h.getTicker()).market(h.getMarket())
                .quantity(h.getQuantity()).avgCostPerUnit(h.getAvgCostPerUnit()).investedAmount(h.getInvestedAmount())
                .currentPrice(h.getCurrentPrice()).isLive(h.isPriceIsLive()).livePriceAsOf(h.getLastPriceUpdate())
                .currentValue(currentValue).gainLoss(gainLoss).gainLossPct(pct(h.getInvestedAmount(), gainLoss))
                .isIncluded(h.isIncluded()).createdAt(h.getCreatedAt())
                .build();
    }

    // ==================================================================
    // Mutual Funds
    // ==================================================================

    @Transactional
    public MutualFundHoldingDto createMutualFund(String userId, CreateMutualFundHoldingRequest req) {
        PriceQuote quote = pricingService.getLivePrice(AssetType.MUTUAL_FUND, null, req.getSchemeCode(), req.getNavPerUnit());
        BigDecimal navPerUnit = req.isUseLivePriceAsPurchasePrice() || req.getNavPerUnit() == null
                ? quote.getPrice() : req.getNavPerUnit();
        navPerUnit = nonNull(navPerUnit);

        MutualFundHolding holding = MutualFundHolding.builder()
                .id(genId("pt_mf"))
                .userId(userId)
                .name(req.getSchemeName())
                .schemeCode(req.getSchemeCode())
                .schemeName(req.getSchemeName())
                .category(req.getCategory())
                .capitalisation(req.getCapitalisation())
                .units(scaleQty(req.getUnits()))
                .avgNav(scaleMoney(navPerUnit))
                .investedAmount(scaleMoney(req.getUnits().multiply(navPerUnit)))
                .currentNav(scaleMoney(quote.getPrice()))
                .lastPriceUpdate(quote.getAsOf())
                .priceIsLive(quote.isLive())
                .build();
        applyManualLinkDefaults(holding);

        return mapMutualFund(mutualFundHoldingRepository.save(holding));
    }

    @Transactional(readOnly = true)
    public List<MutualFundHoldingDto> listMutualFunds(String userId) {
        return mutualFundHoldingRepository.findByUserIdOrderByCreatedAtDesc(userId).stream()
                .map(this::mapMutualFund).collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public MutualFundHoldingDto getMutualFund(String userId, String id) {
        return mapMutualFund(findMutualFund(userId, id));
    }

    @Transactional
    public MutualFundHoldingDto updateMutualFund(String userId, String id, UpdateMutualFundHoldingRequest req) {
        MutualFundHolding holding = findMutualFund(userId, id);
        if (req.getSchemeName() != null) { holding.setSchemeName(req.getSchemeName()); holding.setName(req.getSchemeName()); }
        if (req.getCategory() != null) holding.setCategory(req.getCategory());
        if (req.getCapitalisation() != null) holding.setCapitalisation(req.getCapitalisation());
        if (req.getUnits() != null) holding.setUnits(scaleQty(req.getUnits()));
        if (req.getAvgNav() != null) {
            holding.setAvgNav(scaleMoney(req.getAvgNav()));
            holding.setInvestedAmount(scaleMoney(holding.getUnits().multiply(holding.getAvgNav())));
        }
        return mapMutualFund(mutualFundHoldingRepository.save(holding));
    }

    @Transactional
    public void deleteMutualFund(String userId, String id) {
        mutualFundHoldingRepository.delete(findMutualFund(userId, id));
    }

    private MutualFundHolding findMutualFund(String userId, String id) {
        return mutualFundHoldingRepository.findByIdAndUserId(id, userId)
                .orElseThrow(() -> new IllegalArgumentException("Mutual fund holding not found: " + id));
    }

    private MutualFundHoldingDto mapMutualFund(MutualFundHolding h) {
        BigDecimal currentValue = scaleMoney(h.getUnits().multiply(h.getCurrentNav()));
        BigDecimal gainLoss = currentValue.subtract(h.getInvestedAmount());
        return MutualFundHoldingDto.builder()
                .id(h.getId()).schemeCode(h.getSchemeCode()).schemeName(h.getSchemeName())
                .category(h.getCategory()).capitalisation(h.getCapitalisation())
                .units(h.getUnits()).avgNav(h.getAvgNav()).investedAmount(h.getInvestedAmount())
                .currentNav(h.getCurrentNav()).isLive(h.isPriceIsLive()).livePriceAsOf(h.getLastPriceUpdate())
                .currentValue(currentValue).gainLoss(gainLoss).gainLossPct(pct(h.getInvestedAmount(), gainLoss))
                .isIncluded(h.isIncluded()).createdAt(h.getCreatedAt())
                .build();
    }

    // ==================================================================
    // NPS/UPS
    // ==================================================================

    @Transactional
    public NpsHoldingDto createNps(String userId, CreateNpsHoldingRequest req) {
        BigDecimal navPerUnit = nonNull(req.getCurrentNav() != null ? req.getCurrentNav() : req.getAvgNav());

        NpsHolding holding = NpsHolding.builder()
                .id(genId("pt_nps"))
                .userId(userId)
                .name(req.getPensionFundManager() != null ? "NPS - " + req.getPensionFundManager() : "NPS")
                .pensionFundManager(req.getPensionFundManager())
                .units(scaleQty(req.getUnits()))
                .avgNav(scaleMoney(req.getAvgNav()))
                .investedAmount(scaleMoney(req.getUnits().multiply(req.getAvgNav())))
                .currentNav(scaleMoney(navPerUnit))
                .lastPriceUpdate(LocalDateTime.now())
                .build();
        applyManualLinkDefaults(holding);
        NpsHolding saved = npsHoldingRepository.save(holding);

        NpsSchemeAllocation allocation = buildValidatedAllocation(saved.getId(),
                req.getEquityPct(), req.getCorporateDebtPct(), req.getGovernmentSecuritiesPct(), req.getAlternativePct());
        npsSchemeAllocationRepository.save(allocation);

        return mapNps(saved, allocation);
    }

    @Transactional(readOnly = true)
    public List<NpsHoldingDto> listNps(String userId) {
        return npsHoldingRepository.findByUserIdOrderByCreatedAtDesc(userId).stream()
                .map(h -> mapNps(h, npsSchemeAllocationRepository.findByNpsHoldingId(h.getId()).orElse(null)))
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public NpsHoldingDto getNps(String userId, String id) {
        NpsHolding h = findNps(userId, id);
        return mapNps(h, npsSchemeAllocationRepository.findByNpsHoldingId(h.getId()).orElse(null));
    }

    @Transactional
    public NpsHoldingDto updateNps(String userId, String id, UpdateNpsHoldingRequest req) {
        NpsHolding holding = findNps(userId, id);
        if (req.getPensionFundManager() != null) holding.setPensionFundManager(req.getPensionFundManager());
        if (req.getUnits() != null) holding.setUnits(scaleQty(req.getUnits()));
        if (req.getAvgNav() != null) holding.setAvgNav(scaleMoney(req.getAvgNav()));
        if (req.getUnits() != null || req.getAvgNav() != null) {
            holding.setInvestedAmount(scaleMoney(holding.getUnits().multiply(holding.getAvgNav())));
        }
        if (req.getCurrentNav() != null) {
            holding.setCurrentNav(scaleMoney(req.getCurrentNav()));
            holding.setLastPriceUpdate(LocalDateTime.now());
        }
        NpsHolding saved = npsHoldingRepository.save(holding);

        NpsSchemeAllocation allocation = npsSchemeAllocationRepository.findByNpsHoldingId(id).orElse(null);
        if (req.getEquityPct() != null || req.getCorporateDebtPct() != null
                || req.getGovernmentSecuritiesPct() != null || req.getAlternativePct() != null) {
            allocation = buildValidatedAllocation(id,
                    req.getEquityPct() != null ? req.getEquityPct() : safe(allocation, NpsSchemeAllocation::getEquityPct),
                    req.getCorporateDebtPct() != null ? req.getCorporateDebtPct() : safe(allocation, NpsSchemeAllocation::getCorporateDebtPct),
                    req.getGovernmentSecuritiesPct() != null ? req.getGovernmentSecuritiesPct() : safe(allocation, NpsSchemeAllocation::getGovernmentSecuritiesPct),
                    req.getAlternativePct() != null ? req.getAlternativePct() : safe(allocation, NpsSchemeAllocation::getAlternativePct));
            allocation = npsSchemeAllocationRepository.save(allocation);
        }

        return mapNps(saved, allocation);
    }

    @Transactional
    public void deleteNps(String userId, String id) {
        NpsHolding holding = findNps(userId, id);
        npsSchemeAllocationRepository.findByNpsHoldingId(id).ifPresent(npsSchemeAllocationRepository::delete);
        npsHoldingRepository.delete(holding);
    }

    private NpsHolding findNps(String userId, String id) {
        return npsHoldingRepository.findByIdAndUserId(id, userId)
                .orElseThrow(() -> new IllegalArgumentException("NPS holding not found: " + id));
    }

    private BigDecimal safe(NpsSchemeAllocation a, java.util.function.Function<NpsSchemeAllocation, BigDecimal> getter) {
        return a == null ? BigDecimal.ZERO : getter.apply(a);
    }

    private NpsSchemeAllocation buildValidatedAllocation(String npsHoldingId, BigDecimal equity, BigDecimal debt,
                                                           BigDecimal gsec, BigDecimal alt) {
        equity = nonNull(equity); debt = nonNull(debt); gsec = nonNull(gsec); alt = nonNull(alt);
        BigDecimal sum = equity.add(debt).add(gsec).add(alt);
        if (sum.compareTo(BigDecimal.ZERO) != 0 && sum.subtract(HUNDRED).abs().compareTo(PCT_TOLERANCE) > 0) {
            throw new IllegalArgumentException("NPS scheme allocation must sum to 100% (got " + sum + "%)");
        }
        NpsSchemeAllocation existing = npsSchemeAllocationRepository.findByNpsHoldingId(npsHoldingId).orElse(null);
        return NpsSchemeAllocation.builder()
                .id(existing != null ? existing.getId() : genId("pt_npsalloc"))
                .npsHoldingId(npsHoldingId)
                .equityPct(equity).corporateDebtPct(debt).governmentSecuritiesPct(gsec).alternativePct(alt)
                .build();
    }

    private NpsHoldingDto mapNps(NpsHolding h, NpsSchemeAllocation a) {
        BigDecimal currentValue = scaleMoney(h.getUnits().multiply(h.getCurrentNav()));
        BigDecimal gainLoss = currentValue.subtract(h.getInvestedAmount());
        return NpsHoldingDto.builder()
                .id(h.getId()).pensionFundManager(h.getPensionFundManager())
                .units(h.getUnits()).avgNav(h.getAvgNav()).investedAmount(h.getInvestedAmount())
                .currentNav(h.getCurrentNav()).currentValue(currentValue)
                .gainLoss(gainLoss).gainLossPct(pct(h.getInvestedAmount(), gainLoss))
                .equityPct(a != null ? a.getEquityPct() : BigDecimal.ZERO)
                .corporateDebtPct(a != null ? a.getCorporateDebtPct() : BigDecimal.ZERO)
                .governmentSecuritiesPct(a != null ? a.getGovernmentSecuritiesPct() : BigDecimal.ZERO)
                .alternativePct(a != null ? a.getAlternativePct() : BigDecimal.ZERO)
                .isIncluded(h.isIncluded()).createdAt(h.getCreatedAt())
                .build();
    }

    // ==================================================================
    // Deposits (FD/RD)
    // ==================================================================

    @Transactional
    public DepositDto createDeposit(String userId, CreateDepositRequest req) {
        Deposit deposit = Deposit.builder()
                .id(genId("pt_dep"))
                .userId(userId)
                .name((req.getBankName() != null ? req.getBankName() + " " : "") + req.getDepositType())
                .depositType(req.getDepositType())
                .bankName(req.getBankName())
                .principalAmount(scaleMoney(req.getPrincipalAmount()))
                .interestRatePct(req.getInterestRatePct())
                .startDate(req.getStartDate())
                .maturityDate(req.getMaturityDate())
                .compoundingFrequency(req.getCompoundingFrequency())
                .status(DepositStatus.ACTIVE)
                .build();
        applyManualLinkDefaults(deposit);
        return mapDeposit(depositRepository.save(deposit));
    }

    @Transactional(readOnly = true)
    public List<DepositDto> listDeposits(String userId) {
        return depositRepository.findByUserIdOrderByCreatedAtDesc(userId).stream()
                .map(this::mapDeposit).collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public DepositDto getDeposit(String userId, String id) {
        return mapDeposit(findDeposit(userId, id));
    }

    @Transactional
    public DepositDto updateDeposit(String userId, String id, UpdateDepositRequest req) {
        Deposit deposit = findDeposit(userId, id);
        if (req.getBankName() != null) deposit.setBankName(req.getBankName());
        if (req.getInterestRatePct() != null) deposit.setInterestRatePct(req.getInterestRatePct());
        if (req.getMaturityDate() != null) deposit.setMaturityDate(req.getMaturityDate());
        if (req.getStatus() != null) deposit.setStatus(req.getStatus());
        return mapDeposit(depositRepository.save(deposit));
    }

    @Transactional
    public void deleteDeposit(String userId, String id) {
        depositRepository.delete(findDeposit(userId, id));
    }

    @Transactional(readOnly = true)
    public List<DepositScheduleEntryDto> getDepositSchedule(String userId, String id) {
        return buildDepositSchedule(findDeposit(userId, id));
    }

    private Deposit findDeposit(String userId, String id) {
        return depositRepository.findByIdAndUserId(id, userId)
                .orElseThrow(() -> new IllegalArgumentException("Deposit not found: " + id));
    }

    private DepositDto mapDeposit(Deposit d) {
        BigDecimal currentValue = computeDepositCurrentValue(d);
        BigDecimal maturityValue = computeDepositValueAt(d, d.getMaturityDate());
        return DepositDto.builder()
                .id(d.getId()).depositType(d.getDepositType()).bankName(d.getBankName())
                .principalAmount(d.getPrincipalAmount()).interestRatePct(d.getInterestRatePct())
                .startDate(d.getStartDate()).maturityDate(d.getMaturityDate())
                .compoundingFrequency(d.getCompoundingFrequency()).status(d.getStatus())
                .currentValue(currentValue).maturityValue(maturityValue)
                .isIncluded(d.isIncluded()).createdAt(d.getCreatedAt())
                .build();
    }

    private BigDecimal computeDepositCurrentValue(Deposit d) {
        LocalDate asOf = LocalDate.now().isAfter(d.getMaturityDate()) ? d.getMaturityDate() : LocalDate.now();
        return computeDepositValueAt(d, asOf);
    }

    private BigDecimal computeDepositValueAt(Deposit d, LocalDate asOf) {
        if (asOf.isBefore(d.getStartDate())) return d.getPrincipalAmount();
        long days = java.time.temporal.ChronoUnit.DAYS.between(d.getStartDate(), asOf);
        double years = days / 365.0;
        int n = periodsPerYear(d.getCompoundingFrequency());
        double r = d.getInterestRatePct().doubleValue() / 100.0;
        double amount = d.getPrincipalAmount().doubleValue() * Math.pow(1 + r / n, n * years);
        return BigDecimal.valueOf(amount).setScale(2, RoundingMode.HALF_UP);
    }

    private List<DepositScheduleEntryDto> buildDepositSchedule(Deposit d) {
        List<DepositScheduleEntryDto> rows = new ArrayList<>();
        LocalDate cursor = d.getStartDate();
        LocalDate today = LocalDate.now();
        boolean first = true;
        while (!cursor.isAfter(d.getMaturityDate())) {
            BigDecimal capital = d.getPrincipalAmount();
            BigDecimal deposit = first ? d.getPrincipalAmount() : BigDecimal.ZERO;
            BigDecimal earnedInterest = computeDepositValueAt(d, cursor).subtract(d.getPrincipalAmount());
            String status = cursor.isAfter(today) ? "Upcoming" : (cursor.equals(d.getMaturityDate()) ? "Realized" : "Paid");
            rows.add(DepositScheduleEntryDto.builder()
                    .date(cursor).deposit(deposit).earnedInterest(earnedInterest).capital(capital).status(status)
                    .build());
            if (cursor.equals(d.getMaturityDate())) break;
            LocalDate next = advance(cursor, d.getCompoundingFrequency());
            cursor = next.isAfter(d.getMaturityDate()) ? d.getMaturityDate() : next;
            first = false;
        }
        return rows;
    }

    // ==================================================================
    // Bonds
    // ==================================================================

    @Transactional
    public BondDto createBond(String userId, CreateBondRequest req) {
        Bond bond = Bond.builder()
                .id(genId("pt_bnd"))
                .userId(userId)
                .name(req.getName())
                .issuer(req.getIssuer())
                .faceValue(scaleMoney(req.getFaceValue()))
                .couponRatePct(req.getCouponRatePct())
                .couponFrequency(req.getCouponFrequency())
                .issueDate(req.getIssueDate())
                .maturityDate(req.getMaturityDate())
                .purchasePrice(scaleMoney(req.getPurchasePrice()))
                .currentPrice(req.getCurrentPrice() != null ? scaleMoney(req.getCurrentPrice()) : scaleMoney(req.getPurchasePrice()))
                .status(BondStatus.ACTIVE)
                .build();
        applyManualLinkDefaults(bond);
        return mapBond(bondRepository.save(bond));
    }

    @Transactional(readOnly = true)
    public List<BondDto> listBonds(String userId) {
        return bondRepository.findByUserIdOrderByCreatedAtDesc(userId).stream()
                .map(this::mapBond).collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public BondDto getBond(String userId, String id) {
        return mapBond(findBond(userId, id));
    }

    @Transactional
    public BondDto updateBond(String userId, String id, UpdateBondRequest req) {
        Bond bond = findBond(userId, id);
        if (req.getCurrentPrice() != null) bond.setCurrentPrice(scaleMoney(req.getCurrentPrice()));
        if (req.getStatus() != null) bond.setStatus(req.getStatus());
        return mapBond(bondRepository.save(bond));
    }

    @Transactional
    public void deleteBond(String userId, String id) {
        bondRepository.delete(findBond(userId, id));
    }

    @Transactional(readOnly = true)
    public List<BondScheduleEntryDto> getBondSchedule(String userId, String id) {
        return buildBondSchedule(findBond(userId, id));
    }

    private Bond findBond(String userId, String id) {
        return bondRepository.findByIdAndUserId(id, userId)
                .orElseThrow(() -> new IllegalArgumentException("Bond not found: " + id));
    }

    private BondDto mapBond(Bond b) {
        BigDecimal currentValue = b.getCurrentPrice() != null ? b.getCurrentPrice() : b.getPurchasePrice();
        BigDecimal gainLoss = currentValue.subtract(b.getPurchasePrice());
        return BondDto.builder()
                .id(b.getId()).name(b.getName()).issuer(b.getIssuer()).faceValue(b.getFaceValue())
                .couponRatePct(b.getCouponRatePct()).couponFrequency(b.getCouponFrequency())
                .issueDate(b.getIssueDate()).maturityDate(b.getMaturityDate())
                .purchasePrice(b.getPurchasePrice()).currentPrice(b.getCurrentPrice()).status(b.getStatus())
                .currentValue(currentValue).gainLoss(gainLoss).gainLossPct(pct(b.getPurchasePrice(), gainLoss))
                .isIncluded(b.isIncluded()).createdAt(b.getCreatedAt())
                .build();
    }

    private List<BondScheduleEntryDto> buildBondSchedule(Bond b) {
        List<BondScheduleEntryDto> rows = new ArrayList<>();
        int periodsPerYear = periodsPerYear(b.getCouponFrequency());
        BigDecimal couponAmount = b.getFaceValue().multiply(b.getCouponRatePct())
                .divide(HUNDRED, 6, RoundingMode.HALF_UP)
                .divide(BigDecimal.valueOf(periodsPerYear), 2, RoundingMode.HALF_UP);
        LocalDate today = LocalDate.now();
        LocalDate cursor = advance(b.getIssueDate(), b.getCouponFrequency());
        while (!cursor.isAfter(b.getMaturityDate())) {
            boolean isMaturity = !advance(cursor, b.getCouponFrequency()).isBefore(b.getMaturityDate());
            BigDecimal payout = isMaturity ? couponAmount.add(b.getFaceValue()) : couponAmount;
            String status = cursor.isAfter(today) ? "Upcoming" : (isMaturity ? "Realized" : "Paid");
            rows.add(BondScheduleEntryDto.builder()
                    .date(cursor).coupon(couponAmount).capital(b.getFaceValue()).payout(payout).status(status)
                    .build());
            if (isMaturity) break;
            cursor = advance(cursor, b.getCouponFrequency());
        }
        return rows;
    }

    // ==================================================================
    // Metals
    // ==================================================================

    @Transactional
    public MetalHoldingDto createMetal(String userId, CreateMetalHoldingRequest req) {
        PriceQuote quote = pricingService.getLivePrice(AssetType.METAL, null, req.getMetalType().name(), req.getCostPerGram());
        BigDecimal costPerGram = req.isUseLivePriceAsPurchasePrice() || req.getCostPerGram() == null
                ? quote.getPrice() : req.getCostPerGram();
        costPerGram = nonNull(costPerGram);

        MetalHolding holding = MetalHolding.builder()
                .id(genId("pt_metal"))
                .userId(userId)
                .name(req.getMetalType() + (req.getPurityKarat() != null ? " " + req.getPurityKarat() + "K" : ""))
                .metalType(req.getMetalType())
                .purityKarat(req.getPurityKarat())
                .quantityGrams(scaleQty(req.getQuantityGrams()))
                .avgCostPerGram(scaleMoney(costPerGram))
                .investedAmount(scaleMoney(req.getQuantityGrams().multiply(costPerGram)))
                .currentPricePerGram(scaleMoney(quote.getPrice()))
                .lastPriceUpdate(quote.getAsOf())
                .priceIsLive(quote.isLive())
                .build();
        applyManualLinkDefaults(holding);

        return mapMetal(metalHoldingRepository.save(holding));
    }

    @Transactional(readOnly = true)
    public List<MetalHoldingDto> listMetals(String userId) {
        return metalHoldingRepository.findByUserIdOrderByCreatedAtDesc(userId).stream()
                .map(this::mapMetal).collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public MetalHoldingDto getMetal(String userId, String id) {
        return mapMetal(findMetal(userId, id));
    }

    @Transactional
    public MetalHoldingDto updateMetal(String userId, String id, UpdateMetalHoldingRequest req) {
        MetalHolding holding = findMetal(userId, id);
        if (req.getPurityKarat() != null) holding.setPurityKarat(req.getPurityKarat());
        if (req.getQuantityGrams() != null) holding.setQuantityGrams(scaleQty(req.getQuantityGrams()));
        if (req.getAvgCostPerGram() != null) {
            holding.setAvgCostPerGram(scaleMoney(req.getAvgCostPerGram()));
            holding.setInvestedAmount(scaleMoney(holding.getQuantityGrams().multiply(holding.getAvgCostPerGram())));
        }
        return mapMetal(metalHoldingRepository.save(holding));
    }

    @Transactional
    public void deleteMetal(String userId, String id) {
        metalHoldingRepository.delete(findMetal(userId, id));
    }

    private MetalHolding findMetal(String userId, String id) {
        return metalHoldingRepository.findByIdAndUserId(id, userId)
                .orElseThrow(() -> new IllegalArgumentException("Metal holding not found: " + id));
    }

    private MetalHoldingDto mapMetal(MetalHolding h) {
        BigDecimal currentValue = scaleMoney(h.getQuantityGrams().multiply(h.getCurrentPricePerGram()));
        BigDecimal gainLoss = currentValue.subtract(h.getInvestedAmount());
        return MetalHoldingDto.builder()
                .id(h.getId()).metalType(h.getMetalType()).purityKarat(h.getPurityKarat())
                .quantityGrams(h.getQuantityGrams()).avgCostPerGram(h.getAvgCostPerGram())
                .investedAmount(h.getInvestedAmount()).currentPricePerGram(h.getCurrentPricePerGram())
                .isLive(h.isPriceIsLive()).livePriceAsOf(h.getLastPriceUpdate())
                .currentValue(currentValue).gainLoss(gainLoss).gainLossPct(pct(h.getInvestedAmount(), gainLoss))
                .isIncluded(h.isIncluded()).createdAt(h.getCreatedAt())
                .build();
    }

    // ==================================================================
    // Real Estate
    // ==================================================================

    @Transactional
    public RealEstateDto createRealEstate(String userId, CreateRealEstateRequest req) {
        RealEstate re = RealEstate.builder()
                .id(genId("pt_re"))
                .userId(userId)
                .name(req.getName())
                .propertyType(req.getPropertyType())
                .location(req.getLocation())
                .purchasePrice(scaleMoney(req.getPurchasePrice()))
                .purchaseDate(req.getPurchaseDate())
                .currentEstimatedValue(scaleMoney(req.getCurrentEstimatedValue()))
                .notes(req.getNotes())
                .build();
        applyManualLinkDefaults(re);
        return mapRealEstate(realEstateRepository.save(re));
    }

    @Transactional(readOnly = true)
    public List<RealEstateDto> listRealEstate(String userId) {
        return realEstateRepository.findByUserIdOrderByCreatedAtDesc(userId).stream()
                .map(this::mapRealEstate).collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public RealEstateDto getRealEstate(String userId, String id) {
        return mapRealEstate(findRealEstate(userId, id));
    }

    @Transactional
    public RealEstateDto updateRealEstate(String userId, String id, UpdateRealEstateRequest req) {
        RealEstate re = findRealEstate(userId, id);
        if (req.getLocation() != null) re.setLocation(req.getLocation());
        if (req.getCurrentEstimatedValue() != null) re.setCurrentEstimatedValue(scaleMoney(req.getCurrentEstimatedValue()));
        if (req.getNotes() != null) re.setNotes(req.getNotes());
        return mapRealEstate(realEstateRepository.save(re));
    }

    @Transactional
    public void deleteRealEstate(String userId, String id) {
        realEstateRepository.delete(findRealEstate(userId, id));
    }

    private RealEstate findRealEstate(String userId, String id) {
        return realEstateRepository.findByIdAndUserId(id, userId)
                .orElseThrow(() -> new IllegalArgumentException("Real estate holding not found: " + id));
    }

    private RealEstateDto mapRealEstate(RealEstate re) {
        BigDecimal gainLoss = re.getCurrentEstimatedValue().subtract(re.getPurchasePrice());
        return RealEstateDto.builder()
                .id(re.getId()).name(re.getName()).propertyType(re.getPropertyType()).location(re.getLocation())
                .purchasePrice(re.getPurchasePrice()).purchaseDate(re.getPurchaseDate())
                .currentEstimatedValue(re.getCurrentEstimatedValue()).notes(re.getNotes())
                .gainLoss(gainLoss).gainLossPct(pct(re.getPurchasePrice(), gainLoss))
                .isIncluded(re.isIncluded()).createdAt(re.getCreatedAt())
                .build();
    }

    // ==================================================================
    // Others
    // ==================================================================

    @Transactional
    public OtherInstrumentDto createOtherInstrument(String userId, CreateOtherInstrumentRequest req) {
        validateCategoryMix(req.getCategoryMix());

        OtherInstrument other = OtherInstrument.builder()
                .id(genId("pt_oth"))
                .userId(userId)
                .name(req.getName())
                .category(req.getCategory())
                .investedAmount(scaleMoney(req.getInvestedAmount()))
                .currentValue(scaleMoney(req.getCurrentValue()))
                .notes(req.getNotes())
                .build();
        applyManualLinkDefaults(other);
        OtherInstrument saved = otherInstrumentRepository.save(other);

        List<OtherInstrumentCategoryMix> mix = saveCategoryMix(saved.getId(), req.getCategoryMix());
        return mapOtherInstrument(saved, mix);
    }

    @Transactional(readOnly = true)
    public List<OtherInstrumentDto> listOtherInstruments(String userId) {
        return otherInstrumentRepository.findByUserIdOrderByCreatedAtDesc(userId).stream()
                .map(o -> mapOtherInstrument(o, categoryMixRepository.findByOtherInstrumentId(o.getId())))
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public OtherInstrumentDto getOtherInstrument(String userId, String id) {
        OtherInstrument o = findOtherInstrument(userId, id);
        return mapOtherInstrument(o, categoryMixRepository.findByOtherInstrumentId(o.getId()));
    }

    @Transactional
    public OtherInstrumentDto updateOtherInstrument(String userId, String id, UpdateOtherInstrumentRequest req) {
        OtherInstrument other = findOtherInstrument(userId, id);
        if (req.getCurrentValue() != null) other.setCurrentValue(scaleMoney(req.getCurrentValue()));
        if (req.getNotes() != null) other.setNotes(req.getNotes());
        OtherInstrument saved = otherInstrumentRepository.save(other);

        List<OtherInstrumentCategoryMix> mix;
        if (req.getCategoryMix() != null) {
            validateCategoryMix(req.getCategoryMix());
            categoryMixRepository.deleteByOtherInstrumentId(id);
            mix = saveCategoryMix(id, req.getCategoryMix());
        } else {
            mix = categoryMixRepository.findByOtherInstrumentId(id);
        }
        return mapOtherInstrument(saved, mix);
    }

    @Transactional
    public void deleteOtherInstrument(String userId, String id) {
        OtherInstrument other = findOtherInstrument(userId, id);
        categoryMixRepository.deleteByOtherInstrumentId(id);
        otherInstrumentRepository.delete(other);
    }

    private OtherInstrument findOtherInstrument(String userId, String id) {
        return otherInstrumentRepository.findByIdAndUserId(id, userId)
                .orElseThrow(() -> new IllegalArgumentException("Other instrument not found: " + id));
    }

    private void validateCategoryMix(List<CategoryMixEntryDto> mix) {
        BigDecimal sum = mix.stream().map(CategoryMixEntryDto::getPercentage).reduce(BigDecimal.ZERO, BigDecimal::add);
        if (sum.subtract(HUNDRED).abs().compareTo(PCT_TOLERANCE) > 0) {
            throw new IllegalArgumentException("Category mix must sum to 100.0% (got " + sum + "%)");
        }
    }

    private List<OtherInstrumentCategoryMix> saveCategoryMix(String otherInstrumentId, List<CategoryMixEntryDto> entries) {
        List<OtherInstrumentCategoryMix> saved = new ArrayList<>();
        for (CategoryMixEntryDto entry : entries) {
            saved.add(categoryMixRepository.save(OtherInstrumentCategoryMix.builder()
                    .id(genId("pt_mix"))
                    .otherInstrumentId(otherInstrumentId)
                    .bucket(entry.getBucket())
                    .percentage(entry.getPercentage())
                    .build()));
        }
        return saved;
    }

    private OtherInstrumentDto mapOtherInstrument(OtherInstrument o, List<OtherInstrumentCategoryMix> mix) {
        BigDecimal gainLoss = o.getCurrentValue().subtract(o.getInvestedAmount());
        return OtherInstrumentDto.builder()
                .id(o.getId()).name(o.getName()).category(o.getCategory())
                .investedAmount(o.getInvestedAmount()).currentValue(o.getCurrentValue()).notes(o.getNotes())
                .gainLoss(gainLoss).gainLossPct(pct(o.getInvestedAmount(), gainLoss))
                .categoryMix(mix.stream()
                        .map(m -> CategoryMixEntryDto.builder().bucket(m.getBucket()).percentage(m.getPercentage()).build())
                        .collect(Collectors.toList()))
                .isIncluded(o.isIncluded()).createdAt(o.getCreatedAt())
                .build();
    }

    // ==================================================================
    // Search / live-price preview / cross-module summary
    // ==================================================================

    private static final List<SymbolSearchResultDto> CURATED_SYMBOLS = List.of(
            SymbolSearchResultDto.builder().ticker("RELIANCE").companyName("Reliance Industries Ltd").market("NSE").build(),
            SymbolSearchResultDto.builder().ticker("TCS").companyName("Tata Consultancy Services Ltd").market("NSE").build(),
            SymbolSearchResultDto.builder().ticker("HDFCBANK").companyName("HDFC Bank Ltd").market("NSE").build(),
            SymbolSearchResultDto.builder().ticker("INFY").companyName("Infosys Ltd").market("NSE").build(),
            SymbolSearchResultDto.builder().ticker("ICICIBANK").companyName("ICICI Bank Ltd").market("NSE").build(),
            SymbolSearchResultDto.builder().ticker("HINDUNILVR").companyName("Hindustan Unilever Ltd").market("NSE").build(),
            SymbolSearchResultDto.builder().ticker("ITC").companyName("ITC Ltd").market("NSE").build(),
            SymbolSearchResultDto.builder().ticker("SBIN").companyName("State Bank of India").market("NSE").build(),
            SymbolSearchResultDto.builder().ticker("BHARTIARTL").companyName("Bharti Airtel Ltd").market("NSE").build(),
            SymbolSearchResultDto.builder().ticker("NIFTYBEES").companyName("Nippon India ETF Nifty BeES").market("NSE").build(),
            SymbolSearchResultDto.builder().ticker("AAPL").companyName("Apple Inc").market("US").build(),
            SymbolSearchResultDto.builder().ticker("MSFT").companyName("Microsoft Corp").market("US").build(),
            SymbolSearchResultDto.builder().ticker("GOOGL").companyName("Alphabet Inc").market("US").build(),
            SymbolSearchResultDto.builder().ticker("VOO").companyName("Vanguard S&P 500 ETF").market("US").build()
    );

    public List<SymbolSearchResultDto> searchSymbols(String assetType, String query) {
        if (query == null || query.trim().length() < 3) {
            return List.of();
        }
        String q = query.trim().toUpperCase();
        boolean wantsUsMarket = "STOCK_US".equalsIgnoreCase(assetType) || "ETF_US".equalsIgnoreCase(assetType);
        return CURATED_SYMBOLS.stream()
                .filter(s -> s.getTicker().contains(q) || s.getCompanyName().toUpperCase().contains(q))
                .filter(s -> assetType == null || assetType.isBlank() || wantsUsMarket == "US".equals(s.getMarket()) || !wantsUsMarket)
                .limit(10)
                .collect(Collectors.toList());
    }

    public LivePriceQuoteDto getLivePricePreview(AssetType assetType, Market market, String symbolOrCode) {
        PriceQuote quote = pricingService.getLivePrice(assetType, market, symbolOrCode, null);
        return LivePriceQuoteDto.builder()
                .price(quote.getPrice()).isLive(quote.isLive()).asOf(quote.getAsOf()).source(quote.getSource())
                .build();
    }

    @Transactional(readOnly = true)
    public List<PortfolioHoldingSummaryDto> getPortfolioSummary(String userId) {
        return collectAllValuations(userId).stream()
                .map(v -> PortfolioHoldingSummaryDto.builder()
                        .id(v.getId()).name(v.getName()).assetType(v.getAssetType())
                        .category(v.getCategory()).currentValue(v.getCurrentValue()).isIncluded(v.isIncluded())
                        .build())
                .collect(Collectors.toList());
    }

    /**
     * Unifies all 9 asset-type tables into one valuation list — used by both the summary endpoint
     * here and by PortfolioAnalyticsService for dashboard/growth/drawdown math.
     */
    List<AssetValuation> collectAllValuations(String userId) {
        List<AssetValuation> all = new ArrayList<>();

        for (StockHolding h : stockHoldingRepository.findByUserIdOrderByCreatedAtDesc(userId)) {
            BigDecimal cv = scaleMoney(h.getQuantity().multiply(h.getCurrentPrice()));
            all.add(AssetValuation.builder().id(h.getId()).assetType(AssetType.STOCK).name(h.getName())
                    .category(h.getMarket().name()).investedAmount(h.getInvestedAmount()).currentValue(cv)
                    .isIncluded(h.isIncluded()).equityFraction(BigDecimal.ONE).build());
        }
        for (EtfHolding h : etfHoldingRepository.findByUserIdOrderByCreatedAtDesc(userId)) {
            BigDecimal cv = scaleMoney(h.getQuantity().multiply(h.getCurrentPrice()));
            all.add(AssetValuation.builder().id(h.getId()).assetType(AssetType.ETF).name(h.getName())
                    .category(h.getMarket().name()).investedAmount(h.getInvestedAmount()).currentValue(cv)
                    .isIncluded(h.isIncluded()).equityFraction(BigDecimal.ONE).build());
        }
        for (MutualFundHolding h : mutualFundHoldingRepository.findByUserIdOrderByCreatedAtDesc(userId)) {
            BigDecimal cv = scaleMoney(h.getUnits().multiply(h.getCurrentNav()));
            BigDecimal eqFraction = h.getCategory() == MfCategory.EQUITY ? BigDecimal.ONE : BigDecimal.ZERO;
            all.add(AssetValuation.builder().id(h.getId()).assetType(AssetType.MUTUAL_FUND).name(h.getName())
                    .category(h.getCategory().name()).investedAmount(h.getInvestedAmount()).currentValue(cv)
                    .isIncluded(h.isIncluded()).equityFraction(eqFraction).build());
        }
        for (NpsHolding h : npsHoldingRepository.findByUserIdOrderByCreatedAtDesc(userId)) {
            BigDecimal cv = scaleMoney(h.getUnits().multiply(h.getCurrentNav()));
            BigDecimal eqPct = npsSchemeAllocationRepository.findByNpsHoldingId(h.getId())
                    .map(NpsSchemeAllocation::getEquityPct).orElse(BigDecimal.ZERO);
            all.add(AssetValuation.builder().id(h.getId()).assetType(AssetType.NPS).name(h.getName())
                    .category("NPS").investedAmount(h.getInvestedAmount()).currentValue(cv)
                    .isIncluded(h.isIncluded()).equityFraction(eqPct.divide(HUNDRED, 4, RoundingMode.HALF_UP)).build());
        }
        for (Deposit d : depositRepository.findByUserIdOrderByCreatedAtDesc(userId)) {
            all.add(AssetValuation.builder().id(d.getId()).assetType(AssetType.DEPOSIT).name(d.getName())
                    .category(d.getDepositType().name()).investedAmount(d.getPrincipalAmount())
                    .currentValue(computeDepositCurrentValue(d)).isIncluded(d.isIncluded())
                    .equityFraction(BigDecimal.ZERO).build());
        }
        for (Bond b : bondRepository.findByUserIdOrderByCreatedAtDesc(userId)) {
            BigDecimal cv = b.getCurrentPrice() != null ? b.getCurrentPrice() : b.getPurchasePrice();
            all.add(AssetValuation.builder().id(b.getId()).assetType(AssetType.BOND).name(b.getName())
                    .category("BOND").investedAmount(b.getPurchasePrice()).currentValue(cv)
                    .isIncluded(b.isIncluded()).equityFraction(BigDecimal.ZERO).build());
        }
        for (MetalHolding h : metalHoldingRepository.findByUserIdOrderByCreatedAtDesc(userId)) {
            BigDecimal cv = scaleMoney(h.getQuantityGrams().multiply(h.getCurrentPricePerGram()));
            all.add(AssetValuation.builder().id(h.getId()).assetType(AssetType.METAL).name(h.getName())
                    .category(h.getMetalType().name()).investedAmount(h.getInvestedAmount()).currentValue(cv)
                    .isIncluded(h.isIncluded()).equityFraction(BigDecimal.ZERO).build());
        }
        for (RealEstate re : realEstateRepository.findByUserIdOrderByCreatedAtDesc(userId)) {
            all.add(AssetValuation.builder().id(re.getId()).assetType(AssetType.REAL_ESTATE).name(re.getName())
                    .category(re.getPropertyType().name()).investedAmount(re.getPurchasePrice())
                    .currentValue(re.getCurrentEstimatedValue()).isIncluded(re.isIncluded())
                    .equityFraction(BigDecimal.ZERO).build());
        }
        for (OtherInstrument o : otherInstrumentRepository.findByUserIdOrderByCreatedAtDesc(userId)) {
            all.add(AssetValuation.builder().id(o.getId()).assetType(AssetType.OTHER).name(o.getName())
                    .category(o.getCategory()).investedAmount(o.getInvestedAmount()).currentValue(o.getCurrentValue())
                    .isIncluded(o.isIncluded()).equityFraction(BigDecimal.ZERO).build());
        }

        return all;
    }

    // ==================================================================
    // Live-price refresh (populates the daily snapshots dashboard analytics reads back)
    // ==================================================================

    @Transactional
    public void refreshAllPrices(String userId) {
        for (StockHolding h : stockHoldingRepository.findByUserIdOrderByCreatedAtDesc(userId)) {
            PriceQuote q = pricingService.getLivePrice(AssetType.STOCK, h.getMarket(), h.getTicker(), h.getCurrentPrice());
            h.setCurrentPrice(scaleMoney(q.getPrice())); h.setLastPriceUpdate(q.getAsOf()); h.setPriceIsLive(q.isLive());
            stockHoldingRepository.save(h);
            pricingService.recordSnapshot(userId, h.getId(), AssetType.STOCK, h.getInvestedAmount(),
                    scaleMoney(h.getQuantity().multiply(h.getCurrentPrice())));
        }
        for (EtfHolding h : etfHoldingRepository.findByUserIdOrderByCreatedAtDesc(userId)) {
            PriceQuote q = pricingService.getLivePrice(AssetType.ETF, h.getMarket(), h.getTicker(), h.getCurrentPrice());
            h.setCurrentPrice(scaleMoney(q.getPrice())); h.setLastPriceUpdate(q.getAsOf()); h.setPriceIsLive(q.isLive());
            etfHoldingRepository.save(h);
            pricingService.recordSnapshot(userId, h.getId(), AssetType.ETF, h.getInvestedAmount(),
                    scaleMoney(h.getQuantity().multiply(h.getCurrentPrice())));
        }
        for (MutualFundHolding h : mutualFundHoldingRepository.findByUserIdOrderByCreatedAtDesc(userId)) {
            PriceQuote q = pricingService.getLivePrice(AssetType.MUTUAL_FUND, null, h.getSchemeCode(), h.getCurrentNav());
            h.setCurrentNav(scaleMoney(q.getPrice())); h.setLastPriceUpdate(q.getAsOf()); h.setPriceIsLive(q.isLive());
            mutualFundHoldingRepository.save(h);
            pricingService.recordSnapshot(userId, h.getId(), AssetType.MUTUAL_FUND, h.getInvestedAmount(),
                    scaleMoney(h.getUnits().multiply(h.getCurrentNav())));
        }
        for (MetalHolding h : metalHoldingRepository.findByUserIdOrderByCreatedAtDesc(userId)) {
            PriceQuote q = pricingService.getLivePrice(AssetType.METAL, null, h.getMetalType().name(), h.getCurrentPricePerGram());
            h.setCurrentPricePerGram(scaleMoney(q.getPrice())); h.setLastPriceUpdate(q.getAsOf()); h.setPriceIsLive(q.isLive());
            metalHoldingRepository.save(h);
            pricingService.recordSnapshot(userId, h.getId(), AssetType.METAL, h.getInvestedAmount(),
                    scaleMoney(h.getQuantityGrams().multiply(h.getCurrentPricePerGram())));
        }
        // Manual-priced types (NPS/Deposit/Bond/RealEstate/Other) still get a daily snapshot so the
        // growth chart's aggregate invested-vs-worth-today series includes their contribution.
        for (NpsHolding h : npsHoldingRepository.findByUserIdOrderByCreatedAtDesc(userId)) {
            pricingService.recordSnapshot(userId, h.getId(), AssetType.NPS, h.getInvestedAmount(),
                    scaleMoney(h.getUnits().multiply(h.getCurrentNav())));
        }
        for (Deposit d : depositRepository.findByUserIdOrderByCreatedAtDesc(userId)) {
            pricingService.recordSnapshot(userId, d.getId(), AssetType.DEPOSIT, d.getPrincipalAmount(), computeDepositCurrentValue(d));
        }
        for (Bond b : bondRepository.findByUserIdOrderByCreatedAtDesc(userId)) {
            BigDecimal cv = b.getCurrentPrice() != null ? b.getCurrentPrice() : b.getPurchasePrice();
            pricingService.recordSnapshot(userId, b.getId(), AssetType.BOND, b.getPurchasePrice(), cv);
        }
        for (RealEstate re : realEstateRepository.findByUserIdOrderByCreatedAtDesc(userId)) {
            pricingService.recordSnapshot(userId, re.getId(), AssetType.REAL_ESTATE, re.getPurchasePrice(), re.getCurrentEstimatedValue());
        }
        for (OtherInstrument o : otherInstrumentRepository.findByUserIdOrderByCreatedAtDesc(userId)) {
            pricingService.recordSnapshot(userId, o.getId(), AssetType.OTHER, o.getInvestedAmount(), o.getCurrentValue());
        }
    }

    // ==================================================================
    // Sample data seeder (matches the 1-click seeder convention in EmiService/TripService)
    // ==================================================================

    @Transactional
    public void seedSampleData(String userId) {
        createStock(userId, CreateStockHoldingRequest.builder()
                .ticker("RELIANCE").market(Market.NSE).quantity(new BigDecimal("10"))
                .costPerUnit(new BigDecimal("2450.00")).useLivePriceAsPurchasePrice(false).build());
        createStock(userId, CreateStockHoldingRequest.builder()
                .ticker("TCS").market(Market.NSE).quantity(new BigDecimal("5"))
                .costPerUnit(new BigDecimal("3600.00")).useLivePriceAsPurchasePrice(false).build());
        createMutualFund(userId, CreateMutualFundHoldingRequest.builder()
                .schemeCode("119551").schemeName("Axis Bluechip Fund - Direct Growth")
                .category(MfCategory.EQUITY).capitalisation(Capitalisation.LARGE_CAP)
                .units(new BigDecimal("250")).navPerUnit(new BigDecimal("55.00")).useLivePriceAsPurchasePrice(false).build());
        createMetal(userId, CreateMetalHoldingRequest.builder()
                .metalType(MetalType.GOLD).purityKarat(24).quantityGrams(new BigDecimal("20"))
                .costPerGram(new BigDecimal("6200.00")).useLivePriceAsPurchasePrice(false).build());
        createDeposit(userId, CreateDepositRequest.builder()
                .depositType(DepositType.FD).bankName("HDFC Bank").principalAmount(new BigDecimal("200000"))
                .interestRatePct(new BigDecimal("7.1")).startDate(LocalDate.now().minusMonths(6))
                .maturityDate(LocalDate.now().plusYears(2)).compoundingFrequency(PaymentFrequency.QUARTERLY).build());
    }

    // ==================================================================
    // Shared helpers
    // ==================================================================

    private void applyManualLinkDefaults(PortfolioAsset asset) {
        asset.setIncluded(true);
        asset.setLinked(false);
        asset.setSourceModule(SourceModule.MANUAL);
    }

    private String genId(String prefix) {
        return prefix + "_" + UUID.randomUUID().toString().substring(0, 8);
    }

    private BigDecimal nonNull(BigDecimal v) {
        return v != null ? v : BigDecimal.ZERO;
    }

    private BigDecimal scaleMoney(BigDecimal v) {
        return nonNull(v).setScale(2, RoundingMode.HALF_UP);
    }

    private BigDecimal scaleQty(BigDecimal v) {
        return nonNull(v).setScale(4, RoundingMode.HALF_UP);
    }

    private BigDecimal pct(BigDecimal base, BigDecimal delta) {
        if (base == null || base.compareTo(BigDecimal.ZERO) == 0) return BigDecimal.ZERO;
        return delta.divide(base, 6, RoundingMode.HALF_UP).multiply(HUNDRED).setScale(2, RoundingMode.HALF_UP);
    }

    private int periodsPerYear(PaymentFrequency freq) {
        return switch (freq) {
            case MONTHLY -> 12;
            case QUARTERLY -> 4;
            case SEMI_ANNUALLY -> 2;
            case ANNUALLY -> 1;
        };
    }

    private LocalDate advance(LocalDate date, PaymentFrequency freq) {
        return switch (freq) {
            case MONTHLY -> date.plusMonths(1);
            case QUARTERLY -> date.plusMonths(3);
            case SEMI_ANNUALLY -> date.plusMonths(6);
            case ANNUALLY -> date.plusYears(1);
        };
    }
}
