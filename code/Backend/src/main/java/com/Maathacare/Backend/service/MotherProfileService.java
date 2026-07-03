package com.Maathacare.Backend.service;

import com.Maathacare.Backend.dto.MotherProfileRequest;
import com.Maathacare.Backend.dto.MotherProfileResponse;
import com.Maathacare.Backend.model.entity.MotherProfile;
import com.Maathacare.Backend.model.entity.User;
import com.Maathacare.Backend.repository.MotherProfileRepository;
import com.Maathacare.Backend.repository.UserRepository;
import org.springframework.stereotype.Service;
import com.Maathacare.Backend.dto.KickCountRequest;
import com.Maathacare.Backend.model.entity.KickRecord;
import com.Maathacare.Backend.repository.KickRepository;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import com.Maathacare.Backend.model.entity.PHMProfile;
import com.Maathacare.Backend.repository.PHMProfileRepository;

import java.util.Optional;
import java.util.List;
import java.util.stream.Collectors;

@Service
public class MotherProfileService {

    private final MotherProfileRepository motherProfileRepository;
    private final UserRepository userRepository;
    private final KickRepository kickRepository;
    private final PHMProfileRepository phmProfileRepository;

    public MotherProfileService(MotherProfileRepository motherProfileRepository, UserRepository userRepository, KickRepository kickRepository, PHMProfileRepository phmProfileRepository) {
        this.motherProfileRepository = motherProfileRepository;
        this.userRepository = userRepository;
        this.phmProfileRepository = phmProfileRepository;
        this.kickRepository = kickRepository;
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
        newProfile.setLastMenstrualPeriod(request.getLastMenstrualPeriod());
        newProfile.setEmergencyContactNumber(request.getEmergencyContactNumber());
        newProfile.setAddress(request.getAddress());
        newProfile.setResidentialDivision(request.getResidentialDivision());
        newProfile.setDistrict(request.getDistrict());
        newProfile.setProvince(request.getProvince());
        newProfile.setChronicDiseaseStatus(request.getChronicDiseaseStatus());

        // Inside createMotherProfile method
        if (request.getResidentialDivision() != null) {
            // 🌟 CHANGE THIS: Search by MohArea instead of PhmDivision
            Optional<PHMProfile> assignedPhm = phmProfileRepository.findByMohArea(request.getResidentialDivision());

            if (assignedPhm.isPresent()) {
                newProfile.setPhmProfile(assignedPhm.get());
            } else {
                // Keeping your warning log so you can track it in the console[cite: 4]
                System.out.println("Warning: Registered mother without a PHM. No PHM found for area: " + request.getResidentialDivision());
            }
        }

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
        response.setLastMenstrualPeriod(profile.getLastMenstrualPeriod());
        response.setBloodGroup(profile.getBloodGroup());
        response.setDistrict(profile.getDistrict()); // 🟢 Now mapped
        response.setProvince(profile.getProvince()); // 🟢 Now mapped

        // 🌟 Add this right before returning the response
        if (profile.getPhmProfile() != null) {
            response.setPhmName(profile.getPhmProfile().getFullName());
            response.setPhmId(profile.getPhmProfile().getRegistrationNumber());
        } else {
            response.setPhmName("Pending");
            response.setPhmId("Pending");
        }

        return response;
    }

    public void saveDailyKicks(KickCountRequest request) {
        // 1. Find the MotherProfile using the userId (e.g., Asani's ID E/23/427)
        MotherProfile profile = motherProfileRepository.findByUserUserId(request.getUserId())
                .orElseThrow(() -> new RuntimeException("Profile not found"));

        // 2. Create a new entity to store in the DB
        KickRecord record = new KickRecord();
        record.setMotherProfile(profile);
        record.setCount(request.getKickCount());

        // 3. FIX: Ignore the frontend ISO string and use the actual current local time
        record.setTimestamp(LocalDateTime.now());

        // 4. Save to PostgreSQL on port 5432
        kickRepository.save(record);
    }

    public List<MotherProfileResponse> getPatientsForPhm(String phmUserId) {
        Optional<PHMProfile> phmOptional = phmProfileRepository.findByUserUserId(phmUserId);

        if (phmOptional.isEmpty()) {
            throw new RuntimeException("PHM Profile not found for this user!");
        }

        // Find all mothers linked to this specific PHM
        List<MotherProfile> patients = motherProfileRepository.findByPhmProfile(phmOptional.get());

        // Convert the database entities into nice, clean DTOs for the mobile app
        return patients.stream().map(profile -> {
            MotherProfileResponse response = new MotherProfileResponse();
            response.setFullName(profile.getFullName());
            response.setNic(profile.getNic());
            response.setDateOfBirth(profile.getDateOfBirth());
            response.setAddress(profile.getAddress());
            response.setEmergencyContactNumber(profile.getEmergencyContactNumber());
            response.setLastMenstrualPeriod(profile.getLastMenstrualPeriod());
            response.setBloodGroup(profile.getBloodGroup());
            response.setDistrict(profile.getDistrict());
            response.setProvince(profile.getProvince());
            return response;
        }).collect(Collectors.toList());
    }

    // Use String userId to match your app's login tracking
    public List<KickRecord> getKickHistoryByMotherId(String userId) {
        // Find the profile using the login User ID just like saveDailyKicks does
        MotherProfile profile = motherProfileRepository.findByUserUserId(userId)
                .orElseThrow(() -> new RuntimeException("Mother profile not found"));

        // Fetch her records sorted by time
        return kickRepository.findByMotherProfileIdOrderByTimestampAsc(profile.getId());    }
}