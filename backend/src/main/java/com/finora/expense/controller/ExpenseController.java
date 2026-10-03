package com.finora.expense.controller;

import com.finora.common.auth.security.SecurityUtils;
import com.finora.expense.dto.*;
import com.finora.expense.model.ExpenseCategory;
import com.finora.expense.model.TransactionStatus;
import com.finora.expense.service.ExpenseService;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1/expenses")
@CrossOrigin(origins = "*")
public class ExpenseController {

    private final ExpenseService expenseService;

    public ExpenseController(ExpenseService expenseService) {
        this.expenseService = expenseService;
    }

    private String getEffectiveProfileId() {
        return SecurityUtils.getCurrentUserId()
                .orElse("00000000-0000-0000-0000-000000000001");
    }

    // ==========================================
    // Budget Months
    // ==========================================

    @GetMapping("/months")
    public ResponseEntity<List<String>> getAvailableMonths() {
        return ResponseEntity.ok(expenseService.getAvailableBudgetMonths(getEffectiveProfileId()));
    }

    @PostMapping("/copy-month")
    public ResponseEntity<Void> copyMonth(@RequestBody CopyMonthRequest request) {
        expenseService.copyMonth(getEffectiveProfileId(), request);
        return ResponseEntity.ok().build();
    }

    // ==========================================
    // Incomes
    // ==========================================

    @GetMapping("/incomes")
    public ResponseEntity<List<IncomeSourceDto>> getIncomes(@RequestParam(name = "month") String month) {
        return ResponseEntity.ok(expenseService.getIncomes(getEffectiveProfileId(), month));
    }

    @PostMapping("/incomes")
    public ResponseEntity<IncomeSourceDto> createIncome(@RequestBody CreateIncomeRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(expenseService.createIncome(getEffectiveProfileId(), request));
    }

    @PutMapping("/incomes/{id}")
    public ResponseEntity<IncomeSourceDto> updateIncome(@PathVariable("id") String id, @RequestBody CreateIncomeRequest request) {
        return ResponseEntity.ok(expenseService.updateIncome(getEffectiveProfileId(), id, request));
    }

    @DeleteMapping("/incomes/{id}")
    public ResponseEntity<Void> deleteIncome(@PathVariable("id") String id) {
        expenseService.deleteIncome(getEffectiveProfileId(), id);
        return ResponseEntity.noContent().build();
    }

    // ==========================================
    // Transactions
    // ==========================================

    @GetMapping("/transactions")
    public ResponseEntity<List<ExpenseTransactionDto>> getTransactions(
            @RequestParam(name = "month") String month,
            @RequestParam(name = "category", required = false) ExpenseCategory category,
            @RequestParam(name = "status", required = false) TransactionStatus status,
            @RequestParam(name = "search", required = false) String search) {
        return ResponseEntity.ok(expenseService.getTransactions(getEffectiveProfileId(), month, category, status, search));
    }

    @PostMapping("/transactions")
    public ResponseEntity<ExpenseTransactionDto> createTransaction(@RequestBody CreateTransactionRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(expenseService.createTransaction(getEffectiveProfileId(), request));
    }

    @PutMapping("/transactions/{id}")
    public ResponseEntity<ExpenseTransactionDto> updateTransaction(
            @PathVariable("id") String id,
            @RequestBody UpdateTransactionRequest request) {
        return ResponseEntity.ok(expenseService.updateTransaction(getEffectiveProfileId(), id, request));
    }

    @DeleteMapping("/transactions/{id}")
    public ResponseEntity<Void> deleteTransaction(@PathVariable("id") String id) {
        expenseService.deleteTransaction(getEffectiveProfileId(), id);
        return ResponseEntity.noContent().build();
    }

    @PatchMapping("/transactions/{id}/toggle-status")
    public ResponseEntity<ExpenseTransactionDto> toggleTransactionStatus(@PathVariable("id") String id) {
        return ResponseEntity.ok(expenseService.toggleTransactionStatus(getEffectiveProfileId(), id));
    }

    @PatchMapping("/transactions/{id}/toggle-included")
    public ResponseEntity<ExpenseTransactionDto> toggleTransactionIncluded(@PathVariable("id") String id) {
        return ResponseEntity.ok(expenseService.toggleTransactionIncluded(getEffectiveProfileId(), id));
    }

    // ==========================================
    // Tasks
    // ==========================================

    @GetMapping("/tasks")
    public ResponseEntity<List<ExpenseTaskDto>> getTasks(@RequestParam(name = "month") String month) {
        return ResponseEntity.ok(expenseService.getTasks(getEffectiveProfileId(), month));
    }

    @PostMapping("/tasks")
    public ResponseEntity<ExpenseTaskDto> createTask(@RequestBody CreateTaskRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(expenseService.createTask(getEffectiveProfileId(), request));
    }

    @PutMapping("/tasks/{id}")
    public ResponseEntity<ExpenseTaskDto> updateTask(@PathVariable("id") String id, @RequestBody UpdateTaskRequest request) {
        return ResponseEntity.ok(expenseService.updateTask(getEffectiveProfileId(), id, request));
    }

    @DeleteMapping("/tasks/{id}")
    public ResponseEntity<Void> deleteTask(@PathVariable("id") String id) {
        expenseService.deleteTask(getEffectiveProfileId(), id);
        return ResponseEntity.noContent().build();
    }

    // ==========================================
    // Notes
    // ==========================================

    @GetMapping("/notes")
    public ResponseEntity<List<MonthlyNoteDto>> getNotes(@RequestParam(name = "month") String month) {
        return ResponseEntity.ok(expenseService.getNotes(getEffectiveProfileId(), month));
    }

    @PostMapping("/notes")
    public ResponseEntity<MonthlyNoteDto> createNote(@RequestBody CreateNoteRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(expenseService.createNote(getEffectiveProfileId(), request));
    }

    // ==========================================
    // Metrics & Insights
    // ==========================================

    @GetMapping("/metrics")
    public ResponseEntity<ExpenseDashboardMetricsDto> getMetrics(@RequestParam(name = "month") String month) {
        return ResponseEntity.ok(expenseService.getDashboardMetrics(getEffectiveProfileId(), month));
    }

    @GetMapping("/insights")
    public ResponseEntity<ExpenseInsightsDto> getInsights(@RequestParam(name = "month") String month) {
        return ResponseEntity.ok(expenseService.getInsights(getEffectiveProfileId(), month));
    }

    // ==========================================
    // Cross-Track Contracts (Goal Manager & FIRE Planner)
    // ==========================================

    @GetMapping("/summary")
    public ResponseEntity<com.finora.expense.contract.dto.ExpenseSummaryDto> getExpenseSummary(
            @RequestParam(name = "month", required = false) String month) {
        String period = (month != null && !month.trim().isEmpty())
                ? month
                : java.time.LocalDate.now().format(java.time.format.DateTimeFormatter.ofPattern("yyyy-MM"));
        return ResponseEntity.ok(expenseService.getExpenseSummaryContract(getEffectiveProfileId(), period));
    }

    @GetMapping("/goal-linked")
    public ResponseEntity<List<com.finora.expense.contract.dto.GoalLinkedTransactionDto>> getGoalLinkedTransactions(
            @RequestParam(name = "goalId", required = false) String goalId) {
        return ResponseEntity.ok(expenseService.getGoalLinkedTransactionsContract(getEffectiveProfileId(), goalId));
    }
}
