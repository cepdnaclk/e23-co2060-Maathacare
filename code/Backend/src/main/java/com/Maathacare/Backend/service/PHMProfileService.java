package com.Maathacare.Backend.service;

import com.Maathacare.Backend.dto.PHMProfileRequest;
import com.Maathacare.Backend.model.entity.PHMProfile;
import com.Maathacare.Backend.model.entity.User;
import com.Maathacare.Backend.repository.PHMProfileRepository;
import com.Maathacare.Backend.repository.UserRepository;
import org.springframework.stereotype.Service;

@Service
public class PHMProfileService {

    private final PHMProfileRepository phmProfileRepository;
    private final UserRepository userRepository;

    public PHMProfileService(PHMProfileRepository phmProfileRepository, UserRepository userRepository) {
        this.phmProfileRepository = phmProfileRepository;
        this.userRepository = userRepository;
    }

    public PHMProfile createPHMProfile(PHMProfileRequest request) {
        // 1. Find the user account this profile belongs to
        User user = userRepository.findById(request.getUserId())
                .orElseThrow(() -> new RuntimeException("User not found!"));

        // 2. Create the new PHM Profile
        PHMProfile newProfile = new PHMProfile();
        newProfile.setUser(user); // Links the PHM profile to the User account
        newProfile.setRegistrationNumber(request.getRegistrationNumber());
        newProfile.setFullName(request.getFullName());
        newProfile.setMohArea(request.getMohArea());
        newProfile.setContactNumber(request.getContactNumber());

        // 3. Save to database
        return phmProfileRepository.save(newProfile);
    }
}