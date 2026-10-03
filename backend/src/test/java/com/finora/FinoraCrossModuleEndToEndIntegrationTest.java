package com.finora;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.finora.common.auth.security.UserPrincipal;
import com.finora.common.linking.model.SourceModule;
import com.finora.emi.dto.AddPrepaymentRequest;
import com.finora.emi.dto.CreateLoanRequest;
import com.finora.emi.dto.LoanDto;
import com.finora.emi.model.LoanType;
import com.finora.emi.model.PrepaymentImpact;
import com.finora.emi.model.PrepaymentType;
import com.finora.expense.contract.dto.ExpenseSummaryDto;
import com.finora.expense.dto.CreateIncomeRequest;
import com.finora.expense.dto.CreateTransactionRequest;
import com.finora.expense.model.ExpenseCategory;
import com.finora.expense.model.TransactionStatus;
import com.finora.fire.dto.FireSummaryDto;
import com.finora.fire.dto.UpdateFirePlanRequest;
import com.finora.fire.model.FireCalculationMode;
import com.finora.fire.model.FireSavingsSource;
import com.finora.goal.dto.CreateGoalRequest;
import com.finora.goal.dto.GoalDashboardSummaryDto;
import com.finora.goal.dto.GoalDetailResponse;
import com.finora.goal.dto.GoalDto;
import com.finora.goal.model.GoalCategory;
import com.finora.goal.model.GoalPriority;
import com.finora.networth.contract.dto.NetWorthLiabilityDto;
import com.finora.networth.dto.AssetDto;
import com.finora.networth.dto.CreateAssetRequest;
import com.finora.networth.dto.UpdateAssetRequest;
import com.finora.networth.model.AssetCategory;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.MediaType;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.MvcResult;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.YearMonth;
import java.util.List;

