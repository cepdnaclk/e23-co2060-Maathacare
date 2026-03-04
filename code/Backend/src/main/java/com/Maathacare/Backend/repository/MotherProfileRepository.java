package com.Maathacare.Backend.repository;

import com.Maathacare.Backend.model.entity.MotherProfile;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.UUID;

@Repository
public interface MotherProfileRepository extends JpaRepository<MotherProfile, UUID> {

    // Your teammate's method: Checks if a Mother's NIC already exists
    boolean existsByNic(String nic);

    // YOUR method (Part 2): Finds all Mothers assigned to a specific PHM
    List<MotherProfile> findAllByPhmProfileId(UUID phmId);

}