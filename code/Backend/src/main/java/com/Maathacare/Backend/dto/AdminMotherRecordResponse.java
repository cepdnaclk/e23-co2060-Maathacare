package com.Maathacare.Backend.dto;

import java.time.LocalDate;
import java.time.ZonedDateTime;
import java.util.ArrayList;
import java.util.List;

public class AdminMotherRecordResponse {

    private String motherId;
    private String registrationId;
    private String fullName;
    private String nic;
    private String phone;
    private String address;
    private LocalDate dateOfBirth;
    private String bloodGroup;
    private LocalDate lastMenstrualPeriod;
    private String district;
    private String province;
    private String gnDivision;
    private String residentialDivision;

    private String assignedStaffId;
    private String assignedPhmName;
    private String mohArea;

    private Integer pregnancyWeek;
    private String pregnancyWeekSource;
    private String riskLevel;
    private List<String> riskNotes = new ArrayList<>();

    private String nextClinicDate;
    private String nextClinicTime;
    private String nextClinicLocation;
    private String nextClinicStatus;

    private String chronicDiseaseStatus;
    private ZonedDateTime registrationDate;
    private ZonedDateTime latestVisitDate;
    private int medicalRecordCount;

    public String getMotherId() { return motherId; }
    public void setMotherId(String motherId) { this.motherId = motherId; }

    public String getRegistrationId() { return registrationId; }
    public void setRegistrationId(String registrationId) { this.registrationId = registrationId; }

    public String getFullName() { return fullName; }
    public void setFullName(String fullName) { this.fullName = fullName; }

    public String getNic() { return nic; }
    public void setNic(String nic) { this.nic = nic; }

    public String getPhone() { return phone; }
    public void setPhone(String phone) { this.phone = phone; }

    public String getAddress() { return address; }
    public void setAddress(String address) { this.address = address; }

    public LocalDate getDateOfBirth() { return dateOfBirth; }
    public void setDateOfBirth(LocalDate dateOfBirth) { this.dateOfBirth = dateOfBirth; }

    public String getBloodGroup() { return bloodGroup; }
    public void setBloodGroup(String bloodGroup) { this.bloodGroup = bloodGroup; }

    public LocalDate getLastMenstrualPeriod() { return lastMenstrualPeriod; }
    public void setLastMenstrualPeriod(LocalDate lastMenstrualPeriod) { this.lastMenstrualPeriod = lastMenstrualPeriod; }

    public String getDistrict() { return district; }
    public void setDistrict(String district) { this.district = district; }

    public String getProvince() { return province; }
    public void setProvince(String province) { this.province = province; }

    public String getGnDivision() { return gnDivision; }
    public void setGnDivision(String gnDivision) { this.gnDivision = gnDivision; }

    public String getResidentialDivision() { return residentialDivision; }
    public void setResidentialDivision(String residentialDivision) { this.residentialDivision = residentialDivision; }

    public String getAssignedStaffId() { return assignedStaffId; }
    public void setAssignedStaffId(String assignedStaffId) { this.assignedStaffId = assignedStaffId; }

    public String getAssignedPhmName() { return assignedPhmName; }
    public void setAssignedPhmName(String assignedPhmName) { this.assignedPhmName = assignedPhmName; }

    public String getMohArea() { return mohArea; }
    public void setMohArea(String mohArea) { this.mohArea = mohArea; }

    public Integer getPregnancyWeek() { return pregnancyWeek; }
    public void setPregnancyWeek(Integer pregnancyWeek) { this.pregnancyWeek = pregnancyWeek; }

    public String getPregnancyWeekSource() { return pregnancyWeekSource; }
    public void setPregnancyWeekSource(String pregnancyWeekSource) { this.pregnancyWeekSource = pregnancyWeekSource; }

    public String getRiskLevel() { return riskLevel; }
    public void setRiskLevel(String riskLevel) { this.riskLevel = riskLevel; }

    public List<String> getRiskNotes() { return riskNotes; }
    public void setRiskNotes(List<String> riskNotes) { this.riskNotes = riskNotes == null ? new ArrayList<>() : riskNotes; }

    public String getNextClinicDate() { return nextClinicDate; }
    public void setNextClinicDate(String nextClinicDate) { this.nextClinicDate = nextClinicDate; }

    public String getNextClinicTime() { return nextClinicTime; }
    public void setNextClinicTime(String nextClinicTime) { this.nextClinicTime = nextClinicTime; }

    public String getNextClinicLocation() { return nextClinicLocation; }
    public void setNextClinicLocation(String nextClinicLocation) { this.nextClinicLocation = nextClinicLocation; }

    public String getNextClinicStatus() { return nextClinicStatus; }
    public void setNextClinicStatus(String nextClinicStatus) { this.nextClinicStatus = nextClinicStatus; }

    public String getChronicDiseaseStatus() { return chronicDiseaseStatus; }
    public void setChronicDiseaseStatus(String chronicDiseaseStatus) { this.chronicDiseaseStatus = chronicDiseaseStatus; }

    public ZonedDateTime getRegistrationDate() { return registrationDate; }
    public void setRegistrationDate(ZonedDateTime registrationDate) { this.registrationDate = registrationDate; }

    public ZonedDateTime getLatestVisitDate() { return latestVisitDate; }
    public void setLatestVisitDate(ZonedDateTime latestVisitDate) { this.latestVisitDate = latestVisitDate; }

    public int getMedicalRecordCount() { return medicalRecordCount; }
    public void setMedicalRecordCount(int medicalRecordCount) { this.medicalRecordCount = medicalRecordCount; }
}