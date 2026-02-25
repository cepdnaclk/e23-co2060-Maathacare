package com.Maathacare.Backend.repository;

import com.Maathacare.Backend.model.entity.MotherProfile;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;
import java.util.UUID;

@Repository
public interface MotherProfileRepository extends JpaRepository<MotherProfile, UUID> {
    boolean existsByNic(String nic);
}
