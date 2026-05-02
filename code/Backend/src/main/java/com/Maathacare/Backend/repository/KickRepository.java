package com.Maathacare.Backend.repository;

import com.Maathacare.Backend.model.entity.KickRecord;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface KickRepository extends JpaRepository<KickRecord, Long> {
}