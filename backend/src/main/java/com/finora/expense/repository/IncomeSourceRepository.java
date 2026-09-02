package com.finora.expense.repository;

import com.finora.expense.model.IncomeSource;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface IncomeSourceRepository extends JpaRepository<IncomeSource, String> {

    List<IncomeSource> findByProfileIdAndBudgetMonth(String profileId, String budgetMonth);

    List<IncomeSource> findByProfileId(String profileId);

    @Query("SELECT DISTINCT i.budgetMonth FROM IncomeSource i WHERE i.profileId = :profileId ORDER BY i.budgetMonth DESC")
    List<String> findDistinctBudgetMonths(@Param("profileId") String profileId);
}
