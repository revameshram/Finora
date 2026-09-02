package com.finora.expense.repository;

import com.finora.expense.model.ExpenseCategory;
import com.finora.expense.model.ExpenseTransaction;
import com.finora.expense.model.TransactionStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ExpenseTransactionRepository extends JpaRepository<ExpenseTransaction, String> {

    List<ExpenseTransaction> findByProfileIdAndBudgetMonth(String profileId, String budgetMonth);

    List<ExpenseTransaction> findByProfileIdAndBudgetMonthAndCategory(String profileId, String budgetMonth, ExpenseCategory category);

    List<ExpenseTransaction> findByProfileIdAndBudgetMonthAndStatus(String profileId, String budgetMonth, TransactionStatus status);

    List<ExpenseTransaction> findByProfileIdAndLinkedGoalId(String profileId, String linkedGoalId);

    List<ExpenseTransaction> findByLinkedGoalId(String linkedGoalId);

    List<ExpenseTransaction> findByProfileId(String profileId);

    @Query("SELECT DISTINCT t.budgetMonth FROM ExpenseTransaction t WHERE t.profileId = :profileId ORDER BY t.budgetMonth DESC")
    List<String> findDistinctBudgetMonths(@Param("profileId") String profileId);
}
