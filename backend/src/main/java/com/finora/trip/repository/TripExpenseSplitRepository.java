package com.finora.trip.repository;

import com.finora.trip.model.TripExpenseSplit;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface TripExpenseSplitRepository extends JpaRepository<TripExpenseSplit, String> {
    List<TripExpenseSplit> findByExpenseId(String expenseId);
    List<TripExpenseSplit> findByParticipantId(String participantId);
    void deleteByExpenseId(String expenseId);
}
