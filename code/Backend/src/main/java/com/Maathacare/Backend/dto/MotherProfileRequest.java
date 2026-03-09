package com.Maathacare.Backend.dto;

import java.time.LocalDate;
import java.util.UUID;

public class MotherProfileRequest {

    private String userId;
    private String fullName;
    private String nic;
    private LocalDate dateOfBirth;
    private String bloodGroup;
    private LocalDate LastMenstrualPeriod;
    private String emergencyContactNumber;
    private String address;
    private String chronicDiseaseStatus;
    private String district;
    private String province;

    public String getUserId() { return userId; }
    public void setUserId(String userId) { this.userId = userId; }

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

    public LocalDate getLastMenstrualPeriod() {
        return LastMenstrualPeriod;
    }

    public void setLastMenstrualPeriod(LocalDate LastMenstrualPeriod) {
        this.LastMenstrualPeriod = LastMenstrualPeriod;
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
    public String getDistrict() { return district; }
    public void setDistrict(String district) { this.district = district; }

    public String getProvince() { return province; }
    public void setProvince(String province) { this.province = province; }
}