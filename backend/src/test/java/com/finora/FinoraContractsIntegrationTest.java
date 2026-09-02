package com.finora;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.finora.common.linking.model.SourceModule;
import com.finora.networth.contract.dto.CreateLiabilityRequest;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;

import java.math.BigDecimal;

import static org.hamcrest.Matchers.*;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@SpringBootTest
@AutoConfigureMockMvc
class FinoraContractsIntegrationTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    @Test
    void testExpenseSummaryContractEndpoint() throws Exception {
        mockMvc.perform(get("/api/v1/expenses/summary")
                        .param("month", "2026-08")
                        .contentType(MediaType.APPLICATION_JSON))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.period", is("2026-08")))
                .andExpect(jsonPath("$.totalIncome", is(185000.00)))
                .andExpect(jsonPath("$.totalOutflow", is(92500.00)))
                .andExpect(jsonPath("$.netSavings", is(92500.00)))
                .andExpect(jsonPath("$.savingsRate", is(50.00)))
                .andExpect(jsonPath("$.trailing12MonthAnnualSpend", is(1050000.00)))
                .andExpect(jsonPath("$.currency", is("INR")))
                .andExpect(jsonPath("$.topCategories", hasSize(greaterThan(0))));
    }

    @Test
    void testGoalLinkedTransactionsContractEndpoint() throws Exception {
        mockMvc.perform(get("/api/v1/expenses/goal-linked")
                        .param("goalId", "goal_fire_01")
                        .contentType(MediaType.APPLICATION_JSON))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$", hasSize(2)))
                .andExpect(jsonPath("$[0].linkedGoalId", is("goal_fire_01")))
                .andExpect(jsonPath("$[0].sourceModule", is("EXPENSE")))
                .andExpect(jsonPath("$[0].isIncluded", is(true)));
    }

    @Test
    void testNetWorthLiabilitiesContractEndpoint() throws Exception {
        mockMvc.perform(get("/api/v1/networth/liabilities")
                        .contentType(MediaType.APPLICATION_JSON))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$", hasSize(greaterThanOrEqualTo(2))))
                .andExpect(jsonPath("$[0].name", is("HDFC Home Loan")))
                .andExpect(jsonPath("$[0].sourceModule", is("EMI_MANAGER")))
                .andExpect(jsonPath("$[0].isLinked", is(true)));
    }

    @Test
    void testPushNewLiabilityFromEmiManagerContractEndpoint() throws Exception {
        CreateLiabilityRequest request = CreateLiabilityRequest.builder()
                .name("SBI Personal Loan")
                .category("PERSONAL_LOAN")
                .balance(new BigDecimal("200000.00"))
                .originalAmount(new BigDecimal("200000.00"))
                .interestRate(new BigDecimal("11.50"))
                .sourceModule(SourceModule.EMI_MANAGER)
                .sourceEntityId("emi_loan_202")
                .isIncluded(true)
                .build();

        mockMvc.perform(post("/api/v1/networth/liabilities")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.id", notNullValue()))
                .andExpect(jsonPath("$.name", is("SBI Personal Loan")))
                .andExpect(jsonPath("$.balance", is(200000.00)))
                .andExpect(jsonPath("$.isLinked", is(true)))
                .andExpect(jsonPath("$.sourceModule", is("EMI_MANAGER")))
                .andExpect(jsonPath("$.sourceEntityId", is("emi_loan_202")));
    }
}
