package com.finora.expense.service;

import com.finora.common.linking.model.SourceModule;
import com.finora.expense.contract.dto.CategoryBreakdownDto;
import com.finora.expense.contract.dto.ExpenseSummaryDto;
import com.finora.expense.contract.dto.GoalLinkedTransactionDto;
import com.finora.expense.dto.*;
import com.finora.expense.model.*;
import com.finora.expense.repository.ExpenseTaskRepository;
import com.finora.expense.repository.ExpenseTransactionRepository;
import com.finora.expense.repository.IncomeSourceRepository;
import com.finora.expense.repository.MonthlyNoteRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDate;
import java.time.format.DateTimeFormatter;
import java.util.*;
import java.util.stream.Collectors;

@Service
@Transactional
public class ExpenseService {

    private final IncomeSourceRepository incomeRepo;
    private final ExpenseTransactionRepository transactionRepo;
    private final ExpenseTaskRepository taskRepo;
    private final MonthlyNoteRepository noteRepo;

    public ExpenseService(IncomeSourceRepository incomeRepo,
                          ExpenseTransactionRepository transactionRepo,
                          ExpenseTaskRepository taskRepo,
                          MonthlyNoteRepository noteRepo) {
        this.incomeRepo = incomeRepo;
        this.transactionRepo = transactionRepo;
        this.taskRepo = taskRepo;
        this.noteRepo = noteRepo;
    }

    // ==========================================
    // Budget Months
    // ==========================================

    @Transactional(readOnly = true)
    public List<String> getAvailableBudgetMonths(String profileId) {
        Set<String> months = new TreeSet<>(Collections.reverseOrder());
        months.addAll(incomeRepo.findDistinctBudgetMonths(profileId));
        months.addAll(transactionRepo.findDistinctBudgetMonths(profileId));
        if (months.isEmpty()) {
            String current = LocalDate.now().format(DateTimeFormatter.ofPattern("yyyy-MM"));
            months.add(current);
        }
        return new ArrayList<>(months);
    }

    public void copyMonth(String profileId, CopyMonthRequest req) {
        if (req.isCopyIncome()) {
            List<IncomeSource> srcIncomes = incomeRepo.findByProfileIdAndBudgetMonth(profileId, req.getFromMonth());
            for (IncomeSource src : srcIncomes) {
                IncomeSource copy = new IncomeSource(
                        UUID.randomUUID().toString(),
                        profileId,
                        req.getToMonth(),
                        src.getName(),
                        src.getAmount(),
                        src.getInstrument()
                );
                incomeRepo.save(copy);
            }
        }

        if (req.isCopyTransactions()) {
            List<ExpenseTransaction> srcTransactions = transactionRepo.findByProfileIdAndBudgetMonth(profileId, req.getFromMonth());
            for (ExpenseTransaction src : srcTransactions) {
                ExpenseTransaction copy = new ExpenseTransaction(
                        UUID.randomUUID().toString(),
                        profileId,
                        req.getToMonth(),
                        src.getItem(),
                        src.getDescription(),
                        src.getCategory(),
                        src.getAmount(),
                        TransactionStatus.PENDING, // Copied recurring expenses default to Pending
                        null,
                        src.getPaymentMethod(),
                        src.getLinkedGoalId()
                );
                copy.setIncluded(src.isIncluded());
                copy.setLinked(false);
                copy.setSourceModule(SourceModule.MANUAL);
                transactionRepo.save(copy);
            }
        }

        if (req.isCopyTasks()) {
            List<ExpenseTask> srcTasks = taskRepo.findByProfileIdAndBudgetMonth(profileId, req.getFromMonth());
            for (ExpenseTask src : srcTasks) {
                ExpenseTask copy = new ExpenseTask(
                        UUID.randomUUID().toString(),
                        profileId,
                        req.getToMonth(),
                        src.getTask(),
                        TaskStatus.TODO,
                        null,
                        src.getNotes()
                );
                taskRepo.save(copy);
            }
        }
    }

    // ==========================================
    // Income Sources
    // ==========================================

    @Transactional(readOnly = true)
    public List<IncomeSourceDto> getIncomes(String profileId, String budgetMonth) {
        return incomeRepo.findByProfileIdAndBudgetMonth(profileId, budgetMonth)
                .stream()
                .map(this::mapToIncomeDto)
                .collect(Collectors.toList());
    }

