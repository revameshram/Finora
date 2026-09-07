package com.finora;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.finora.portfolio.dto.*;
import com.finora.portfolio.model.*;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.MediaType;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.web.servlet.MockMvc;

import java.math.BigDecimal;
import java.time.LocalDate;

import static org.hamcrest.Matchers.*;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@SpringBootTest
@AutoConfigureMockMvc
@ActiveProfiles("test")
public class PortfolioIntegrationTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    @Test
    public void testCreateStockAndAddSharesWeightedAverage() throws Exception {
        // 1. Create Initial Stock Holding
        CreateStockHoldingRequest req = CreateStockHoldingRequest.builder()
                .ticker("RELIANCE")
                .market(Market.NSE)
                .quantity(new BigDecimal("10"))
                .costPerUnit(new BigDecimal("2500.00"))
                .useLivePriceAsPurchasePrice(false)
                .build();

        String res = mockMvc.perform(post("/api/v1/portfolio/stocks")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(req)))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.id", notNullValue()))
                .andExpect(jsonPath("$.ticker", is("RELIANCE")))
                .andExpect(jsonPath("$.quantity", is(10.0)))
                .andExpect(jsonPath("$.avgCostPerUnit", is(2500.00)))
                .andExpect(jsonPath("$.investedAmount", is(25000.00)))
                .andReturn().getResponse().getContentAsString();

        StockHoldingDto stock = objectMapper.readValue(res, StockHoldingDto.class);

        // 2. Add Shares (Add 10 more @ ₹3,000) -> New Avg Cost = (25,000 + 30,000) / 20 = ₹2,750
        AddSharesRequest addReq = AddSharesRequest.builder()
                .quantity(new BigDecimal("10"))
                .costPerUnit(new BigDecimal("3000.00"))
                .useLivePriceAsPurchasePrice(false)
                .build();

        mockMvc.perform(post("/api/v1/portfolio/stocks/" + stock.getId() + "/add-shares")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(addReq)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.quantity", is(20.0)))
                .andExpect(jsonPath("$.avgCostPerUnit", is(2750.00)))
                .andExpect(jsonPath("$.investedAmount", is(55000.00)));
    }

    @Test
    public void testCreateMutualFundAndNpsAllocations() throws Exception {
        // 1. Create Mutual Fund
        CreateMutualFundHoldingRequest mfReq = CreateMutualFundHoldingRequest.builder()
                .schemeCode("120503")
                .schemeName("Axis Bluechip Fund - Direct Plan")
                .category(MfCategory.EQUITY)
                .capitalisation(Capitalisation.LARGE_CAP)
                .units(new BigDecimal("500"))
                .navPerUnit(new BigDecimal("50.00"))
                .useLivePriceAsPurchasePrice(false)
                .build();

        mockMvc.perform(post("/api/v1/portfolio/mutual-funds")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(mfReq)))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.id", notNullValue()))
                .andExpect(jsonPath("$.schemeName", is("Axis Bluechip Fund - Direct Plan")))
                .andExpect(jsonPath("$.investedAmount", is(25000.00)));

        // 2. Create NPS Holding with 75% Equity, 15% Corp Debt, 10% G-Sec = 100%
        CreateNpsHoldingRequest npsReq = CreateNpsHoldingRequest.builder()
                .pensionFundManager("HDFC Pension Fund")
                .units(new BigDecimal("1000"))
                .avgNav(new BigDecimal("40.00"))
                .currentNav(new BigDecimal("45.00"))
                .equityPct(new BigDecimal("75.00"))
                .corporateDebtPct(new BigDecimal("15.00"))
                .governmentSecuritiesPct(new BigDecimal("10.00"))
                .alternativePct(BigDecimal.ZERO)
                .build();

        mockMvc.perform(post("/api/v1/portfolio/nps")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(npsReq)))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.id", notNullValue()))
                .andExpect(jsonPath("$.pensionFundManager", is("HDFC Pension Fund")))
                .andExpect(jsonPath("$.investedAmount", is(40000.00)))
                .andExpect(jsonPath("$.currentValue", is(45000.00)))
                .andExpect(jsonPath("$.equityPct", is(75.00)));
    }

    @Test
    public void testDepositAndBondLifecycle() throws Exception {
        // 1. Create Fixed Deposit
        CreateDepositRequest depReq = CreateDepositRequest.builder()
                .bankName("HDFC Bank")
                .depositType(DepositType.FIXED_DEPOSIT)
                .principalAmount(new BigDecimal("100000.00"))
                .interestRatePct(new BigDecimal("7.50"))
                .startDate(LocalDate.of(2026, 1, 1))
                .maturityDate(LocalDate.of(2027, 1, 1))
                .compoundingFrequency(PaymentFrequency.QUARTERLY)
                .build();

        String depRes = mockMvc.perform(post("/api/v1/portfolio/deposits")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(depReq)))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.id", notNullValue()))
                .andExpect(jsonPath("$.bankName", is("HDFC Bank")))
                .andExpect(jsonPath("$.principalAmount", is(100000.00)))
                .andReturn().getResponse().getContentAsString();

        DepositDto dep = objectMapper.readValue(depRes, DepositDto.class);

        // Fetch Schedule
        mockMvc.perform(get("/api/v1/portfolio/deposits/" + dep.getId() + "/schedule"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$", not(empty())));

        // 2. Create Corporate Bond
        CreateBondRequest bondReq = CreateBondRequest.builder()
                .name("7.75% REC Ltd Bond 2030")
                .issuer("REC Limited")
                .faceValue(new BigDecimal("10000.00"))
                .couponRatePct(new BigDecimal("7.75"))
                .couponFrequency(PaymentFrequency.SEMI_ANNUALLY)
                .issueDate(LocalDate.of(2025, 1, 1))
                .maturityDate(LocalDate.of(2030, 1, 1))
                .purchasePrice(new BigDecimal("10000.00"))
                .build();

        mockMvc.perform(post("/api/v1/portfolio/bonds")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(bondReq)))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.id", notNullValue()))
                .andExpect(jsonPath("$.issuer", is("REC Limited")));
    }

    @Test
    public void testGrowthOutlookAndDrawdownCheck() throws Exception {
        // 1. Test Growth Outlook Calculation
        GrowthOutlookRequest growthReq = GrowthOutlookRequest.builder()
                .expectedReturnPct(new BigDecimal("12.00"))
                .years(5)
                .monthlySavings(new BigDecimal("10000.00"))
                .inflationPct(new BigDecimal("6.00"))
                .build();

        mockMvc.perform(post("/api/v1/portfolio/growth-outlook")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(growthReq)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.todayValue", notNullValue()))
                .andExpect(jsonPath("$.projectedValueNominal", notNullValue()))
                .andExpect(jsonPath("$.series", hasSize(5)));

        // 2. Test Equity Drawdown Check (30% drop simulation)
        DrawdownCheckRequest dropReq = DrawdownCheckRequest.builder()
                .dropPct(new BigDecimal("30.00"))
                .recoveryReturnPct(new BigDecimal("15.00"))
                .build();

        mockMvc.perform(post("/api/v1/portfolio/drawdown-check")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(dropReq)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.equityBeforeDrop", notNullValue()))
                .andExpect(jsonPath("$.equityAfterDrop", notNullValue()))
                .andExpect(jsonPath("$.equityLoss", notNullValue()))
                .andExpect(jsonPath("$.estimatedYearsToRecover", notNullValue()));
    }

    @Test
    public void testDashboardAndSampleSeeder() throws Exception {
        // Seed Sample Data
        mockMvc.perform(post("/api/v1/portfolio/sample-seed"))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.totalInvested", greaterThan(0.0)));

        // Fetch Dashboard Summary Rollup
        mockMvc.perform(get("/api/v1/portfolio/dashboard"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.presentValue", greaterThan(0.0)))
                .andExpect(jsonPath("$.totalInvested", greaterThan(0.0)))
                .andExpect(jsonPath("$.assetAllocation", not(empty())))
                .andExpect(jsonPath("$.portfolioByCategory", not(empty())));
    }
}