import static org.assertj.core.api.Assertions.assertThat;
import static org.hamcrest.Matchers.*;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@SpringBootTest
@AutoConfigureMockMvc
@Transactional
public class FinoraCrossModuleEndToEndIntegrationTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    private static final String TEST_USER_ID = "usr_e2e_tester_001";

    private void authenticateTestUser() {
        UserPrincipal principal = UserPrincipal.builder()
                .id(TEST_USER_ID)
                .email("e2e@finora.local")
                .fullName("E2E Test User")
                .build();
        SecurityContextHolder.getContext().setAuthentication(
                new UsernamePasswordAuthenticationToken(principal, null, principal.getAuthorities())
        );
    }

    // =========================================================================
    // Scenario 1: Delink behavior on Portfolio-linked Asset & Goal-linked Expense
    // =========================================================================

    @Test
    @DisplayName("Scenario 1A: Delink behavior on a Portfolio-linked Net Worth asset")
    void testPortfolioLinkedAssetDelinkBehavior() throws Exception {
        authenticateTestUser();

        // 1. Create an Asset in Net Worth Tracker
        CreateAssetRequest createReq = CreateAssetRequest.builder()
                .name("HDFC Top 100 Index Fund")
                .category(AssetCategory.INVESTMENTS)
                .value(new BigDecimal("250000.00"))
                .build();

        MvcResult createRes = mockMvc.perform(post("/api/v1/networth/assets")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(createReq)))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.id", notNullValue()))
                .andExpect(jsonPath("$.value", is(250000.00)))
                .andReturn();

        AssetDto createdAsset = objectMapper.readValue(
                createRes.getResponse().getContentAsString(),
                AssetDto.class
        );

        // 2. Perform Delink operation
        MvcResult delinkRes = mockMvc.perform(post("/api/v1/networth/assets/" + createdAsset.getId() + "/delink")
                        .contentType(MediaType.APPLICATION_JSON))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.isLinked", is(false)))
                .andExpect(jsonPath("$.sourceModule", is("MANUAL")))
                .andExpect(jsonPath("$.sourceEntityId", nullValue()))
                .andExpect(jsonPath("$.value", is(250000.00))) // Preserves frozen valuation
                .andReturn();

        AssetDto delinkedAsset = objectMapper.readValue(
                delinkRes.getResponse().getContentAsString(),
                AssetDto.class
        );

        assertThat(delinkedAsset.isLinked()).isFalse();
        assertThat(delinkedAsset.getSourceModule()).isEqualTo(SourceModule.MANUAL);
        assertThat(delinkedAsset.getSourceEntityId()).isNull();
        assertThat(delinkedAsset.getValue()).isEqualByComparingTo("250000.00");

        // 3. Verify asset is now independently editable without altering source
        UpdateAssetRequest updateReq = UpdateAssetRequest.builder()
                .name("HDFC Top 100 Index Fund (Manual Post-Delink)")
                .category(AssetCategory.INVESTMENTS)
                .value(new BigDecimal("275000.00"))
                .build();

        mockMvc.perform(put("/api/v1/networth/assets/" + delinkedAsset.getId())
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(updateReq)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.name", is("HDFC Top 100 Index Fund (Manual Post-Delink)")))
                .andExpect(jsonPath("$.value", is(275000.00)))
                .andExpect(jsonPath("$.isLinked", is(false)))
                .andExpect(jsonPath("$.sourceModule", is("MANUAL")));
    }

    @Test
    @DisplayName("Scenario 1B: Goal-linked Expense transaction association & non-mutating reporting rule")
    void testGoalLinkedExpenseTransactionAssociationAndNonMutatingRule() throws Exception {
        authenticateTestUser();

        // 1. Create a Goal in Goal Manager
        CreateGoalRequest goalReq = CreateGoalRequest.builder()
                .name("Down Payment Sinking Fund")
                .category(GoalCategory.HOME_DOWNPAYMENT)
                .priority(GoalPriority.HIGH)
                .targetAmount(new BigDecimal("1000000.00"))
                .targetIsFutureValue(true)
                .targetDate(LocalDate.now().plusMonths(24))
                .startingBalance(new BigDecimal("200000.00"))
                .inflationRatePct(new BigDecimal("6.00"))
                .expectedAnnualReturnPct(new BigDecimal("10.00"))
                .build();

        MvcResult goalRes = mockMvc.perform(post("/api/v1/goals")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(goalReq)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.id", notNullValue()))
                .andExpect(jsonPath("$.currentValue", is(200000.00)))
                .andReturn();

        GoalDto createdGoal = objectMapper.readValue(
                goalRes.getResponse().getContentAsString(),
                GoalDto.class
        );
        String goalId = createdGoal.getId();

        // 2. Create an Expense transaction tagged with linkedGoalId
        String currentMonth = YearMonth.now().toString();
        CreateTransactionRequest txReq = new CreateTransactionRequest();
        txReq.setBudgetMonth(currentMonth);
        txReq.setItem("Sinking Fund Transfer to Real Estate");
        txReq.setAmount(new BigDecimal("25000.00"));
        txReq.setCategory(ExpenseCategory.INVESTMENT);
        txReq.setPaymentMethod("NET_BANKING");
        txReq.setStatus(TransactionStatus.DONE);
        txReq.setIncluded(true);
        txReq.setLinkedGoalId(goalId);

        mockMvc.perform(post("/api/v1/expenses/transactions")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(txReq)))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.id", notNullValue()))
                .andExpect(jsonPath("$.linkedGoalId", is(goalId)));

        // 3. Query Goal-Linked Transactions Contract endpoint
        mockMvc.perform(get("/api/v1/expenses/goal-linked")
                        .param("goalId", goalId)
                        .contentType(MediaType.APPLICATION_JSON))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$", hasSize(1)))
                .andExpect(jsonPath("$[0].linkedGoalId", is(goalId)))
                .andExpect(jsonPath("$[0].amount", is(25000.00)))
                .andExpect(jsonPath("$[0].sourceModule", is("EXPENSE")));

        // 4. Verify Domain Rule: Tagged transactions associate for reporting only and NEVER mutate goal balance
        MvcResult goalCheckRes = mockMvc.perform(get("/api/v1/goals/" + goalId)
                        .contentType(MediaType.APPLICATION_JSON))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.goal.currentValue", is(200000.00))) // Unaltered! Still 200,000, not 225,000
                .andReturn();

        GoalDetailResponse verifiedGoalResponse = objectMapper.readValue(
                goalCheckRes.getResponse().getContentAsString(),
                GoalDetailResponse.class
        );
        assertThat(verifiedGoalResponse.getGoal().getCurrentValue()).isEqualByComparingTo("200000.00");
    }

    // =========================================================================
    // Scenario 2: EMI Manager -> Net Worth Tracker Liability Sync
    // =========================================================================

    @Test
    @DisplayName("Scenario 2: EMI Manager pushes loans and syncs liabilities to Net Worth Tracker")
    void testEmiManagerToNetWorthLiabilitySync() throws Exception {
        authenticateTestUser();

        // 1. Create a Loan in EMI Manager
        CreateLoanRequest loanReq = CreateLoanRequest.builder()
                .loanName("HDFC Premier Home Loan")
                .loanType(LoanType.HOME_LOAN)
                .sanctionedAmount(new BigDecimal("4500000.00"))
                .annualInterestRate(new BigDecimal("8.50"))
                .tenureMonths(240)
                .startDate(LocalDate.now())
                .lenderName("HDFC Bank")
                .syncWithNetWorth(true)
                .notes("Primary home loan synchronized with Net Worth")
                .build();

        MvcResult loanRes = mockMvc.perform(post("/api/v1/emi/loans")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(loanReq)))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.id", notNullValue()))
                .andExpect(jsonPath("$.monthlyEmi", greaterThan(0.0)))
                .andReturn();

        LoanDto createdLoan = objectMapper.readValue(
                loanRes.getResponse().getContentAsString(),
                LoanDto.class
        );

        // 2. Verify liability automatically synchronized into Net Worth Tracker
        MvcResult nwLiabilitiesRes = mockMvc.perform(get("/api/v1/networth/liabilities")
                        .contentType(MediaType.APPLICATION_JSON))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$", hasSize(greaterThanOrEqualTo(1))))
                .andReturn();

        List<NetWorthLiabilityDto> liabilities = objectMapper.readValue(
                nwLiabilitiesRes.getResponse().getContentAsString(),
                objectMapper.getTypeFactory().constructCollectionType(List.class, NetWorthLiabilityDto.class)
        );

        NetWorthLiabilityDto syncedLiability = liabilities.stream()
                .filter(l -> createdLoan.getId().equals(l.getSourceEntityId()))
                .findFirst()
                .orElse(null);

        assertThat(syncedLiability).isNotNull();
        assertThat(syncedLiability.getName()).isEqualTo("HDFC Premier Home Loan");
        assertThat(syncedLiability.getSourceModule()).isEqualTo(SourceModule.EMI_MANAGER);
        assertThat(syncedLiability.isLinked()).isTrue();
        assertThat(syncedLiability.getBalance()).isEqualByComparingTo("4500000.00");

        // 3. Record Prepayment in EMI Manager
        AddPrepaymentRequest prepayReq = AddPrepaymentRequest.builder()
                .amount(new BigDecimal("500000.00"))
                .paymentDate(LocalDate.now())
                .prepaymentType(PrepaymentType.ONE_TIME)
                .impact(PrepaymentImpact.REDUCE_TENURE)
                .notes("Annual bonus prepayment")
                .build();

        mockMvc.perform(post("/api/v1/emi/loans/" + createdLoan.getId() + "/prepayments")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(prepayReq)))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.amount", is(500000.00)));

        // 4. Verify loan schedule and total interest recalculated
        mockMvc.perform(get("/api/v1/emi/loans/" + createdLoan.getId()))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.totalPrepaymentPaid", is(500000.00)))
                .andExpect(jsonPath("$.totalInterestPayable", greaterThan(0.0)));
    }

    // =========================================================================
    // Scenario 3: Goal Manager & FIRE Planner Reading Real Expense Tracker Data
    // =========================================================================

    @Test
    @DisplayName("Scenario 3: Goal Manager & FIRE Planner read real Expense Tracker contract data")
    void testGoalAndFireReadingRealExpenseData() throws Exception {
        authenticateTestUser();

        String activeMonth = YearMonth.now().toString();

        // 1. Seed Real Income in Expense Tracker
        CreateIncomeRequest incReq = new CreateIncomeRequest(
                activeMonth,
                "Primary Tech Salary",
                new BigDecimal("200000.00"),
                "HDFC Salary Account"
        );

        mockMvc.perform(post("/api/v1/expenses/incomes")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(incReq)))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.amount", is(200000.00)));

        // 2. Seed Real Expense Outflows in Expense Tracker
        CreateTransactionRequest rentTx = new CreateTransactionRequest();
        rentTx.setBudgetMonth(activeMonth);
        rentTx.setItem("Apartment Rental");
        rentTx.setAmount(new BigDecimal("50000.00"));
        rentTx.setCategory(ExpenseCategory.HOUSING);
        rentTx.setPaymentMethod("NET_BANKING");
        rentTx.setStatus(TransactionStatus.DONE);
        rentTx.setIncluded(true);

        CreateTransactionRequest groceryTx = new CreateTransactionRequest();
        groceryTx.setBudgetMonth(activeMonth);
        groceryTx.setItem("Groceries & Provisions");
        groceryTx.setAmount(new BigDecimal("30000.00"));
        groceryTx.setCategory(ExpenseCategory.FOOD_GROCERIES);
        groceryTx.setPaymentMethod("UPI");
        groceryTx.setStatus(TransactionStatus.DONE);
        groceryTx.setIncluded(true);

        mockMvc.perform(post("/api/v1/expenses/transactions")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(rentTx)))
                .andExpect(status().isCreated());

        mockMvc.perform(post("/api/v1/expenses/transactions")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(groceryTx)))
                .andExpect(status().isCreated());

        // 3. Verify Real Expense Summary Contract Endpoint
        MvcResult summaryRes = mockMvc.perform(get("/api/v1/expenses/summary")
                        .param("month", activeMonth)
                        .contentType(MediaType.APPLICATION_JSON))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.totalIncome", is(200000.00)))
                .andExpect(jsonPath("$.totalOutflow", is(80000.00)))
                .andExpect(jsonPath("$.netSavings", is(120000.00)))
                .andExpect(jsonPath("$.savingsRate", is(60.00)))
                .andReturn();

        ExpenseSummaryDto expenseSummary = objectMapper.readValue(
                summaryRes.getResponse().getContentAsString(),
                ExpenseSummaryDto.class
        );
        assertThat(expenseSummary.getTotalIncome()).isEqualByComparingTo("200000.00");
        assertThat(expenseSummary.getTotalOutflow()).isEqualByComparingTo("80000.00");
        assertThat(expenseSummary.getSavingsRate()).isEqualByComparingTo("60.00");

        // 4. Test FIRE Planner reading real expenses for retirement calculations
        UpdateFirePlanRequest fireReq = UpdateFirePlanRequest.builder()
                .currentSavingsSource(FireSavingsSource.MANUAL)
                .manualCurrentSavings(new BigDecimal("3000000.00"))
                .currentAge(30)
                .monthlySavings(expenseSummary.getNetSavings()) // Auto-linked surplus: ₹1,20,000/mo
                .annualExpensesInRetirement(new BigDecimal("960000.00")) // 12 * 80,000 real spend
                .expectedAnnualReturnPct(new BigDecimal("12.00"))
                .safeWithdrawalRatePct(new BigDecimal("4.00"))
                .expectedAnnualInflationPct(new BigDecimal("6.00"))
                .activeMode(FireCalculationMode.YEARS_TO_FIRE)
                .build();

        MvcResult fireRes = mockMvc.perform(put("/api/v1/fire/plan")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(fireReq)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.calculation.fireNumber", is(24000000.00))) // 9.6L * 25
                .andExpect(jsonPath("$.calculation.yearsToFire", notNullValue()))
                .andReturn();

        FireSummaryDto fireSummary = objectMapper.readValue(
                fireRes.getResponse().getContentAsString(),
                FireSummaryDto.class
        );
        assertThat(fireSummary.getCalculation().getFireNumber()).isEqualByComparingTo("24000000.00");
        assertThat(fireSummary.getCalculation().getYearsToFire()).isLessThan(new BigDecimal("15.0"));

        // 5. Test Goal Manager capacity checks against real cash flow
        MvcResult goalDashboardRes = mockMvc.perform(get("/api/v1/goals/dashboard")
                        .contentType(MediaType.APPLICATION_JSON))
                .andExpect(status().isOk())
                .andReturn();

        GoalDashboardSummaryDto goalSummary = objectMapper.readValue(
                goalDashboardRes.getResponse().getContentAsString(),
                GoalDashboardSummaryDto.class
        );
        assertThat(goalSummary).isNotNull();
    }
}
