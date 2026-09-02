package com.finora;

import com.finora.common.linking.model.LinkableEntity;
import com.finora.common.linking.model.SourceModule;
import com.finora.common.linking.service.LinkingService;
import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import lombok.*;
import lombok.experimental.SuperBuilder;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;

import java.math.BigDecimal;
import java.util.List;

import static org.junit.jupiter.api.Assertions.*;

@SpringBootTest
class FinoraLinkingIntegrationTest {

    @Autowired
    private LinkingService linkingService;

    // Concrete test entity simulating a Net Worth Asset holding
    @Getter
    @Setter
    @NoArgsConstructor
    @AllArgsConstructor
    @SuperBuilder
    static class TestAssetItem extends LinkableEntity {
        private String id;
        private String name;
        private BigDecimal amount;
    }

    @Test
    void testPortfolioHoldingLinkedIntoNetWorthTracker() {
        // Step 1: Create a Portfolio-linked asset in Net Worth Tracker
        TestAssetItem linkedHolding = TestAssetItem.builder()
                .id("ast_456")
                .name("TCS (Tata Consultancy Services)")
                .amount(new BigDecimal("350000.00"))
                .isIncluded(true)
                .isLinked(true)
                .sourceModule(SourceModule.PORTFOLIO)
                .sourceEntityId("hld_123")
                .build();

        assertTrue(linkedHolding.isLinked());
        assertTrue(linkedHolding.isIncluded());
        assertEquals(SourceModule.PORTFOLIO, linkedHolding.getSourceModule());
        assertEquals("hld_123", linkedHolding.getSourceEntityId());
        assertEquals(new BigDecimal("350000.00"), linkedHolding.getAmount());

        // Step 2: Delink the asset -> must become standalone MANUAL with frozen value preserved
        linkingService.delink(linkedHolding);

        assertFalse(linkedHolding.isLinked(), "isLinked must be false after delink");
        assertEquals(SourceModule.MANUAL, linkedHolding.getSourceModule(), "sourceModule must be MANUAL after delink");
        assertNull(linkedHolding.getSourceEntityId(), "sourceEntityId must be null after delink");
        assertEquals(new BigDecimal("350000.00"), linkedHolding.getAmount(), "Amount must be preserved after delink");
        assertEquals("TCS (Tata Consultancy Services)", linkedHolding.getName());
    }

    @Test
    void testIsIncludedRollupCalculations() {
        TestAssetItem asset1 = TestAssetItem.builder()
                .id("ast_1")
                .name("Savings Account")
                .amount(new BigDecimal("100000.00"))
                .isIncluded(true)
                .build();

        TestAssetItem asset2 = TestAssetItem.builder()
                .id("ast_2")
                .name("Speculative Token")
                .amount(new BigDecimal("50000.00"))
                .isIncluded(false) // Excluded from total calculation
                .build();

        TestAssetItem asset3 = TestAssetItem.builder()
                .id("ast_3")
                .name("Gold Deposit")
                .amount(new BigDecimal("250000.00"))
                .isIncluded(true)
                .build();

        List<TestAssetItem> assets = List.of(asset1, asset2, asset3);

        BigDecimal totalIncluded = linkingService.calculateIncludedSum(assets, TestAssetItem::getAmount);
        assertEquals(new BigDecimal("350000.00"), totalIncluded, "Excluded asset must not be added to the sum");

        // Toggle asset2 to included
        asset2.toggleIncluded();
        assertTrue(asset2.isIncluded());

        BigDecimal newTotal = linkingService.calculateIncludedSum(assets, TestAssetItem::getAmount);
        assertEquals(new BigDecimal("400000.00"), newTotal);
    }
}
