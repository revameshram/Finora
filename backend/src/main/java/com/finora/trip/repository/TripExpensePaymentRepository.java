package com.finora.trip.repository;

import com.finora.trip.model.TripExpensePayment;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface TripExpensePaymentRepository extends JpaRepository<TripExpensePayment, String> {
    List<TripExpensePayment> findByTripIdOrderByPaymentDateDescCreatedAtDesc(String tripId);
    List<TripExpensePayment> findByExpenseId(String expenseId);
    void deleteByExpenseId(String expenseId);
}
