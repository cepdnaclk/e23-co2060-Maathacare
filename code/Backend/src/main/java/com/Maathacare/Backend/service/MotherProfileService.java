package com.Maathacare.Backend.service;

import com.Maathacare.Backend.dto.MotherProfileRequest;
import com.Maathacare.Backend.dto.MotherProfileResponse; // 🟢 Added
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
        Optional<User> userOptional = userRepository.findByUserId(request.getUserId());
        if (userOptional.isEmpty()) {
            throw new RuntimeException("User account not found!");
        }
        User existingUser = userOptional.get();

        if (motherProfileRepository.existsByNic(request.getNic())) {
            throw new RuntimeException("A mother profile with this NIC already exists!");
        }

        MotherProfile newProfile = new MotherProfile();

        newProfile.setUser(existingUser);
        newProfile.setFullName(request.getFullName());
        newProfile.setNic(request.getNic());
        newProfile.setDateOfBirth(request.getDateOfBirth());
        newProfile.setBloodGroup(request.getBloodGroup());
        newProfile.setEmergencyContactNumber(request.getEmergencyContactNumber());
        newProfile.setAddress(request.getAddress());
        newProfile.setDistrict(request.getDistrict());
        newProfile.setProvince(request.getProvince());

        newProfile.setChronicDiseaseStatus(request.getChronicDiseaseStatus());

        return motherProfileRepository.save(newProfile);
    }

    // 🟢 UPDATED: Returns a DTO instead of raw Entity to fix "Not provided" error
    public MotherProfileResponse getProfileByUserId(String userId) {
        MotherProfile profile = motherProfileRepository.findByUserUserId(userId)
                .orElseThrow(() -> new RuntimeException("No profile found for this user!"));

        MotherProfileResponse response = new MotherProfileResponse();
        response.setFullName(profile.getFullName());
        response.setNic(profile.getNic());
        response.setDateOfBirth(profile.getDateOfBirth());
        response.setAddress(profile.getAddress());
        response.setEmergencyContactNumber(profile.getEmergencyContactNumber());
        response.setBloodGroup(profile.getBloodGroup());
        response.setDistrict(profile.getDistrict()); // 🟢 Now mapped
        response.setProvince(profile.getProvince()); // 🟢 Now mapped

        return response;
    }
}