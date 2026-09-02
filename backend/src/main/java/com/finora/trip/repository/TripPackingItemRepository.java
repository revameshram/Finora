package com.finora.trip.repository;

import com.finora.trip.model.PackingCategory;
import com.finora.trip.model.TripPackingItem;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface TripPackingItemRepository extends JpaRepository<TripPackingItem, String> {
    List<TripPackingItem> findByTripIdOrderByCreatedAtAsc(String tripId);
    List<TripPackingItem> findByTripIdAndCategoryOrderByCreatedAtAsc(String tripId, PackingCategory category);
}
