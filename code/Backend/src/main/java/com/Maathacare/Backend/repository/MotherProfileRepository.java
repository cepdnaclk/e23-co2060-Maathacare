package com.Maathacare.Backend.repository;

import com.Maathacare.Backend.model.entity.MotherProfile;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;
import java.util.Optional;

@Repository
public interface MotherProfileRepository extends JpaRepository<MotherProfile, String> {
    boolean existsByNic(String nic);
    List<MotherProfile> findAllByPhmProfileId(String phmId);
    Optional<MotherProfile> findByUserUserId(String userId);
}