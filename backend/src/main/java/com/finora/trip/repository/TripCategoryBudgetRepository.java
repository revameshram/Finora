package com.finora.trip.repository;

import com.finora.trip.model.TripCategory;
import com.finora.trip.model.TripCategoryBudget;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface TripCategoryBudgetRepository extends JpaRepository<TripCategoryBudget, String> {
    List<TripCategoryBudget> findByTripId(String tripId);
    Optional<TripCategoryBudget> findByTripIdAndCategory(String tripId, TripCategory category);
}
