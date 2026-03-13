package com.Maathacare.Backend.service;

import com.Maathacare.Backend.dto.PHMProfileRequest;
import com.Maathacare.Backend.model.entity.MotherProfile;
import com.Maathacare.Backend.model.entity.PHMProfile;
import com.Maathacare.Backend.model.entity.User;
import com.Maathacare.Backend.repository.MotherProfileRepository;
import com.Maathacare.Backend.repository.PHMProfileRepository;
import com.Maathacare.Backend.repository.UserRepository;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class PHMProfileService {

    private final PHMProfileRepository phmRepo;
    private final UserRepository userRepository;
    private final MotherProfileRepository motherRepo;

    public PHMProfileService(PHMProfileRepository phmRepo,
                             UserRepository userRepository,
                             MotherProfileRepository motherRepo) {
        this.phmRepo = phmRepo;
        this.userRepository = userRepository;
        this.motherRepo = motherRepo;
    }

    /**
     * 1. Setup/Create a new PHM Profile (Used by the test creator)
     */
    public PHMProfile createPHMProfile(PHMProfileRequest request) {
        User user = userRepository.findByUserId(request.getUserId())
                .orElseThrow(() -> new RuntimeException("User not found!"));

        PHMProfile newProfile = new PHMProfile();
        newProfile.setUser(user);
        newProfile.setRegistrationNumber(request.getRegistrationNumber());
        newProfile.setFullName(request.getFullName());
        newProfile.setMohArea(request.getMohArea());
        newProfile.setContactNumber(request.getContactNumber());

        return phmRepo.save(newProfile);
    }

    /**
     * 2. Get the logged-in PHM's profile using JWT context
     */
    public PHMProfile getMyProfile() {
        // This extracts the "Subject" from your JWT (which is 999999999V or PHM-100)
        String identifier = SecurityContextHolder.getContext().getAuthentication().getName();

        // 🟢 Try finding by Staff ID first, then by User ID
        return phmRepo.findByUserStaffId(identifier)
                .orElseGet(() -> phmRepo.findByUserUserId(identifier)
                        .orElseThrow(() -> new RuntimeException("PHM Profile not found for: " + identifier)));
    }

    /**
     * 3. Get the list of Mothers assigned to this specific PHM
     */
    public List<MotherProfile> getMyPatients() {
        PHMProfile phm = getMyProfile();
        // 🟢 Use the corrected repository method name
        return motherRepo.findByPhmProfile_Id(phm.getId());
    }
}