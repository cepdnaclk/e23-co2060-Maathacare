package com.Maathacare.Backend.repository;

import com.Maathacare.Backend.model.entity.VisitRecord;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface VisitRecordRepository extends JpaRepository<VisitRecord, String> {

    /**
     * Fetches all clinical visit records for a specific mother,
     * ordered chronologically by gestational week.
     * This is essential for generating accurate growth and BP charts.
     */
    List<VisitRecord> findByMotherProfile_IdOrderByGestationalWeekAsc(String motherId);

}