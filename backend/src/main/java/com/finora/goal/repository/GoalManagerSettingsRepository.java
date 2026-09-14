package com.finora.goal.repository;

import com.finora.goal.model.GoalManagerSettings;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface GoalManagerSettingsRepository extends JpaRepository<GoalManagerSettings, String> {

    Optional<GoalManagerSettings> findByUserId(String userId);
}
