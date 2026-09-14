package com.finora.goal.repository;

import com.finora.goal.model.GoalMilestone;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface GoalMilestoneRepository extends JpaRepository<GoalMilestone, String> {

    List<GoalMilestone> findByGoalIdOrderByTargetPctAsc(String goalId);
}
