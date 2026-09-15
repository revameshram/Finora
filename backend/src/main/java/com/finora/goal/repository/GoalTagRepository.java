package com.finora.goal.repository;

import com.finora.goal.model.GoalTag;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface GoalTagRepository extends JpaRepository<GoalTag, String> {

    List<GoalTag> findByGoalId(String goalId);
}
