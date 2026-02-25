package com.Maathacare.Backend.dto;

import java.time.LocalDate;
import java.util.UUID;

public class MotherProfileRequest {

    private UUID userId;
    private String fullName;
    private String nic;
    private LocalDate dateOfBirth;
    private String bloodGroup;
    private String emergencyContactNumber;
    private String address;
    private String chronicDiseaseStatus;

    public UUID getUserId() {
        return userId;
    }

    public void setUserId(UUID userId) {
        this.userId = userId;
    }

    public String getFullName() {
        return fullName;
    }

    public void setFullName(String fullName) {
        this.fullName = fullName;
    }

    public String getNic() {
        return nic;
    }

    public void setNic(String nic) {
        this.nic = nic;
    }

    public LocalDate getDateOfBirth() {
        return dateOfBirth;
    }

    public void setDateOfBirth(LocalDate dateOfBirth) {
        this.dateOfBirth = dateOfBirth;
    }

    public String getBloodGroup() {
        return bloodGroup;
    }

    public void setBloodGroup(String bloodGroup) {
        this.bloodGroup = bloodGroup;
    }

    public String getEmergencyContactNumber() {
        return emergencyContactNumber;
    }

    public void setEmergencyContactNumber(String emergencyContactNumber) {
        this.emergencyContactNumber = emergencyContactNumber;
    }

    public String getAddress() {
        return address;
    }

    public void setAddress(String address) {
        this.address = address;
    }

    public String getChronicDiseaseStatus() {
        return chronicDiseaseStatus;
    }

    public void setChronicDiseaseStatus(String chronicDiseaseStatus) {
        this.chronicDiseaseStatus = chronicDiseaseStatus;
    }
}