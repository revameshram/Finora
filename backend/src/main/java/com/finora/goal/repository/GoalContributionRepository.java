package com.finora.goal.repository;

import com.finora.goal.model.GoalContribution;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface GoalContributionRepository extends JpaRepository<GoalContribution, String> {

    List<GoalContribution> findByGoalIdOrderByDateDescCreatedAtDesc(String goalId);

    List<GoalContribution> findByGoalIdInOrderByDateDesc(List<String> goalIds);
}
