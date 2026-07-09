package com.Maathacare.Backend.repository;

import com.Maathacare.Backend.model.entity.GNDivision;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface GNDivisionRepository extends JpaRepository<GNDivision, Long> {
    // Check if a division by this name already exists
    boolean existsByName(String name);

    // Find divisions by MOH area
    List<GNDivision> findByMohAreaOrderByNameAsc(String mohArea);
}