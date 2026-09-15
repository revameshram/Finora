package com.finora.fire;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.finora.fire.dto.FireSummaryDto;
import com.finora.fire.dto.UpdateFirePlanRequest;
import com.finora.fire.model.FireCalculationMode;
import com.finora.fire.model.FireSavingsSource;
import com.finora.fire.repository.FirePlanRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.MediaType;
import org.springframework.security.test.context.support.WithMockUser;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;

import static org.assertj.core.api.Assertions.assertThat;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@SpringBootTest
@AutoConfigureMockMvc
@ActiveProfiles("test")
@Transactional
public class FirePlannerIntegrationTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    @Autowired
    private FirePlanRepository firePlanRepository;

    private static final String TEST_USER = "demo-user";

    @BeforeEach
    void setUp() {
        firePlanRepository.deleteAll();
    }

    @Test
    @WithMockUser(username = TEST_USER)
    void testFireNumberCalculationAndMode1() throws Exception {
        UpdateFirePlanRequest req = UpdateFirePlanRequest.builder()
            .currentSavingsSource(FireSavingsSource.MANUAL)
            .manualCurrentSavings(new BigDecimal("2000000.0000")) // ₹20L
            .currentAge(30)
            .monthlySavings(new BigDecimal("50000.0000")) // ₹50k/mo
            .expectedAnnualReturnPct(new BigDecimal("12.00")) // 12% CAGR
            .annualExpensesInRetirement(new BigDecimal("1000000.0000")) // ₹10L/yr
            .safeWithdrawalRatePct(new BigDecimal("4.00")) // 4% SWR (25x)
            .expectedAnnualInflationPct(new BigDecimal("6.00"))
            .activeMode(FireCalculationMode.YEARS_TO_FIRE)
            .build();

        String json = objectMapper.writeValueAsString(req);

        String resJson = mockMvc.perform(put("/api/v1/fire/plan")
                .contentType(MediaType.APPLICATION_JSON)
                .content(json))
            .andExpect(status().isOk())
            .andReturn().getResponse().getContentAsString();

        FireSummaryDto summary = objectMapper.readValue(resJson, FireSummaryDto.class);

        assertThat(summary.getCalculation().getFireNumber()).isEqualByComparingTo("25000000.0000"); // 10L * 25
        assertThat(summary.getCalculation().getSwrMultiple()).isEqualByComparingTo("25.00");
        assertThat(summary.getCalculation().getYearsToFire()).isNotNull();
        assertThat(summary.getCalculation().getComputedRetirementAge()).isGreaterThan(30);
        assertThat(summary.getProjections()).isNotEmpty();
    }

    @Test
    @WithMockUser(username = TEST_USER)
    void testMode2RequiredSavings() throws Exception {
        UpdateFirePlanRequest req = UpdateFirePlanRequest.builder()
            .currentSavingsSource(FireSavingsSource.MANUAL)
            .manualCurrentSavings(new BigDecimal("1000000.0000"))
            .currentAge(30)
            .targetRetirementAge(45) // 15-year horizon
            .expectedAnnualReturnPct(new BigDecimal("12.00"))
            .annualExpensesInRetirement(new BigDecimal("1200000.0000"))
            .safeWithdrawalRatePct(new BigDecimal("4.00"))
            .expectedAnnualInflationPct(new BigDecimal("6.00"))
            .activeMode(FireCalculationMode.REQUIRED_SAVINGS)
            .build();

        String json = objectMapper.writeValueAsString(req);

        String resJson = mockMvc.perform(put("/api/v1/fire/plan")
                .contentType(MediaType.APPLICATION_JSON)
                .content(json))
            .andExpect(status().isOk())
            .andReturn().getResponse().getContentAsString();

        FireSummaryDto summary = objectMapper.readValue(resJson, FireSummaryDto.class);

        assertThat(summary.getCalculation().getFireNumber()).isEqualByComparingTo("30000000.0000"); // 12L * 25
        assertThat(summary.getCalculation().getRequiredMonthlySavings()).isGreaterThan(BigDecimal.ZERO);
        assertThat(summary.getCalculation().getComputedRetirementAge()).isEqualTo(45);
    }

    @Test
    @WithMockUser(username = TEST_USER)
    void testSampleDataSeeder() throws Exception {
        mockMvc.perform(post("/api/v1/fire/seed"))
            .andExpect(status().isOk());

        String resJson = mockMvc.perform(get("/api/v1/fire/plan"))
            .andExpect(status().isOk())
            .andReturn().getResponse().getContentAsString();

        FireSummaryDto summary = objectMapper.readValue(resJson, FireSummaryDto.class);

        assertThat(summary.getPlan().getEffectiveCurrentSavings()).isEqualByComparingTo("2500000.0000");
        assertThat(summary.getCalculation().getFireNumber()).isEqualByComparingTo("30000000.0000");
    }
}
