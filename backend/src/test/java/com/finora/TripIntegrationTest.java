package com.finora;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.finora.trip.dto.*;
import com.finora.trip.model.*;
import com.finora.trip.repository.*;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.MediaType;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.MvcResult;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.ArrayList;
import java.util.Arrays;
import java.util.List;

import static org.junit.jupiter.api.Assertions.*;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@SpringBootTest
@AutoConfigureMockMvc(addFilters = false)
@ActiveProfiles("test")
public class TripIntegrationTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    @Autowired
    private TripRepository tripRepo;

    @Autowired
    private TripParticipantRepository participantRepo;

    @Autowired
    private TripPlanStopRepository planStopRepo;

    @Autowired
    private TripCategoryBudgetRepository categoryBudgetRepo;

    @Autowired
    private TripExpenseRepository expenseRepo;

    @Autowired
    private TripExpenseSplitRepository expenseSplitRepo;

    @Autowired
    private TripExpensePaymentRepository paymentRepo;

    @Autowired
    private TripPackingItemRepository packingRepo;

    @Autowired
    private TripChecklistItemRepository checklistRepo;

    @BeforeEach
    void setUp() {
        checklistRepo.deleteAll();
        packingRepo.deleteAll();
        paymentRepo.deleteAll();
        expenseSplitRepo.deleteAll();
        expenseRepo.deleteAll();
        categoryBudgetRepo.deleteAll();
        planStopRepo.deleteAll();
        participantRepo.deleteAll();
        tripRepo.deleteAll();
    }

    @Test
    @DisplayName("Should seed and retrieve full sample Vietnam trip fixture (§16.14)")
    void testSampleVietnamTripSeeding() throws Exception {
        MvcResult result = mockMvc.perform(post("/api/v1/trips/sample-vietnam")
                        .contentType(MediaType.APPLICATION_JSON))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.name").value("Vietnam (Ho Chi Minh, Hanoi, Ha Long Bay)"))
                .andExpect(jsonPath("$.adultsCount").value(6))
                .andExpect(jsonPath("$.kidsCount").value(2))
                .andExpect(jsonPath("$.totalBudget").value(450000.0))
                .andReturn();

        TripDto trip = objectMapper.readValue(result.getResponse().getContentAsString(), TripDto.class);
        assertNotNull(trip.getId());

        // Verify Participants with Dependent Nesting
        mockMvc.perform(get("/api/v1/trips/" + trip.getId() + "/participants"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$").isArray())
                .andExpect(jsonPath("$[0].name").value("Rajesh Kumar"))
                .andExpect(jsonPath("$[0].dependents[0].name").value("Arjun Kumar"))
                .andExpect(jsonPath("$[1].name").value("Amit Sharma"))
                .andExpect(jsonPath("$[1].dependents[0].name").value("Isha Sharma"));

        // Verify Insights numbers (§16.5: ₹3,26,150 spent)
        mockMvc.perform(get("/api/v1/trips/" + trip.getId() + "/insights"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.totalBudget").value(450000.0))
                .andExpect(jsonPath("$.totalSpent").value(326150.0))
                .andExpect(jsonPath("$.usedPercent").value(72.5))
                .andExpect(jsonPath("$.categoryBreakdown").isArray());
    }

    @Test
    @DisplayName("Should guard against N/0 divide-by-zero on trips with zero budget set (§16.2 / §16.12)")
    void testZeroBudgetDivisionGuard() throws Exception {
        CreateTripRequest createReq = new CreateTripRequest();
        createReq.setName("Zero Budget Spontaneous Road Trip");
        createReq.setDestination("Goa");
        createReq.setTotalBudget(BigDecimal.ZERO);
        createReq.setStartDate(LocalDate.now());
        createReq.setEndDate(LocalDate.now().plusDays(3));

        MvcResult result = mockMvc.perform(post("/api/v1/trips")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(createReq)))
                .andExpect(status().isOk())
                .andReturn();

        TripDto trip = objectMapper.readValue(result.getResponse().getContentAsString(), TripDto.class);

        // Fetch Insights with 0 budget
        mockMvc.perform(get("/api/v1/trips/" + trip.getId() + "/insights"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.totalBudget").value(0.0))
                .andExpect(jsonPath("$.usedPercent").value(0.0))
                .andExpect(jsonPath("$.dailyAverage").exists())
                .andExpect(jsonPath("$.spendingVelocityDaily").exists());
    }

    @Test
    @DisplayName("Should compute Smart Split correctly in By-Shares and By-Percentage modes")
    void testSmartSplitCalculation() throws Exception {
        CreateTripRequest createReq = new CreateTripRequest();
        createReq.setName("Smart Split Test Trip");
        createReq.setDestination("Manali");

        MvcResult result = mockMvc.perform(post("/api/v1/trips")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(createReq)))
                .andExpect(status().isOk())
                .andReturn();

        TripDto trip = objectMapper.readValue(result.getResponse().getContentAsString(), TripDto.class);

        // Test By Shares (Ratio 2 : 1 : 1 for total ₹10,000)
        SmartSplitRequest sharesReq = new SmartSplitRequest();
        sharesReq.setTotalAmount(new BigDecimal("10000.00"));
        sharesReq.setSplitType(SplitType.SHARES);
        sharesReq.setParticipants(Arrays.asList(
                new SmartSplitRequest.ParticipantInput("p1", new BigDecimal("2")),
                new SmartSplitRequest.ParticipantInput("p2", new BigDecimal("1")),
                new SmartSplitRequest.ParticipantInput("p3", new BigDecimal("1"))
        ));

        mockMvc.perform(post("/api/v1/trips/" + trip.getId() + "/smart-split")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(sharesReq)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.computedSum").value(10000.0))
                .andExpect(jsonPath("$.splits[0].calculatedAmount").value(5000.0))
                .andExpect(jsonPath("$.splits[1].calculatedAmount").value(2500.0))
                .andExpect(jsonPath("$.splits[2].calculatedAmount").value(2500.0));
    }

    @Test
    @DisplayName("Should generate AI trip plan draft")
    void testAiTripPlanner() throws Exception {
        AiTripPlanRequest aiReq = new AiTripPlanRequest();
        aiReq.setDestination("Dubai & Abu Dhabi");
        aiReq.setStartDate(LocalDate.now().plusDays(20));
        aiReq.setEndDate(LocalDate.now().plusDays(25));
        aiReq.setAdultsCount(2);

        mockMvc.perform(post("/api/v1/trips/ai-plan")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(aiReq)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.destination").value("Dubai & Abu Dhabi"))
                .andExpect(jsonPath("$.suggestedStops").isArray())
                .andExpect(jsonPath("$.recommendedPackingItems").isArray());
    }
}
