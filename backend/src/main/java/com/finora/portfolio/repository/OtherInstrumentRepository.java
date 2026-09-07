package com.finora.portfolio.repository;

import com.finora.portfolio.model.OtherInstrument;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface OtherInstrumentRepository extends JpaRepository<OtherInstrument, String> {
    List<OtherInstrument> findByUserIdOrderByCreatedAtDesc(String userId);
    Optional<OtherInstrument> findByIdAndUserId(String id, String userId);
}
