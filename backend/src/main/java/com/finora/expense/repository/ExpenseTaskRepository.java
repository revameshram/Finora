package com.finora.expense.repository;

import com.finora.expense.model.ExpenseTask;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ExpenseTaskRepository extends JpaRepository<ExpenseTask, String> {

    List<ExpenseTask> findByProfileIdAndBudgetMonth(String profileId, String budgetMonth);

    List<ExpenseTask> findByProfileId(String profileId);
}
