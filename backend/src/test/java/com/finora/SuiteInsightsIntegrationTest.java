package com.finora;

import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;

import static org.hamcrest.Matchers.*;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@SpringBootTest
@AutoConfigureMockMvc
class SuiteInsightsIntegrationTest {

    @Autowired
    private MockMvc mockMvc;

    @Test
    void testGetSuiteInsightsEndpoint() throws Exception {
        mockMvc.perform(get("/api/v1/insights/suite")
                        .contentType(MediaType.APPLICATION_JSON))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.healthScore.overallScore", greaterThan(0)))
                .andExpect(jsonPath("$.healthScore.statusTier", notNullValue()))
                .andExpect(jsonPath("$.healthScore.cashFlowScore", greaterThan(0)))
                .andExpect(jsonPath("$.healthScore.solvencyScore", greaterThan(0)))
                .andExpect(jsonPath("$.keyMetrics", hasSize(greaterThan(0))))
                .andExpect(jsonPath("$.recommendations", hasSize(greaterThan(0))))
                .andExpect(jsonPath("$.executiveSummary", notNullValue()));
    }
}
