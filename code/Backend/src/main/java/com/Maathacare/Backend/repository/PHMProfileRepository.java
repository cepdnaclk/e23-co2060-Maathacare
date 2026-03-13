package com.Maathacare.Backend.repository;

import com.Maathacare.Backend.model.entity.PHMProfile;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;
import java.util.UUID;

@Repository
public interface PHMProfileRepository extends JpaRepository<PHMProfile,String> {
    Optional<PHMProfile> findByRegistrationNumber(String registrationNumber);
    Optional<PHMProfile> findByUserUserId(String userId);
    Optional<PHMProfile> findByUserStaffId(String staffId);
}

