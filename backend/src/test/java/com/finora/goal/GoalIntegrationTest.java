package com.finora.goal;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.finora.goal.dto.*;
import com.finora.goal.model.*;
import com.finora.goal.repository.*;
import com.finora.goal.service.GoalService;
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
import java.time.LocalDate;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

import static org.assertj.core.api.Assertions.assertThat;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@SpringBootTest
@AutoConfigureMockMvc
@ActiveProfiles("test")
@Transactional
public class GoalIntegrationTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    @Autowired
    private GoalRepository goalRepository;

    @Autowired
    private GoalContributionRepository contributionRepository;

    @Autowired
    private GoalTagRepository tagRepository;

    @Autowired
    private GoalService goalService;

    private static final String TEST_USER = "demo-user";

    @BeforeEach
    void setUp() {
        tagRepository.deleteAll();
        contributionRepository.deleteAll();
        goalRepository.deleteAll();
    }

    @Test
    @WithMockUser(username = TEST_USER)
    void testCreateGoalAndMathEngine() throws Exception {
        CreateGoalRequest req = CreateGoalRequest.builder()
            .name("Emergency Fund Shield")
            .category(GoalCategory.EMERGENCY_FUND)
            .priority(GoalPriority.HIGH)
            .targetAmount(new BigDecimal("500000.0000"))
            .targetIsFutureValue(false) // Compounded with 6% inflation
            .targetDate(LocalDate.now().plusMonths(12))
            .inflationRatePct(new BigDecimal("6.00"))
            .expectedAnnualReturnPct(new BigDecimal("8.00"))
            .startingBalance(new BigDecimal("100000.0000"))
            .accountLabel("HDFC Liquid Fund")
            .notes("6-month cushion")
            .build();

        String json = objectMapper.writeValueAsString(req);

        String responseJson = mockMvc.perform(post("/api/v1/goals")
                .contentType(MediaType.APPLICATION_JSON)
                .content(json))
            .andExpect(status().isOk())
            .andReturn().getResponse().getContentAsString();

        GoalDto dto = objectMapper.readValue(responseJson, GoalDto.class);

        assertThat(dto.getName()).isEqualTo("Emergency Fund Shield");
        assertThat(dto.getCurrentValue()).isEqualByComparingTo("100000.0000");
        assertThat(dto.getAdjustedFutureValue()).isGreaterThan(new BigDecimal("500000.0000")); // Compounded
        assertThat(dto.getRequiredMonthlyContribution()).isGreaterThan(BigDecimal.ZERO);
    }

    @Test
    @WithMockUser(username = TEST_USER)
    void testSingleAndBulkContributions() throws Exception {
        Goal g1 = goalRepository.save(Goal.builder()
            .userId(TEST_USER)
            .name("Vacation Fund")
            .category(GoalCategory.VACATION)
            .targetAmount(new BigDecimal("100000.0000"))
            .targetDate(LocalDate.now().plusMonths(6))
            .startingBalance(new BigDecimal("20000.0000"))
            .currentValue(new BigDecimal("20000.0000"))
            .status(GoalStatus.ACTIVE)
            .build());

        Goal g2 = goalRepository.save(Goal.builder()
            .userId(TEST_USER)
            .name("Car Fund")
            .category(GoalCategory.CAR_PURCHASE)
            .targetAmount(new BigDecimal("300000.0000"))
            .targetDate(LocalDate.now().plusMonths(12))
            .startingBalance(new BigDecimal("50000.0000"))
            .currentValue(new BigDecimal("50000.0000"))
            .status(GoalStatus.ACTIVE)
            .build());

        // 1. Single contribution to G1
        CreateContributionRequest contribReq = CreateContributionRequest.builder()
            .goalId(g1.getId())
            .type(GoalContributionType.CONTRIBUTION)
            .amount(new BigDecimal("10000.0000"))
            .date(LocalDate.now())
            .note("Bonus save")
            .build();

        mockMvc.perform(post("/api/v1/goals/" + g1.getId() + "/contribute")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(contribReq)))
            .andExpect(status().isOk());

        Goal updatedG1 = goalRepository.findById(g1.getId()).orElseThrow();
        assertThat(updatedG1.getCurrentValue()).isEqualByComparingTo("30000.0000");

        // 2. Bulk contribution with Split %
        Map<String, BigDecimal> pcts = new HashMap<>();
        pcts.put(g1.getId(), new BigDecimal("40.00"));
        pcts.put(g2.getId(), new BigDecimal("60.00"));

        BulkContributionRequest bulkReq = BulkContributionRequest.builder()
            .mode("SPLIT_PCT")
            .totalAmount(new BigDecimal("50000.0000"))
            .date(LocalDate.now())
            .note("Monthly paycheck allocation")
            .goalPercentages(pcts)
            .build();

        mockMvc.perform(post("/api/v1/goals/bulk-contribute")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(bulkReq)))
            .andExpect(status().isOk());

        // G1 should have 30,000 + 20,000 = 50,000
        Goal finalG1 = goalRepository.findById(g1.getId()).orElseThrow();
        assertThat(finalG1.getCurrentValue()).isEqualByComparingTo("50000.0000");

        // G2 should have 50,000 + 30,000 = 80,000
        Goal finalG2 = goalRepository.findById(g2.getId()).orElseThrow();
        assertThat(finalG2.getCurrentValue()).isEqualByComparingTo("80000.0000");
    }

    @Test
    @WithMockUser(username = TEST_USER)
    void testGoalTagDoesNotMutateGoalBalance() {
        Goal g = goalRepository.save(Goal.builder()
            .userId(TEST_USER)
            .name("Home Loan Equity")
            .category(GoalCategory.HOME_DOWNPAYMENT)
            .targetAmount(new BigDecimal("1000000.0000"))
            .targetDate(LocalDate.now().plusMonths(24))
            .startingBalance(new BigDecimal("100000.0000"))
            .currentValue(new BigDecimal("100000.0000"))
            .build());

        // Tag an expense transaction
        GoalTag tag = GoalTag.builder()
            .goalId(g.getId())
            .expenseTransactionId("et-tx-999")
            .build();
        tagRepository.save(tag);

        // Verify balance remains exactly ₹1,00,000
        Goal fetched = goalRepository.findById(g.getId()).orElseThrow();
        assertThat(fetched.getCurrentValue()).isEqualByComparingTo("100000.0000");
        assertThat(tagRepository.findByGoalId(g.getId())).hasSize(1);
    }

    @Test
    @WithMockUser(username = TEST_USER)
    void testDashboardSummaryAndSampleSeeder() throws Exception {
        // Seed sample data
        mockMvc.perform(post("/api/v1/goals/seed"))
            .andExpect(status().isOk());

        // Fetch dashboard
        String dashJson = mockMvc.perform(get("/api/v1/goals/dashboard"))
            .andExpect(status().isOk())
            .andReturn().getResponse().getContentAsString();

        GoalDashboardSummaryDto dash = objectMapper.readValue(dashJson, GoalDashboardSummaryDto.class);

        assertThat(dash.getActiveGoalsCount()).isGreaterThanOrEqualTo(4);
        assertThat(dash.getTotalSavedAmount()).isGreaterThan(BigDecimal.ZERO);
        assertThat(dash.getAllocationByCategory()).isNotEmpty();
    }
}
