package com.finora.fire.repository;

import com.finora.fire.model.FirePlanSnapshot;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface FirePlanSnapshotRepository extends JpaRepository<FirePlanSnapshot, String> {

    List<FirePlanSnapshot> findByFirePlanIdOrderByComputedAtDesc(String firePlanId);
}
