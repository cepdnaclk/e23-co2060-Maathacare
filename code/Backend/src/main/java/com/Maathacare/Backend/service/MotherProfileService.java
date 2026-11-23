package com.Maathacare.Backend.service;

import com.Maathacare.Backend.dto.MotherProfileRequest;
import com.Maathacare.Backend.dto.MotherProfileResponse;
import com.Maathacare.Backend.model.entity.MotherProfile;
import com.Maathacare.Backend.model.entity.User;
import com.Maathacare.Backend.repository.MotherProfileRepository;
import com.Maathacare.Backend.repository.UserRepository;
import org.springframework.stereotype.Service;
import com.Maathacare.Backend.dto.KickCountRequest;
import com.Maathacare.Backend.repository.KickRepository;
import java.time.LocalDateTime;
import com.Maathacare.Backend.model.entity.PHMProfile;
import com.Maathacare.Backend.repository.PHMProfileRepository;
import org.springframework.transaction.annotation.Transactional;
import com.Maathacare.Backend.model.entity.KickRecord;

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

    // 📁 FIXED: Matches main's new registration transaction system
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

        // Note: The PHM assignment logic has been moved to the UserController
        // to handle registration and profile creation in a single transaction.

        return motherProfileRepository.save(newProfile);
    }

    // 🔒 KEEPS YOUR DIGITAL LOCKER CHANGES: Safe and intact!
    @Transactional
    public MotherProfileResponse updateMotherProfile(String userId, MotherProfileRequest request) {
        MotherProfile profile = motherProfileRepository.findByUserUserId(userId)
                .orElseThrow(() -> new RuntimeException("Mother profile not found for user ID: " + userId));

        if (request.getFullName() != null) profile.setFullName(request.getFullName());
        if (request.getEmergencyContactNumber() != null) profile.setEmergencyContactNumber(request.getEmergencyContactNumber());
        if (request.getAddress() != null) profile.setAddress(request.getAddress());
        if (request.getChronicDiseaseStatus() != null) profile.setChronicDiseaseStatus(request.getChronicDiseaseStatus());
        if (request.getResidentialDivision() != null) profile.setResidentialDivision(request.getResidentialDivision());
        if (request.getEmergencyContactName() != null) profile.setEmergencyContactName(request.getEmergencyContactName());
        if (request.getEmergencyContactRelationship() != null) profile.setEmergencyContactRelationship(request.getEmergencyContactRelationship());

        MotherProfile savedProfile = motherProfileRepository.save(profile);

        MotherProfileResponse response = new MotherProfileResponse();
        response.setFullName(savedProfile.getFullName());
        response.setNic(savedProfile.getNic());
        response.setDateOfBirth(savedProfile.getDateOfBirth());
        response.setAddress(savedProfile.getAddress());
        response.setEmergencyContactNumber(savedProfile.getEmergencyContactNumber());
        response.setLastMenstrualPeriod(savedProfile.getLastMenstrualPeriod());
        response.setBloodGroup(savedProfile.getBloodGroup());
        response.setDistrict(savedProfile.getDistrict());
        response.setProvince(savedProfile.getProvince());
        response.setEmergencyContactName(savedProfile.getEmergencyContactName());
        response.setEmergencyContactRelationship(savedProfile.getEmergencyContactRelationship());
        response.setProfilePictureUrl(savedProfile.getProfilePictureUrl());
        response.setMohArea(savedProfile.getResidentialDivision());
        response.setGnDivision(savedProfile.getGnDivision());

        if (savedProfile.getPhmProfile() != null) {
            response.setPhmName(savedProfile.getPhmProfile().getFullName());
            response.setPhmId(savedProfile.getPhmProfile().getRegistrationNumber());
        } else {
            response.setPhmName("Pending");
            response.setPhmId("Pending");
        }

        return response;
    }

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
        response.setDistrict(profile.getDistrict());
        response.setProvince(profile.getProvince());
        response.setEmergencyContactName(profile.getEmergencyContactName());
        response.setEmergencyContactRelationship(profile.getEmergencyContactRelationship());
        response.setProfilePictureUrl(profile.getProfilePictureUrl());
        response.setMohArea(profile.getResidentialDivision());
        response.setGnDivision(profile.getGnDivision());

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
        // 1. Find the MotherProfile using the userId
        MotherProfile profile = motherProfileRepository.findByUserUserId(request.getUserId())
                .orElseThrow(() -> new RuntimeException("Profile not found"));

        KickRecord record = new KickRecord();
        record.setMotherProfile(profile);
        record.setCount(request.getKickCount());
        record.setTimestamp(LocalDateTime.now());
        kickRepository.save(record);
    }

    public List<MotherProfileResponse> getPatientsForPhm(String phmUserId) {
        Optional<PHMProfile> phmOptional = phmProfileRepository.findByUserUserId(phmUserId);

        if (phmOptional.isEmpty()) {
            throw new RuntimeException("PHM Profile not found for this user!");
        }

        List<MotherProfile> patients = motherProfileRepository.findByPhmProfile(phmOptional.get());

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

    // --- NEW METHOD ADDED HERE ---
    public void updatePushTokenByUserId(String userId, String pushToken) {
        // Find the mother profile by user ID or throw an error if not found
        MotherProfile profile = motherProfileRepository.findByUserUserId(userId)
                .orElseThrow(() -> new RuntimeException("Mother profile not found for user ID: " + userId));

        // Set the token and save it back to PostgreSQL
        profile.setPushToken(pushToken);
        motherProfileRepository.save(profile);
    }
    // Use String userId to match your app's login tracking
    public List<KickRecord> getKickHistoryByMotherId(String userId) {
        MotherProfile profile = motherProfileRepository.findByUserUserId(userId)
                .orElseThrow(() -> new RuntimeException("Mother profile not found"));

        return kickRepository.findByMotherProfile_IdOrderByTimestampAsc(profile.getId());
    }
}
