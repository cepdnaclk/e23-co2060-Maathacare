package com.Maathacare.Backend.service;

import com.Maathacare.Backend.dto.PHMProfileRequest;
import com.Maathacare.Backend.model.entity.MotherProfile;
import com.Maathacare.Backend.model.entity.PHMProfile;
import com.Maathacare.Backend.model.entity.User;
import com.Maathacare.Backend.repository.MotherProfileRepository;
import com.Maathacare.Backend.repository.PHMProfileRepository;
import com.Maathacare.Backend.repository.UserRepository;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.UUID;

@Service
public class PHMProfileService {

    private final PHMProfileRepository phmProfileRepository;
    private final UserRepository userRepository;
    private final MotherProfileRepository motherProfileRepository; // Added this!

    // Updated the constructor to include MotherProfileRepository
    public PHMProfileService(PHMProfileRepository phmProfileRepository,
                             UserRepository userRepository,
                             MotherProfileRepository motherProfileRepository) {
        this.phmProfileRepository = phmProfileRepository;
        this.userRepository = userRepository;
        this.motherProfileRepository = motherProfileRepository;
    }

    // Your existing code from Part 1
    public PHMProfile createPHMProfile(PHMProfileRequest request) {
        User user = userRepository.findById(request.getUserId())
                .orElseThrow(() -> new RuntimeException("User not found!"));

        PHMProfile newProfile = new PHMProfile();
        newProfile.setUser(user);
        newProfile.setRegistrationNumber(request.getRegistrationNumber());
        newProfile.setFullName(request.getFullName());
        newProfile.setMohArea(request.getMohArea());
        newProfile.setContactNumber(request.getContactNumber());

        return phmProfileRepository.save(newProfile);
    }

    // YOUR NEW CODE FOR PART 2: Fetching the mothers!
    public List<MotherProfile> getMothersForPhm(UUID phmId) {
        // This calls the exact "magic" method you just wrote in the Repository!
        return motherProfileRepository.findAllByPhmProfileId(phmId);
    }
}