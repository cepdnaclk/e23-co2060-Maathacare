package com.Maathacare.Backend.repository;

import com.Maathacare.Backend.model.entity.VisitRecord;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface VisitRecordRepository extends JpaRepository<VisitRecord, String> {

    List<VisitRecord> findByMotherProfile_IdOrderByGestationalWeekAsc(
            String motherId
    );

    List<VisitRecord> findByMotherProfile_IdOrderByVisitDateDesc(
            String motherId
    );

    List<VisitRecord> findAllByOrderByVisitDateDesc();
}