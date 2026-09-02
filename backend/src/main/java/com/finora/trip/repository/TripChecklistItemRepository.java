package com.finora.trip.repository;

import com.finora.trip.model.TripChecklistItem;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface TripChecklistItemRepository extends JpaRepository<TripChecklistItem, String> {
    List<TripChecklistItem> findByTripIdOrderByCreatedAtAsc(String tripId);
    List<TripChecklistItem> findByTripIdAndDone(String tripId, boolean done);
}
