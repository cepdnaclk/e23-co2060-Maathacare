package com.Maathacare.Backend.repository;

import com.Maathacare.Backend.model.entity.SymptomRecord;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface SymptomRepository extends JpaRepository<SymptomRecord, Long> {
    // This custom method will let you fetch a mother's history easily
    List<SymptomRecord> findByUserIdOrderByTimestampDesc(String userId);
}