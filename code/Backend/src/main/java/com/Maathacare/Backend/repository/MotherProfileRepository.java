package com.Maathacare.Backend.repository;

import com.Maathacare.Backend.model.entity.MotherProfile;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;
import java.util.UUID;
import java.util.Optional;

@Repository
public interface MotherProfileRepository extends JpaRepository<MotherProfile, UUID> {
    boolean existsByNic(String nic);
<<<<<<< HEAD

    // YOUR method (Part 2): Finds all Mothers assigned to a specific PHM
    List<MotherProfile> findAllByPhmProfileId(UUID phmId);
    Optional<MotherProfile> findByUserId(UUID userId);
}
=======
}
>>>>>>> 1a728557fcc65a926ecb8981627f6dc3e5cc0cec
