package com.finora.portfolio.repository;

import com.finora.portfolio.model.OtherInstrumentCategoryMix;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface OtherInstrumentCategoryMixRepository extends JpaRepository<OtherInstrumentCategoryMix, String> {
    List<OtherInstrumentCategoryMix> findByOtherInstrumentId(String otherInstrumentId);
    void deleteByOtherInstrumentId(String otherInstrumentId);
}
