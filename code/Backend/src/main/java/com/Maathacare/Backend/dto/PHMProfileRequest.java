package com.Maathacare.Backend.dto;

import java.util.UUID;

public class PHMProfileRequest {
    private String userId;
    private String registrationNumber;
    private String fullName;
    private String mohArea;
    private String contactNumber;
    private String gnDivision;

    // Getters
    public String getUserId() { return userId; }
    public String getRegistrationNumber() { return registrationNumber; }
    public String getFullName() { return fullName; }
    public String getMohArea() { return mohArea; }
    public String getContactNumber() { return contactNumber; }
    public String getGnDivision() { return gnDivision; }

    // Setters
    public void setUserId(String userId) { this.userId = userId; }
    public void setRegistrationNumber(String registrationNumber) { this.registrationNumber = registrationNumber; }
    public void setFullName(String fullName) { this.fullName = fullName; }
    public void setMohArea(String mohArea) { this.mohArea = mohArea; }
    public void setContactNumber(String contactNumber) { this.contactNumber = contactNumber; }
    public void setGnDivision(String gnDivision) { this.gnDivision = gnDivision; }
}