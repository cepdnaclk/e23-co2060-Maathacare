package com.Maathacare.Backend.repository;

import com.Maathacare.Backend.model.entity.MotherProfile;
import com.Maathacare.Backend.model.entity.PHMProfile;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;
import java.util.Optional;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

@Repository
public interface MotherProfileRepository extends JpaRepository<MotherProfile, String> {
    boolean existsByNic(String nic);
    List<MotherProfile> findAllByPhmProfileId(String phmId);
    Optional<MotherProfile> findByUserUserId(String userId);
    // 🟢 This finds all mothers assigned to a specific PHM
    List<MotherProfile> findByPhmProfile_Id(String phmId);
    // This finds a mother by her NIC number
    Optional<MotherProfile> findByNic(String nic);
    List<MotherProfile> findByPhmProfile(PHMProfile phmProfile);
    // Finds the mother by looking inside her linked User account for the phone number
    @Query("SELECT m FROM MotherProfile m WHERE m.user.phoneNumber = :phoneNumber")
    Optional<MotherProfile> findByUserPhoneNumber(@Param("phoneNumber") String phoneNumber);
}