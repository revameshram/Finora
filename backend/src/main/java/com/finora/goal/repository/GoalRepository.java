package com.finora.goal.repository;

import com.finora.goal.model.Goal;
import com.finora.goal.model.GoalStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface GoalRepository extends JpaRepository<Goal, String> {

    List<Goal> findByUserId(String userId);

    List<Goal> findByUserIdAndStatus(String userId, GoalStatus status);

    Optional<Goal> findByIdAndUserId(String id, String userId);
}
