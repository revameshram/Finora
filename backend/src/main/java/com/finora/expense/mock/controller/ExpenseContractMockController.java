package com.finora.expense.mock.controller;

import com.finora.common.auth.security.SecurityUtils;
import com.finora.expense.contract.dto.CategoryBreakdownDto;
import com.finora.expense.contract.dto.ExpenseSummaryDto;
import com.finora.expense.contract.dto.GoalLinkedTransactionDto;
import com.finora.expense.service.ExpenseService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.format.DateTimeFormatter;
import java.util.List;

@Slf4j
@RestController
@RequestMapping("/api/v1/expenses")
@Tag(name = "Expense Tracker Contract", description = "Cross-track contract owned by Track B, consumed by Goal Manager & FIRE Planner")
@CrossOrigin(origins = "*")
public class ExpenseContractMockController {

    private final ExpenseService expenseService;

    public ExpenseContractMockController(ExpenseService expenseService) {
        this.expenseService = expenseService;
    }

    private String getEffectiveProfileId() {
        return SecurityUtils.getCurrentUserId()
                .orElse("00000000-0000-0000-0000-000000000001");
    }

    @GetMapping("/summary")
    @Operation(summary = "Get monthly expense summary and annual trailing spend", description = "Returns income, outflow, savings rate, and annual trailing spend for Track A consumers")
    public ResponseEntity<ExpenseSummaryDto> getExpenseSummary(
            @Parameter(description = "Period in YYYY-MM format")
            @RequestParam(name = "month", required = false) String month) {

        String period = (month != null && !month.trim().isEmpty())
                ? month
                : LocalDate.now().format(DateTimeFormatter.ofPattern("yyyy-MM"));

        log.info("Serving expense summary for period: {}", period);

        ExpenseSummaryDto summary = expenseService.getExpenseSummaryContract(getEffectiveProfileId(), period);

        // If the database has 0 records yet for this profile, provide realistic seed baseline
        if (summary.getTotalIncome().compareTo(BigDecimal.ZERO) == 0 && summary.getTotalOutflow().compareTo(BigDecimal.ZERO) == 0) {
            List<CategoryBreakdownDto> topCategories = List.of(
                    CategoryBreakdownDto.builder().category("Housing & Rent").amount(new BigDecimal("35000.00")).percentage(new BigDecimal("37.8")).build(),
                    CategoryBreakdownDto.builder().category("Food & Dining").amount(new BigDecimal("18000.00")).percentage(new BigDecimal("19.5")).build(),
                    CategoryBreakdownDto.builder().category("Transportation").amount(new BigDecimal("12000.00")).percentage(new BigDecimal("13.0")).build(),
                    CategoryBreakdownDto.builder().category("Utilities & Bills").amount(new BigDecimal("8500.00")).percentage(new BigDecimal("9.2")).build(),
                    CategoryBreakdownDto.builder().category("Investments & SIP").amount(new BigDecimal("19000.00")).percentage(new BigDecimal("20.5")).build()
            );

            summary.setTotalIncome(new BigDecimal("185000.00"));
            summary.setTotalOutflow(new BigDecimal("92500.00"));
            summary.setNetSavings(new BigDecimal("92500.00"));
            summary.setSavingsRate(new BigDecimal("50.0"));
            summary.setAverageMonthlySpend(new BigDecimal("87500.00"));
            summary.setTrailing12MonthAnnualSpend(new BigDecimal("1050000.00"));
            summary.setCurrency("INR");
            summary.setTopCategories(topCategories);
        }

        return ResponseEntity.ok(summary);
    }

    @GetMapping("/goal-linked")
    @Operation(summary = "Get goal-linked transactions", description = "Returns transactions linked to specific goal IDs for Goal Manager progress tracking")
    public ResponseEntity<List<GoalLinkedTransactionDto>> getGoalLinkedTransactions(
            @Parameter(description = "Filter by Goal ID")
            @RequestParam(name = "goalId", required = false) String goalId) {

        log.info("Serving goal-linked transactions for goalId: {}", goalId);
        List<GoalLinkedTransactionDto> list = expenseService.getGoalLinkedTransactionsContract(getEffectiveProfileId(), goalId);

        return ResponseEntity.ok(list);
    }
}
