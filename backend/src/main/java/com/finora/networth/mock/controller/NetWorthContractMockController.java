package com.finora.networth.mock.controller;

import com.finora.common.linking.model.SourceModule;
import com.finora.networth.contract.dto.CreateLiabilityRequest;
import com.finora.networth.contract.dto.NetWorthLiabilityDto;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.UUID;

@Slf4j
// Replaced by real NetWorthController in com.finora.networth.controller
public class NetWorthContractMockController {

    private final List<NetWorthLiabilityDto> liabilitiesStore = new ArrayList<>();

    public NetWorthContractMockController() {
        // Seed initial mock liabilities
        liabilitiesStore.add(NetWorthLiabilityDto.builder()
                .id("lia_nw_01")
                .name("HDFC Home Loan")
                .category("HOME_LOAN")
                .balance(new BigDecimal("4250000.00"))
                .originalAmount(new BigDecimal("5000000.00"))
                .interestRate(new BigDecimal("8.50"))
                .isIncluded(true)
                .isLinked(true)
                .sourceModule(SourceModule.EMI_MANAGER)
                .sourceEntityId("emi_loan_101")
                .linkedAt(LocalDateTime.now().minusMonths(6))
                .build());

        liabilitiesStore.add(NetWorthLiabilityDto.builder()
                .id("lia_nw_02")
                .name("Car Loan")
                .category("VEHICLE_LOAN")
                .balance(new BigDecimal("380000.00"))
                .originalAmount(new BigDecimal("800000.00"))
                .interestRate(new BigDecimal("9.20"))
                .isIncluded(true)
                .isLinked(false)
                .sourceModule(SourceModule.MANUAL)
                .sourceEntityId(null)
                .linkedAt(null)
                .build());
    }

    @GetMapping("/liabilities")
    @Operation(summary = "Get current liabilities list", description = "Returns active liabilities for EMI Manager to check or link loans against")
    public ResponseEntity<List<NetWorthLiabilityDto>> getLiabilities() {
        log.info("Serving mock Net Worth liabilities list (total: {})", liabilitiesStore.size());
        return ResponseEntity.ok(new ArrayList<>(liabilitiesStore));
    }

    @PostMapping("/liabilities")
    @Operation(summary = "Push new liability from EMI Manager into Net Worth Tracker", description = "Called by EMI Manager when a user creates a new loan liability")
    public ResponseEntity<NetWorthLiabilityDto> createLiability(@Valid @RequestBody CreateLiabilityRequest request) {
        log.info("Mocking Net Worth liability creation for loan: {} (source: {})", request.getName(), request.getSourceEntityId());

        NetWorthLiabilityDto created = NetWorthLiabilityDto.builder()
                .id("lia_" + UUID.randomUUID().toString().substring(0, 8))
                .name(request.getName())
                .category(request.getCategory())
                .balance(request.getBalance())
                .originalAmount(request.getOriginalAmount())
                .interestRate(request.getInterestRate())
                .isIncluded(request.isIncluded())
                .isLinked(true)
                .sourceModule(request.getSourceModule() != null ? request.getSourceModule() : SourceModule.EMI_MANAGER)
                .sourceEntityId(request.getSourceEntityId())
                .linkedAt(LocalDateTime.now())
                .build();

        liabilitiesStore.add(created);
        return ResponseEntity.status(HttpStatus.CREATED).body(created);
    }
}
