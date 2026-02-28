package com.Maathacare.Backend.service;

import com.Maathacare.Backend.dto.MotherProfileRequest;
import com.Maathacare.Backend.model.entity.MotherProfile;
import com.Maathacare.Backend.model.entity.User;
import com.Maathacare.Backend.repository.MotherProfileRepository;
import com.Maathacare.Backend.repository.UserRepository;
import org.springframework.stereotype.Service;

import java.util.Optional;

@Service
public class MotherProfileService {

    private final MotherProfileRepository motherProfileRepository;
    private final UserRepository userRepository;

    public MotherProfileService(MotherProfileRepository motherProfileRepository, UserRepository userRepository) {
        this.motherProfileRepository = motherProfileRepository;
        this.userRepository = userRepository;
    }

    public MotherProfile createMotherProfile(MotherProfileRequest request) {
        // 1. Check if the User account actually exists
        Optional<User> userOptional = userRepository.findById(request.getUserId());
        if (userOptional.isEmpty()) {
            throw new RuntimeException("User account not found!");
        }
        User existingUser = userOptional.get();

        // 2. Check if this NIC is already registered to a mother
        if (motherProfileRepository.existsByNic(request.getNic())) {
            throw new RuntimeException("A mother profile with this NIC already exists!");
        }

        // 3. Create a brand new blank Mother Profile
        MotherProfile newProfile = new MotherProfile();

        // 4. Copy the data from your DTO form into the database entity
        newProfile.setUser(existingUser); // This links the Mother to the User account!
        newProfile.setFullName(request.getFullName());
        newProfile.setNic(request.getNic());
        newProfile.setDateOfBirth(request.getDateOfBirth());
        newProfile.setBloodGroup(request.getBloodGroup());
        newProfile.setEmergencyContactNumber(request.getEmergencyContactNumber());
        newProfile.setAddress(request.getAddress());
        newProfile.setChronicDiseaseStatus(request.getChronicDiseaseStatus());

        // 5. Save it to the database!
        return motherProfileRepository.save(newProfile);
    }

    public MotherProfile getProfileByUserId(String userIdString) {
        // 1. Convert the plain text String ID into a strict Java UUID
        java.util.UUID userId = java.util.UUID.fromString(userIdString);

        // 2. Ask the database to find the profile
        java.util.Optional<MotherProfile> profileOptional = motherProfileRepository.findByUserId(userId);

        // 3. If it doesn't exist, throw an error. If it does, return it!
        if (profileOptional.isEmpty()) {
            throw new RuntimeException("No Mother Profile found for this user!");
        }

        return profileOptional.get();
    }
}