package com.Maathacare.Backend.repository;

import com.Maathacare.Backend.model.WeeklyMilestone;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface WeeklyMilestoneRepository extends JpaRepository<WeeklyMilestone, Integer> {
    // We leave this completely empty!
    // JpaRepository automatically gives us tools like findById() and save() behind the scenes.
}
