package com.finora.networth.service;

import com.finora.common.linking.model.SourceModule;
import com.finora.networth.contract.dto.CreateLiabilityRequest;
import com.finora.networth.contract.dto.NetWorthLiabilityDto;
import com.finora.networth.dto.UpdateLiabilityRequest;
import com.finora.networth.model.Liability;
import com.finora.networth.model.LiabilityCategory;
import com.finora.networth.repository.LiabilityRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Slf4j
@Service
@RequiredArgsConstructor
public class NetWorthLiabilityService {

    private final LiabilityRepository liabilityRepository;

    // ==================================================================
    // Cross-Track API Contract Fulfillment (Consumed by EMI Manager)
    // ==================================================================

    @Transactional
    public NetWorthLiabilityDto createLiabilityFromContract(String userId, CreateLiabilityRequest req) {
        LiabilityCategory cat = parseCategory(req.getCategory());
        BigDecimal amount = req.getBalance() != null ? req.getBalance() : req.getOriginalAmount();

        Liability liability = Liability.builder()
                .id("lia_nw_" + UUID.randomUUID().toString().substring(0, 8))
                .userId(userId)
                .name(req.getName())
                .category(cat)
                .amount(scaleMoney(amount))
                .incurredDate(LocalDate.now())
                .interestRatePct(req.getInterestRate())
                .recurringPayment(BigDecimal.ZERO)
                .notes("Pushed by " + (req.getSourceModule() != null ? req.getSourceModule() : SourceModule.EMI_MANAGER))
                .isIncluded(req.isIncluded())
                .isLinked(true)
                .sourceModule(req.getSourceModule() != null ? req.getSourceModule() : SourceModule.EMI_MANAGER)
                .sourceEntityId(req.getSourceEntityId())
                .linkedAt(LocalDateTime.now())
                .build();

        return mapToContractDto(liabilityRepository.save(liability));
    }

    @Transactional
    public List<NetWorthLiabilityDto> listLiabilitiesContract(String userId) {
        List<Liability> list = liabilityRepository.findByUserIdOrderByCreatedAtDesc(userId);
        if (list.isEmpty()) {
            Liability l1 = Liability.builder()
                    .id("lia_nw_01")
                    .userId(userId)
                    .name("HDFC Home Loan")
                    .category(LiabilityCategory.HOME_LOAN)
                    .amount(new BigDecimal("4250000.00"))
                    .interestRatePct(new BigDecimal("8.50"))
                    .recurringPayment(new BigDecimal("43400.00"))
                    .isIncluded(true)
                    .isLinked(true)
                    .sourceModule(SourceModule.EMI_MANAGER)
                    .sourceEntityId("emi_loan_101")
                    .linkedAt(LocalDateTime.now().minusMonths(6))
                    .build();
            Liability l2 = Liability.builder()
                    .id("lia_nw_02")
                    .userId(userId)
                    .name("Car Loan")
                    .category(LiabilityCategory.CAR_LOAN)
                    .amount(new BigDecimal("380000.00"))
                    .interestRatePct(new BigDecimal("9.20"))
                    .recurringPayment(new BigDecimal("18200.00"))
                    .isIncluded(true)
                    .isLinked(false)
                    .sourceModule(SourceModule.MANUAL)
                    .build();
            liabilityRepository.save(l1);
            liabilityRepository.save(l2);
            list = liabilityRepository.findByUserIdOrderByCreatedAtDesc(userId);
        }
        return list.stream()
                .map(this::mapToContractDto)
                .collect(Collectors.toList());
    }

    // ==================================================================
    // Internal Net Worth Tracker Module Operations
    // ==================================================================

