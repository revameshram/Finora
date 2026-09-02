package com.finora.trip.repository;

import com.finora.trip.model.TripCategory;
import com.finora.trip.model.TripExpense;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface TripExpenseRepository extends JpaRepository<TripExpense, String> {
    List<TripExpense> findByTripIdOrderByExpenseDateDescCreatedAtDesc(String tripId);
    List<TripExpense> findByTripIdAndCategoryOrderByExpenseDateDesc(String tripId, TripCategory category);
}