    public IncomeSourceDto createIncome(String profileId, CreateIncomeRequest req) {
        IncomeSource income = new IncomeSource(
                UUID.randomUUID().toString(),
                profileId,
                req.getBudgetMonth(),
                req.getName(),
                req.getAmount() != null ? req.getAmount() : BigDecimal.ZERO,
                req.getInstrument()
        );
        IncomeSource saved = incomeRepo.save(income);
        return mapToIncomeDto(saved);
    }

    public IncomeSourceDto updateIncome(String profileId, String id, CreateIncomeRequest req) {
        IncomeSource income = incomeRepo.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Income source not found with ID: " + id));
        if (!income.getProfileId().equals(profileId)) {
            throw new SecurityException("Unauthorized to modify income source");
        }
        if (req.getName() != null) income.setName(req.getName());
        if (req.getAmount() != null) income.setAmount(req.getAmount());
        if (req.getInstrument() != null) income.setInstrument(req.getInstrument());
        if (req.getBudgetMonth() != null) income.setBudgetMonth(req.getBudgetMonth());
        return mapToIncomeDto(incomeRepo.save(income));
    }

    public void deleteIncome(String profileId, String id) {
        IncomeSource income = incomeRepo.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Income source not found with ID: " + id));
        if (!income.getProfileId().equals(profileId)) {
            throw new SecurityException("Unauthorized to delete income source");
        }
        incomeRepo.delete(income);
    }

    // ==========================================
    // Transactions
    // ==========================================

    @Transactional(readOnly = true)
    public List<ExpenseTransactionDto> getTransactions(String profileId, String budgetMonth, ExpenseCategory category, TransactionStatus status, String search) {
        List<ExpenseTransaction> list = transactionRepo.findByProfileIdAndBudgetMonth(profileId, budgetMonth);
        return list.stream()
                .filter(t -> category == null || t.getCategory() == category)
                .filter(t -> status == null || t.getStatus() == status)
                .filter(t -> search == null || search.isBlank() ||
                        t.getItem().toLowerCase().contains(search.toLowerCase()) ||
                        (t.getDescription() != null && t.getDescription().toLowerCase().contains(search.toLowerCase())))
                .sorted(Comparator.comparing(ExpenseTransaction::getCreatedAt).reversed())
                .map(this::mapToTransactionDto)
                .collect(Collectors.toList());
    }

    public ExpenseTransactionDto createTransaction(String profileId, CreateTransactionRequest req) {
        ExpenseTransaction t = new ExpenseTransaction(
                UUID.randomUUID().toString(),
                profileId,
                req.getBudgetMonth(),
                req.getItem(),
                req.getDescription(),
                req.getCategory() != null ? req.getCategory() : ExpenseCategory.OTHER,
                req.getAmount() != null ? req.getAmount() : BigDecimal.ZERO,
                req.getStatus() != null ? req.getStatus() : TransactionStatus.DONE,
                req.getPaymentDate(),
                req.getPaymentMethod(),
                req.getLinkedGoalId()
        );
        if (req.getIncluded() != null) t.setIncluded(req.getIncluded());
        if (req.getLinked() != null) t.setLinked(req.getLinked());
        if (req.getSourceModule() != null) t.setSourceModule(req.getSourceModule());
        if (req.getSourceEntityId() != null) t.setSourceEntityId(req.getSourceEntityId());

        ExpenseTransaction saved = transactionRepo.save(t);
        return mapToTransactionDto(saved);
    }

    public ExpenseTransactionDto updateTransaction(String profileId, String id, UpdateTransactionRequest req) {
        ExpenseTransaction t = transactionRepo.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Transaction not found with ID: " + id));
        if (!t.getProfileId().equals(profileId)) {
            throw new SecurityException("Unauthorized to modify transaction");
        }
        if (req.getItem() != null) t.setItem(req.getItem());
        if (req.getDescription() != null) t.setDescription(req.getDescription());
        if (req.getCategory() != null) t.setCategory(req.getCategory());
        if (req.getAmount() != null) t.setAmount(req.getAmount());
        if (req.getStatus() != null) t.setStatus(req.getStatus());
        if (req.getPaymentDate() != null) t.setPaymentDate(req.getPaymentDate());
        if (req.getPaymentMethod() != null) t.setPaymentMethod(req.getPaymentMethod());
        if (req.getLinkedGoalId() != null) t.setLinkedGoalId(req.getLinkedGoalId());
        if (req.getIncluded() != null) t.setIncluded(req.getIncluded());
        if (req.getLinked() != null) t.setLinked(req.getLinked());
        if (req.getSourceModule() != null) t.setSourceModule(req.getSourceModule());
        if (req.getSourceEntityId() != null) t.setSourceEntityId(req.getSourceEntityId());

        return mapToTransactionDto(transactionRepo.save(t));
    }

