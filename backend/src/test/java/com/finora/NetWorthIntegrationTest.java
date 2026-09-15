package com.finora;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.finora.common.growth.CompoundGrowthEngine;
import com.finora.common.growth.GrowthProjectionPoint;
import com.finora.networth.contract.dto.CreateLiabilityRequest;
import com.finora.networth.dto.*;
import com.finora.networth.model.AssetCategory;
import com.finora.networth.model.LiabilityCategory;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.MediaType;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.web.servlet.MockMvc;

import java.math.BigDecimal;

import static org.hamcrest.MatcherAssert.assertThat;
import static org.hamcrest.Matchers.*;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@SpringBootTest
@AutoConfigureMockMvc
@ActiveProfiles("test")
public class NetWorthIntegrationTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    @Autowired
    private CompoundGrowthEngine growthEngine;

    @Test
    public void testCompoundGrowthEngineMath() {
        // 1. Lump sum compound growth: ₹100,000 @ 10% for 2 years -> ₹121,000
        BigDecimal fvLump = growthEngine.calculateFutureValueLumpSum(new BigDecimal("100000.00"), new BigDecimal("10.00"), 2);
        assertThat(fvLump, is(new BigDecimal("121000.00")));

        // 2. Annuity (SIP): ₹10,000/month @ 12% for 1 year -> ~₹128,093.28
        BigDecimal fvAnnuity = growthEngine.calculateFutureValueAnnuity(new BigDecimal("10000.00"), new BigDecimal("12.00"), 1);
        assertThat(fvAnnuity.doubleValue(), greaterThan(125000.0));

        // 3. Discounted real value: ₹121,000 with 6% inflation over 2 years -> ~₹107,689.57
        BigDecimal realValue = growthEngine.calculateDiscountedRealValue(new BigDecimal("121000.00"), new BigDecimal("6.00"), 2);
        assertThat(realValue.doubleValue(), lessThan(121000.0));

        // 4. Reverse SIP target costing: target ₹1,000,000 in 5 years @ 12% return
        BigDecimal requiredMonthly = growthEngine.calculateRequiredMonthlySavings(
                new BigDecimal("1000000.00"), BigDecimal.ZERO, new BigDecimal("12.00"), BigDecimal.ZERO, 5);
        assertThat(requiredMonthly.doubleValue(), greaterThan(10000.0));
    }

    @Test
    public void testAssetAndLiabilityLifecycleWithEmiSync() throws Exception {
        // 1. Create Manual Asset (Fixed Deposit)
        CreateAssetRequest assetReq = CreateAssetRequest.builder()
                .name("SBI Special FD")
                .category(AssetCategory.CASH_BANK)
                .value(new BigDecimal("200000.00"))
                .growthRatePct(new BigDecimal("7.00"))
                .notes("Primary savings deposit")
                .build();

        mockMvc.perform(post("/api/v1/networth/assets")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(assetReq)))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.id", notNullValue()))
                .andExpect(jsonPath("$.name", is("SBI Special FD")))
                .andExpect(jsonPath("$.value", is(200000.00)));

        // 2. EMI Manager Pushes Loan Liability (POST /api/v1/networth/liabilities)
        CreateLiabilityRequest emiLiabilityReq = CreateLiabilityRequest.builder()
                .name("Axis Bank Car Loan")
                .category("CAR_LOAN")
                .balance(new BigDecimal("500000.00"))
                .originalAmount(new BigDecimal("800000.00"))
                .interestRate(new BigDecimal("9.25"))
                .isIncluded(true)
                .isLinked(true)
                .sourceEntityId("emi_loan_999")
                .build();

        mockMvc.perform(post("/api/v1/networth/liabilities")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(emiLiabilityReq)))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.id", notNullValue()))
                .andExpect(jsonPath("$.name", is("Axis Bank Car Loan")))
                .andExpect(jsonPath("$.balance", is(500000.00)))
                .andExpect(jsonPath("$.isLinked", is(true)));

        // 3. Fetch Liabilities List (fulfills EMI Manager contract)
        mockMvc.perform(get("/api/v1/networth/liabilities"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$", not(empty())))
                .andExpect(jsonPath("$[?(@.name == 'Axis Bank Car Loan')]", not(empty())));
    }

    @Test
    public void testProjectionsWithPortfolioFlatGrowthNuance() throws Exception {
        // Test 3-scenario projections calculation
        NetWorthProjectionRequest req = NetWorthProjectionRequest.builder()
                .years(5)
                .conservativeCagrPct(new BigDecimal("5.00"))
                .moderateCagrPct(new BigDecimal("10.00"))
                .aggressiveCagrPct(new BigDecimal("15.00"))
                .monthlySavingsContribution(new BigDecimal("5000.00"))
                .inflationPct(new BigDecimal("6.00"))
                .build();

        mockMvc.perform(post("/api/v1/networth/projections")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(req)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.conservativeScenario.scenarioName", is("Conservative")))
                .andExpect(jsonPath("$.moderateScenario.scenarioName", is("Moderate")))
                .andExpect(jsonPath("$.aggressiveScenario.scenarioName", is("Aggressive")))
                .andExpect(jsonPath("$.moderateScenario.yearlyPoints", hasSize(5)));
    }

    @Test
    public void testSummaryInsightsAndSampleSeeder() throws Exception {
        // 1. Seed Sample Data
        mockMvc.perform(post("/api/v1/networth/sample-seed"))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.totalAssets", greaterThan(0.0)))
                .andExpect(jsonPath("$.totalLiabilities", greaterThan(0.0)))
                .andExpect(jsonPath("$.netWorth", notNullValue()));

        // 2. Fetch Summary Rollup
        mockMvc.perform(get("/api/v1/networth/summary"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.totalAssets", greaterThan(0.0)))
                .andExpect(jsonPath("$.debtToAssetRatioPct", notNullValue()))
                .andExpect(jsonPath("$.healthScore", greaterThan(0)))
                .andExpect(jsonPath("$.assetsByCategory", not(empty())));

        // 3. Fetch Financial Health Insights
        mockMvc.perform(get("/api/v1/networth/insights"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.healthScore", greaterThan(0)))
                .andExpect(jsonPath("$.healthBadge", notNullValue()))
                .andExpect(jsonPath("$.recommendations", not(empty())));
    }
}
