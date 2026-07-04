package com.Maathacare.Backend.repository;

import com.Maathacare.Backend.model.entity.KickRecord;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface KickRepository extends JpaRepository<KickRecord, Long> {

    // ADD THIS LINE: It tells the database to fetch records for a specific mother profile sorted by time
    List<KickRecord> findByMotherProfileIdOrderByTimestampAsc(String motherProfileId);
}