    public void deleteTransaction(String profileId, String id) {
        ExpenseTransaction t = transactionRepo.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Transaction not found with ID: " + id));
        if (!t.getProfileId().equals(profileId)) {
            throw new SecurityException("Unauthorized to delete transaction");
        }
        transactionRepo.delete(t);
    }

    public ExpenseTransactionDto toggleTransactionStatus(String profileId, String id) {
        ExpenseTransaction t = transactionRepo.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Transaction not found with ID: " + id));
        if (!t.getProfileId().equals(profileId)) {
            throw new SecurityException("Unauthorized");
        }
        t.setStatus(t.getStatus() == TransactionStatus.DONE ? TransactionStatus.PENDING : TransactionStatus.DONE);
        return mapToTransactionDto(transactionRepo.save(t));
    }

    public ExpenseTransactionDto toggleTransactionIncluded(String profileId, String id) {
        ExpenseTransaction t = transactionRepo.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Transaction not found with ID: " + id));
        if (!t.getProfileId().equals(profileId)) {
            throw new SecurityException("Unauthorized");
        }
        t.setIncluded(!t.isIncluded());
        return mapToTransactionDto(transactionRepo.save(t));
    }

    // ==========================================
    // Tasks
    // ==========================================

    @Transactional(readOnly = true)
    public List<ExpenseTaskDto> getTasks(String profileId, String budgetMonth) {
        return taskRepo.findByProfileIdAndBudgetMonth(profileId, budgetMonth)
                .stream()
                .map(this::mapToTaskDto)
                .collect(Collectors.toList());
    }

    public ExpenseTaskDto createTask(String profileId, CreateTaskRequest req) {
        ExpenseTask task = new ExpenseTask(
                UUID.randomUUID().toString(),
                profileId,
                req.getBudgetMonth(),
                req.getTask(),
                req.getStatus(),
                req.getDueDate(),
                req.getNotes()
        );
        return mapToTaskDto(taskRepo.save(task));
    }

    public ExpenseTaskDto updateTask(String profileId, String id, UpdateTaskRequest req) {
        ExpenseTask task = taskRepo.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Task not found with ID: " + id));
        if (!task.getProfileId().equals(profileId)) {
            throw new SecurityException("Unauthorized");
        }
        if (req.getTask() != null) task.setTask(req.getTask());
        if (req.getStatus() != null) task.setStatus(req.getStatus());
        if (req.getDueDate() != null) task.setDueDate(req.getDueDate());
        if (req.getNotes() != null) task.setNotes(req.getNotes());
        return mapToTaskDto(taskRepo.save(task));
    }

    public void deleteTask(String profileId, String id) {
        ExpenseTask task = taskRepo.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Task not found with ID: " + id));
        if (!task.getProfileId().equals(profileId)) {
            throw new SecurityException("Unauthorized");
        }
        taskRepo.delete(task);
    }

    // ==========================================
    // Monthly Notes (Append-Only)
    // ==========================================

    @Transactional(readOnly = true)
    public List<MonthlyNoteDto> getNotes(String profileId, String budgetMonth) {
        return noteRepo.findByProfileIdAndBudgetMonthOrderByCreatedAtAsc(profileId, budgetMonth)
                .stream()
                .map(this::mapToNoteDto)
                .collect(Collectors.toList());
    }

    public MonthlyNoteDto createNote(String profileId, CreateNoteRequest req) {
        MonthlyNote note = new MonthlyNote(
                UUID.randomUUID().toString(),
                profileId,
                req.getBudgetMonth(),
                req.getContent()
        );
        return mapToNoteDto(noteRepo.save(note));
    }

    // ==========================================
    // Dashboard Metrics & Insights (§4.3 & §4.4)
    // ==========================================

