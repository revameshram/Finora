package com.finora.networth.repository;

import com.finora.networth.model.GrowthScenario;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface GrowthScenarioRepository extends JpaRepository<GrowthScenario, String> {
    List<GrowthScenario> findByUserIdOrderByCagrPctAsc(String userId);
}
