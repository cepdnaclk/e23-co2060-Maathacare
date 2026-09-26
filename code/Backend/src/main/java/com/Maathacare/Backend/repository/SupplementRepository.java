package com.Maathacare.Backend.repository;

import com.Maathacare.Backend.model.entity.Supplement;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface SupplementRepository extends JpaRepository<Supplement, String> {

    // Custom query to fetch a mother's specific prescribed supplements for the mobile UI
    List<Supplement> findByMotherIdOrderByAssignedDateDesc(String motherId);
}