    @Transactional(readOnly = true)
    public ExpenseDashboardMetricsDto getDashboardMetrics(String profileId, String budgetMonth) {
        List<IncomeSource> incomes = incomeRepo.findByProfileIdAndBudgetMonth(profileId, budgetMonth);
        List<ExpenseTransaction> transactions = transactionRepo.findByProfileIdAndBudgetMonth(profileId, budgetMonth);

        BigDecimal totalInflow = incomes.stream()
                .map(IncomeSource::getAmount)
                .reduce(BigDecimal.ZERO, BigDecimal::add);

        BigDecimal totalOutflow = transactions.stream()
                .filter(ExpenseTransaction::isIncluded)
                .map(ExpenseTransaction::getAmount)
                .reduce(BigDecimal.ZERO, BigDecimal::add);

        BigDecimal doneOutflow = transactions.stream()
                .filter(ExpenseTransaction::isIncluded)
                .filter(t -> t.getStatus() == TransactionStatus.DONE)
                .map(ExpenseTransaction::getAmount)
                .reduce(BigDecimal.ZERO, BigDecimal::add);

        BigDecimal pendingOutflow = transactions.stream()
                .filter(ExpenseTransaction::isIncluded)
                .filter(t -> t.getStatus() == TransactionStatus.PENDING)
                .map(ExpenseTransaction::getAmount)
                .reduce(BigDecimal.ZERO, BigDecimal::add);

        BigDecimal cashFlow = totalInflow.subtract(totalOutflow);
        BigDecimal netPosition = totalInflow.subtract(doneOutflow);

        int completedCount = (int) transactions.stream().filter(t -> t.getStatus() == TransactionStatus.DONE).count();
        int pendingCount = (int) transactions.stream().filter(t -> t.getStatus() == TransactionStatus.PENDING).count();

        return new ExpenseDashboardMetricsDto(
                budgetMonth,
                totalInflow,
                totalOutflow,
                cashFlow,
                netPosition,
                pendingOutflow,
                completedCount,
                pendingCount,
                incomes.size()
        );
    }

    @Transactional(readOnly = true)
    public ExpenseInsightsDto getInsights(String profileId, String budgetMonth) {
        ExpenseDashboardMetricsDto metrics = getDashboardMetrics(profileId, budgetMonth);
        List<IncomeSource> incomes = incomeRepo.findByProfileIdAndBudgetMonth(profileId, budgetMonth);
        List<ExpenseTransaction> transactions = transactionRepo.findByProfileIdAndBudgetMonth(profileId, budgetMonth);

        BigDecimal totalInflow = metrics.getTotalInflow();
        BigDecimal totalOutflow = metrics.getTotalOutflow();
        BigDecimal pendingOutflow = metrics.getPendingOutflow();

        double savingsRate = 0.0;
        double expenseRatio = 0.0;
        double pendingRatio = 0.0;

        if (totalInflow.compareTo(BigDecimal.ZERO) > 0) {
            BigDecimal netSavings = totalInflow.subtract(totalOutflow);
            savingsRate = netSavings.divide(totalInflow, 4, RoundingMode.HALF_UP).doubleValue() * 100.0;
            expenseRatio = totalOutflow.divide(totalInflow, 4, RoundingMode.HALF_UP).doubleValue() * 100.0;
        }

        if (totalOutflow.compareTo(BigDecimal.ZERO) > 0) {
            pendingRatio = pendingOutflow.divide(totalOutflow, 4, RoundingMode.HALF_UP).doubleValue() * 100.0;
        }

        // Financial Health Score Calculation (0 - 100)
        int score = 0;
        if (savingsRate >= 30.0) score += 40;
        else if (savingsRate >= 20.0) score += 30;
        else if (savingsRate >= 10.0) score += 20;
        else if (savingsRate > 0.0) score += 10;

        if (expenseRatio <= 60.0 && expenseRatio > 0.0) score += 30;
        else if (expenseRatio <= 80.0) score += 20;
        else if (expenseRatio > 0.0) score += 10;

        if (pendingRatio <= 20.0) score += 20;
        else if (pendingRatio <= 50.0) score += 10;

        if (!incomes.isEmpty()) score += 10;

        String badge;
        if (score >= 80) badge = "Excellent";
        else if (score >= 60) badge = "Good";
        else if (score >= 40) badge = "Fair";
        else badge = "Needs Attention";

        BigDecimal emergencyFundTarget = totalOutflow.multiply(BigDecimal.valueOf(6));
        BigDecimal cashFlowVelocity = metrics.getCashFlow().divide(BigDecimal.valueOf(30), 2, RoundingMode.HALF_UP);

        // Find largest income
        IncomeSource largestIncome = incomes.stream()
                .max(Comparator.comparing(IncomeSource::getAmount))
                .orElse(null);

        // Find largest expense
        ExpenseTransaction largestExpense = transactions.stream()
                .filter(ExpenseTransaction::isIncluded)
                .max(Comparator.comparing(ExpenseTransaction::getAmount))
                .orElse(null);

        List<String> recommendations = new ArrayList<>();
        if (savingsRate < 20.0) {
            recommendations.add("Your savings rate is below the recommended 20% benchmark. Review discretionary spending.");
        } else {
            recommendations.add("Excellent savings discipline! You are saving " + String.format("%.1f", savingsRate) + "% of total income.");
        }

        if (pendingRatio > 30.0) {
            recommendations.add("Over 30% of monthly outflows are pending. Settle pending commitments to avoid cash drag.");
        }

        if (metrics.getCashFlow().compareTo(BigDecimal.ZERO) < 0) {
            recommendations.add("Critical: Committed outflow exceeds income by ₹" + metrics.getCashFlow().abs().toPlainString() + ".");
        }

        ExpenseInsightsDto dto = new ExpenseInsightsDto();
        dto.setBudgetMonth(budgetMonth);
        dto.setFinancialHealthScore(score);
        dto.setHealthBadge(badge);
        dto.setSavingsRate(Math.round(savingsRate * 10.0) / 10.0);
        dto.setExpenseRatio(Math.round(expenseRatio * 10.0) / 10.0);
        dto.setPendingRatio(Math.round(pendingRatio * 10.0) / 10.0);
        dto.setEmergencyFundTarget(emergencyFundTarget);
        dto.setCashFlowVelocity(cashFlowVelocity);
        dto.setLargestIncomeAmount(largestIncome != null ? largestIncome.getAmount() : BigDecimal.ZERO);
        dto.setLargestIncomeName(largestIncome != null ? largestIncome.getName() : "None");
        dto.setLargestExpenseAmount(largestExpense != null ? largestExpense.getAmount() : BigDecimal.ZERO);
        dto.setLargestExpenseItem(largestExpense != null ? largestExpense.getItem() : "None");
        dto.setRecommendations(recommendations);

        return dto;
    }

