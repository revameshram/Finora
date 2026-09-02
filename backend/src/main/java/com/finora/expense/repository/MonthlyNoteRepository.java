package com.finora.expense.repository;

import com.finora.expense.model.MonthlyNote;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface MonthlyNoteRepository extends JpaRepository<MonthlyNote, String> {

    List<MonthlyNote> findByProfileIdAndBudgetMonthOrderByCreatedAtAsc(String profileId, String budgetMonth);

    List<MonthlyNote> findByProfileId(String profileId);
}
