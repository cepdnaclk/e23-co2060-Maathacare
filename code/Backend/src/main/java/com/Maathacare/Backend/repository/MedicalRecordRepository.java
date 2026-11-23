package com.Maathacare.Backend.repository;

import com.Maathacare.Backend.model.entity.MedicalRecord;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface MedicalRecordRepository extends JpaRepository<MedicalRecord, String> {
    // This allows you to easily find all PDFs belonging to one specific mother
    List<MedicalRecord> findByMotherProfileId(String motherId);
}