    // ==========================================
    // Real Cross-Track Summary Contract (§0.6)
    // ==========================================

    @Transactional(readOnly = true)
    public ExpenseSummaryDto getExpenseSummaryContract(String profileId, String period) {
        String queryMonth = period != null ? period : LocalDate.now().format(DateTimeFormatter.ofPattern("yyyy-MM"));

        List<IncomeSource> incomes = incomeRepo.findByProfileIdAndBudgetMonth(profileId, queryMonth);
        List<ExpenseTransaction> transactions = transactionRepo.findByProfileIdAndBudgetMonth(profileId, queryMonth);

        BigDecimal totalIncome = incomes.stream()
                .map(IncomeSource::getAmount)
                .reduce(BigDecimal.ZERO, BigDecimal::add);

        BigDecimal totalOutflow = transactions.stream()
                .filter(ExpenseTransaction::isIncluded)
                .map(ExpenseTransaction::getAmount)
                .reduce(BigDecimal.ZERO, BigDecimal::add);

        BigDecimal netSavings = totalIncome.subtract(totalOutflow);

        double savingsRate = 0.0;
        if (totalIncome.compareTo(BigDecimal.ZERO) > 0) {
            savingsRate = netSavings.divide(totalIncome, 4, RoundingMode.HALF_UP).doubleValue() * 100.0;
        }

        // Calculate trailing 12-month average spend across all recorded months
        List<ExpenseTransaction> allTransactions = transactionRepo.findByProfileId(profileId);
        BigDecimal allTimeSpend = allTransactions.stream()
                .filter(ExpenseTransaction::isIncluded)
                .map(ExpenseTransaction::getAmount)
                .reduce(BigDecimal.ZERO, BigDecimal::add);

        long distinctMonths = allTransactions.stream()
                .map(ExpenseTransaction::getBudgetMonth)
                .distinct()
                .count();
        if (distinctMonths == 0) distinctMonths = 1;

        BigDecimal averageMonthlySpend = allTimeSpend.divide(BigDecimal.valueOf(distinctMonths), 2, RoundingMode.HALF_UP);
        if (averageMonthlySpend.compareTo(BigDecimal.ZERO) == 0 && totalOutflow.compareTo(BigDecimal.ZERO) > 0) {
            averageMonthlySpend = totalOutflow;
        }
        BigDecimal trailing12MonthAnnualSpend = averageMonthlySpend.multiply(BigDecimal.valueOf(12));

        // Group categories
        Map<ExpenseCategory, BigDecimal> categorySums = transactions.stream()
                .filter(ExpenseTransaction::isIncluded)
                .collect(Collectors.groupingBy(
                        ExpenseTransaction::getCategory,
                        Collectors.reducing(BigDecimal.ZERO, ExpenseTransaction::getAmount, BigDecimal::add)
                ));

        List<CategoryBreakdownDto> topCategories = categorySums.entrySet().stream()
                .map(e -> {
                    double pct = totalOutflow.compareTo(BigDecimal.ZERO) > 0
                            ? e.getValue().divide(totalOutflow, 4, RoundingMode.HALF_UP).doubleValue() * 100.0
                            : 0.0;
                    return CategoryBreakdownDto.builder()
                            .category(e.getKey().getDisplayName())
                            .amount(e.getValue())
                            .percentage(BigDecimal.valueOf(pct).setScale(2, RoundingMode.HALF_UP))
                            .build();
                })
                .sorted(Comparator.comparing(CategoryBreakdownDto::getAmount).reversed())
                .collect(Collectors.toList());

        ExpenseSummaryDto summary = new ExpenseSummaryDto();
        summary.setPeriod(queryMonth);
        summary.setTotalIncome(totalIncome);
        summary.setTotalOutflow(totalOutflow);
        summary.setNetSavings(netSavings);
        summary.setSavingsRate(BigDecimal.valueOf(savingsRate).setScale(2, RoundingMode.HALF_UP));
        summary.setAverageMonthlySpend(averageMonthlySpend);
        summary.setTrailing12MonthAnnualSpend(trailing12MonthAnnualSpend);
        summary.setCurrency("INR");
        summary.setTopCategories(topCategories);

        return summary;
    }

