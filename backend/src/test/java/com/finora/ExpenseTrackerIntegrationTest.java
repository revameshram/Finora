package com.finora;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.finora.expense.dto.*;
import com.finora.expense.model.ExpenseCategory;
import com.finora.expense.model.TaskStatus;
import com.finora.expense.model.TransactionStatus;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;

import java.math.BigDecimal;
import java.time.LocalDate;

import static org.hamcrest.Matchers.*;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@SpringBootTest
@AutoConfigureMockMvc
public class ExpenseTrackerIntegrationTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    @Test
    public void testFullExpenseTrackerLifecycle() throws Exception {
        String testMonth = "2026-10";

        // 1. Create Income Source
        CreateIncomeRequest incomeReq = new CreateIncomeRequest(
                testMonth,
                "Consulting Tech Retainer",
                new BigDecimal("150000.00"),
                "HDFC Direct Deposit"
        );

        mockMvc.perform(post("/api/v1/expenses/incomes")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(incomeReq)))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.name", is("Consulting Tech Retainer")))
                .andExpect(jsonPath("$.amount", is(150000.00)));

        // 2. Create Transactions (1 Done, 1 Pending)
        CreateTransactionRequest txn1 = new CreateTransactionRequest();
        txn1.setBudgetMonth(testMonth);
        txn1.setItem("Apartment Rental");
        txn1.setCategory(ExpenseCategory.HOUSING);
        txn1.setAmount(new BigDecimal("40000.00"));
        txn1.setStatus(TransactionStatus.DONE);
        txn1.setIncluded(true);
        txn1.setPaymentMethod("Net Banking");

        mockMvc.perform(post("/api/v1/expenses/transactions")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(txn1)))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.item", is("Apartment Rental")))
                .andExpect(jsonPath("$.status", is("DONE")));

        CreateTransactionRequest txn2 = new CreateTransactionRequest();
        txn2.setBudgetMonth(testMonth);
        txn2.setItem("SIP Equity Fund");
        txn2.setCategory(ExpenseCategory.INVESTMENT);
        txn2.setAmount(new BigDecimal("30000.00"));
        txn2.setStatus(TransactionStatus.PENDING);
        txn2.setLinkedGoalId("goal_fire_01");
        txn2.setIncluded(true);
        txn2.setPaymentMethod("Auto Debit");

        mockMvc.perform(post("/api/v1/expenses/transactions")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(txn2)))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.item", is("SIP Equity Fund")))
                .andExpect(jsonPath("$.status", is("PENDING")))
                .andExpect(jsonPath("$.linkedGoalId", is("goal_fire_01")));

        // 3. Verify Metrics: Inflow=150k, Outflow=70k, CashFlow=80k, NetPosition=110k, Pending=30k
        mockMvc.perform(get("/api/v1/expenses/metrics").param("month", testMonth))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.totalInflow", is(150000.00)))
                .andExpect(jsonPath("$.totalOutflow", is(70000.00)))
                .andExpect(jsonPath("$.cashFlow", is(80000.00)))
                .andExpect(jsonPath("$.netPosition", is(110000.00)))
                .andExpect(jsonPath("$.pendingOutflow", is(30000.00)))
                .andExpect(jsonPath("$.completedTransactionsCount", is(1)))
                .andExpect(jsonPath("$.pendingTransactionsCount", is(1)));

        // 4. Verify Financial Insights
        mockMvc.perform(get("/api/v1/expenses/insights").param("month", testMonth))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.financialHealthScore", greaterThan(50)))
                .andExpect(jsonPath("$.savingsRate", is(53.3)))
                .andExpect(jsonPath("$.emergencyFundTarget", is(420000.00)));

        // 5. Create and Complete a Task
        CreateTaskRequest taskReq = new CreateTaskRequest();
        taskReq.setBudgetMonth(testMonth);
        taskReq.setTask("Review quarterly insurance premium");
        taskReq.setStatus(TaskStatus.TODO);
        taskReq.setDueDate(LocalDate.of(2026, 10, 15));

        mockMvc.perform(post("/api/v1/expenses/tasks")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(taskReq)))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.task", is("Review quarterly insurance premium")));

        // 6. Append Monthly Note
        CreateNoteRequest noteReq = new CreateNoteRequest(testMonth, "Negotiated discount on broadband plan.");
        mockMvc.perform(post("/api/v1/expenses/notes")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(noteReq)))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.content", is("Negotiated discount on broadband plan.")));

        // 7. Test Copy Month to next period
        CopyMonthRequest copyReq = new CopyMonthRequest(testMonth, "2026-11", true, true, true);
        mockMvc.perform(post("/api/v1/expenses/copy-month")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(copyReq)))
                .andExpect(status().isOk());

        // Verify copied month has the income source
        mockMvc.perform(get("/api/v1/expenses/incomes").param("month", "2026-11"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$", hasSize(1)))
                .andExpect(jsonPath("$[0].name", is("Consulting Tech Retainer")));

        // 8. Test Summary API Contract Endpoint with real data
        mockMvc.perform(get("/api/v1/expenses/summary").param("month", testMonth))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.period", is(testMonth)))
                .andExpect(jsonPath("$.totalIncome", is(150000.00)))
                .andExpect(jsonPath("$.totalOutflow", is(70000.00)))
                .andExpect(jsonPath("$.netSavings", is(80000.00)))
                .andExpect(jsonPath("$.currency", is("INR")));
    }
}
