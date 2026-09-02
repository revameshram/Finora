package com.finora;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.finora.emi.dto.*;
import com.finora.emi.model.LoanStatus;
import com.finora.emi.model.LoanType;
import com.finora.emi.model.PrepaymentImpact;
import com.finora.emi.model.PrepaymentType;
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
public class EmiIntegrationTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    @Test
    public void testCreateLoanAndSyncNetWorth() throws Exception {
        CreateLoanRequest req = CreateLoanRequest.builder()
                .loanName("Axis Bank Home Loan")
                .loanType(LoanType.HOME_LOAN)
                .lenderName("Axis Bank")
                .accountNumberMasked("•••• •••• 1234")
                .sanctionedAmount(new BigDecimal("4000000.00"))
                .annualInterestRate(new BigDecimal("8.75"))
                .tenureMonths(180)
                .startDate(LocalDate.of(2026, 1, 1))
                .syncWithNetWorth(true)
                .notes("Primary flat mortgage")
                .build();

        mockMvc.perform(post("/api/v1/emi/loans")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(req)))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.id", notNullValue()))
                .andExpect(jsonPath("$.loanName", is("Axis Bank Home Loan")))
                .andExpect(jsonPath("$.sanctionedAmount", is(4000000.00)))
                .andExpect(jsonPath("$.monthlyEmi", notNullValue()))
                .andExpect(jsonPath("$.isLinked", is(true)))
                .andExpect(jsonPath("$.linkedNetWorthLiabilityId", notNullValue()));
    }

    @Test
    public void testAmortizationScheduleAndPrepayment() throws Exception {
        // 1. Create a Loan
        CreateLoanRequest req = CreateLoanRequest.builder()
                .loanName("Personal Loan Test")
                .loanType(LoanType.PERSONAL_LOAN)
                .sanctionedAmount(new BigDecimal("500000.00"))
                .annualInterestRate(new BigDecimal("12.00"))
                .tenureMonths(36)
                .startDate(LocalDate.of(2026, 1, 1))
                .build();

        String res = mockMvc.perform(post("/api/v1/emi/loans")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(req)))
                .andExpect(status().isCreated())
                .andReturn().getResponse().getContentAsString();

        LoanDto loan = objectMapper.readValue(res, LoanDto.class);

        // 2. Fetch Amortization Schedule
        mockMvc.perform(get("/api/v1/emi/loans/" + loan.getId() + "/amortization"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.originalTenureMonths", is(36)))
                .andExpect(jsonPath("$.monthlySchedules", hasSize(36)))
                .andExpect(jsonPath("$.yearlySchedules", notNullValue()));

        // 3. Add Prepayment of ₹1,00,000 at month 6 with Tenure Reduction
        AddPrepaymentRequest prepayReq = AddPrepaymentRequest.builder()
                .paymentDate(LocalDate.of(2026, 7, 1))
                .amount(new BigDecimal("100000.00"))
                .prepaymentType(PrepaymentType.ONE_TIME)
                .impact(PrepaymentImpact.REDUCE_TENURE)
                .notes("Partial bonus prepayment")
                .build();

        mockMvc.perform(post("/api/v1/emi/loans/" + loan.getId() + "/prepayments")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(prepayReq)))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.amount", is(100000.00)));

        // 4. Verify shortened tenure and interest saved
        mockMvc.perform(get("/api/v1/emi/loans/" + loan.getId() + "/amortization"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.actualTenureMonths", lessThan(36)))
                .andExpect(jsonPath("$.monthsSaved", greaterThan(0)))
                .andExpect(jsonPath("$.totalInterestSaved", greaterThan(0.0)));
    }

    @Test
    public void testStandaloneCalculator() throws Exception {
        StandaloneEmiCalculateRequest req = StandaloneEmiCalculateRequest.builder()
                .principalAmount(new BigDecimal("1000000.00"))
                .annualInterestRate(new BigDecimal("10.00"))
                .tenureMonths(120)
                .build();

        mockMvc.perform(post("/api/v1/emi/calculate")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(req)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.monthlyEmi", notNullValue()))
                .andExpect(jsonPath("$.totalInterestPayable", notNullValue()))
                .andExpect(jsonPath("$.totalPaymentPayable", notNullValue()))
                .andExpect(jsonPath("$.principalPercentage", notNullValue()));
    }

    @Test
    public void testSeedSampleLoans() throws Exception {
        mockMvc.perform(post("/api/v1/emi/seed-sample"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$", hasSize(2)))
                .andExpect(jsonPath("$[0].loanName", containsString("Home Loan")))
                .andExpect(jsonPath("$[1].loanName", containsString("Car Loan")));
    }
}
