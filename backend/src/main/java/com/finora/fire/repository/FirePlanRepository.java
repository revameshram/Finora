package com.finora.fire.repository;

import com.finora.fire.model.FirePlan;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface FirePlanRepository extends JpaRepository<FirePlan, String> {

    Optional<FirePlan> findByUserId(String userId);
}
