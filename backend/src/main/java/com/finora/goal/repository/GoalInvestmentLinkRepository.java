package com.finora.goal.repository;

import com.finora.goal.model.GoalInvestmentLink;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface GoalInvestmentLinkRepository extends JpaRepository<GoalInvestmentLink, String> {

    List<GoalInvestmentLink> findByGoalId(String goalId);

    Optional<GoalInvestmentLink> findByPortfolioAssetIdAndLinkedProfileId(String portfolioAssetId, String linkedProfileId);

    void deleteByGoalId(String goalId);
}
