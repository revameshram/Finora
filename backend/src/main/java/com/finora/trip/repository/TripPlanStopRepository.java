package com.finora.trip.repository;

import com.finora.trip.model.TripPlanStop;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.util.List;

@Repository
public interface TripPlanStopRepository extends JpaRepository<TripPlanStop, String> {
    List<TripPlanStop> findByTripIdOrderByStopDateAscStopTimeAsc(String tripId);
    List<TripPlanStop> findByTripIdAndStopDateOrderByStopTimeAsc(String tripId, LocalDate stopDate);
}