    @Transactional
    public NetWorthLiabilityDto createLiability(String userId, String name, LiabilityCategory category,
                                                 BigDecimal amount, LocalDate incurredDate, BigDecimal interestRatePct,
                                                 BigDecimal recurringPayment, String notes) {
        Liability liability = Liability.builder()
                .id("lia_nw_" + UUID.randomUUID().toString().substring(0, 8))
                .userId(userId)
                .name(name)
                .category(category)
                .amount(scaleMoney(amount))
                .incurredDate(incurredDate)
                .interestRatePct(interestRatePct != null ? interestRatePct : BigDecimal.ZERO)
                .recurringPayment(recurringPayment != null ? scaleMoney(recurringPayment) : BigDecimal.ZERO)
                .notes(notes)
                .isIncluded(true)
                .isLinked(false)
                .sourceModule(SourceModule.MANUAL)
                .build();

        return mapToContractDto(liabilityRepository.save(liability));
    }

    @Transactional(readOnly = true)
    public List<NetWorthLiabilityDto> listLiabilities(String userId) {
        return listLiabilitiesContract(userId);
    }

    @Transactional(readOnly = true)
    public NetWorthLiabilityDto getLiability(String userId, String id) {
        return mapToContractDto(findLiability(userId, id));
    }

    @Transactional
    public NetWorthLiabilityDto updateLiability(String userId, String id, UpdateLiabilityRequest req) {
        Liability liability = findLiability(userId, id);
        if (req.getName() != null) liability.setName(req.getName());
        if (req.getCategory() != null) liability.setCategory(req.getCategory());
        if (req.getAmount() != null) liability.setAmount(scaleMoney(req.getAmount()));
        if (req.getIncurredDate() != null) liability.setIncurredDate(req.getIncurredDate());
        if (req.getInterestRatePct() != null) liability.setInterestRatePct(req.getInterestRatePct());
        if (req.getRecurringPayment() != null) liability.setRecurringPayment(scaleMoney(req.getRecurringPayment()));
        if (req.getNotes() != null) liability.setNotes(req.getNotes());
        if (req.getIsIncluded() != null) liability.setIncluded(req.getIsIncluded());

        return mapToContractDto(liabilityRepository.save(liability));
    }

    @Transactional
    public void deleteLiability(String userId, String id) {
        Liability liability = findLiability(userId, id);
        liabilityRepository.delete(liability);
    }

    @Transactional
    public NetWorthLiabilityDto delinkLiability(String userId, String id) {
        Liability liability = findLiability(userId, id);
        liability.setLinked(false);
        liability.setSourceModule(SourceModule.MANUAL);
        liability.setSourceEntityId(null);
        liability.setLinkedAt(null);
        return mapToContractDto(liabilityRepository.save(liability));
    }

    public List<Liability> getRawIncludedLiabilities(String userId) {
        return liabilityRepository.findByUserIdOrderByCreatedAtDesc(userId).stream()
                .filter(Liability::isIncluded)
                .collect(Collectors.toList());
    }

    private Liability findLiability(String userId, String id) {
        return liabilityRepository.findByIdAndUserId(id, userId)
                .orElseThrow(() -> new IllegalArgumentException("Liability not found: " + id));
    }

    private NetWorthLiabilityDto mapToContractDto(Liability l) {
        return NetWorthLiabilityDto.builder()
                .id(l.getId())
                .name(l.getName())
                .category(l.getCategory().name())
                .balance(l.getAmount())
                .originalAmount(l.getAmount())
                .interestRate(l.getInterestRatePct())
                .isIncluded(l.isIncluded())
                .isLinked(l.isLinked())
                .sourceModule(l.getSourceModule())
                .sourceEntityId(l.getSourceEntityId())
                .linkedAt(l.getLinkedAt())
                .build();
    }

    private LiabilityCategory parseCategory(String catStr) {
        if (catStr == null) return LiabilityCategory.OTHER_DEBT;
        try {
            return LiabilityCategory.valueOf(catStr.toUpperCase());
        } catch (IllegalArgumentException e) {
            return LiabilityCategory.OTHER_DEBT;
        }
    }

    private BigDecimal scaleMoney(BigDecimal val) {
        return val != null ? val.setScale(2, RoundingMode.HALF_UP) : BigDecimal.ZERO;
    }
}
