package com.finora.trip.repository;

import com.finora.trip.model.TripParticipant;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface TripParticipantRepository extends JpaRepository<TripParticipant, String> {
    List<TripParticipant> findByTripIdOrderByCreatedAtAsc(String tripId);
    List<TripParticipant> findByTripIdAndParentParticipantIdIsNullOrderByCreatedAtAsc(String tripId);
    List<TripParticipant> findByTripIdAndParentParticipantId(String tripId, String parentParticipantId);
}