    @Transactional(readOnly = true)
    public List<GoalLinkedTransactionDto> getGoalLinkedTransactionsContract(String profileId, String goalId) {
        List<ExpenseTransaction> transactions;
        if (goalId != null && !goalId.isBlank()) {
            transactions = transactionRepo.findByLinkedGoalId(goalId);
        } else {
            transactions = transactionRepo.findByProfileId(profileId).stream()
                    .filter(t -> t.getLinkedGoalId() != null && !t.getLinkedGoalId().isBlank())
                    .collect(Collectors.toList());
        }

        return transactions.stream()
                .map(t -> GoalLinkedTransactionDto.builder()
                        .id(t.getId())
                        .amount(t.getAmount())
                        .date(t.getPaymentDate() != null ? t.getPaymentDate() : LocalDate.now())
                        .description(t.getItem())
                        .category(t.getCategory().getDisplayName())
                        .linkedGoalId(t.getLinkedGoalId())
                        .sourceModule(SourceModule.EXPENSE)
                        .isIncluded(t.isIncluded())
                        .build())
                .collect(Collectors.toList());
    }

    // ==========================================
    // Mapping Helpers
    // ==========================================

    private IncomeSourceDto mapToIncomeDto(IncomeSource i) {
        return new IncomeSourceDto(
                i.getId(),
                i.getProfileId(),
                i.getBudgetMonth(),
                i.getName(),
                i.getAmount(),
                i.getInstrument(),
                i.getCreatedAt(),
                i.getUpdatedAt()
        );
    }

    private ExpenseTransactionDto mapToTransactionDto(ExpenseTransaction t) {
        return new ExpenseTransactionDto(
                t.getId(),
                t.getProfileId(),
                t.getBudgetMonth(),
                t.getItem(),
                t.getDescription(),
                t.getCategory(),
                t.getAmount(),
                t.getStatus(),
                t.getPaymentDate(),
                t.getPaymentMethod(),
                t.getLinkedGoalId(),
                t.isIncluded(),
                t.isLinked(),
                t.getSourceModule(),
                t.getSourceEntityId(),
                t.getCreatedAt(),
                t.getUpdatedAt()
        );
    }

    private ExpenseTaskDto mapToTaskDto(ExpenseTask task) {
        return new ExpenseTaskDto(
                task.getId(),
                task.getProfileId(),
                task.getBudgetMonth(),
                task.getTask(),
                task.getStatus(),
                task.getDueDate(),
                task.getNotes(),
                task.getCreatedAt(),
                task.getUpdatedAt()
        );
    }

    private MonthlyNoteDto mapToNoteDto(MonthlyNote note) {
        return new MonthlyNoteDto(
                note.getId(),
                note.getProfileId(),
                note.getBudgetMonth(),
                note.getContent(),
                note.getCreatedAt()
        );
    }
}
