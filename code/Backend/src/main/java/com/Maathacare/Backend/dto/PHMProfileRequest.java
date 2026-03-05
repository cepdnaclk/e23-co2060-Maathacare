package com.Maathacare.Backend.dto;

import java.util.UUID;

public class PHMProfileRequest {
    private UUID userId;
    private String registrationNumber;
    private String fullName;
    private String mohArea;
    private String contactNumber;

    // Getters
    public UUID getUserId() { return userId; }
    public String getRegistrationNumber() { return registrationNumber; }
    public String getFullName() { return fullName; }
    public String getMohArea() { return mohArea; }
    public String getContactNumber() { return contactNumber; }

    // Setters
    public void setUserId(UUID userId) { this.userId = userId; }
    public void setRegistrationNumber(String registrationNumber) { this.registrationNumber = registrationNumber; }
    public void setFullName(String fullName) { this.fullName = fullName; }
    public void setMohArea(String mohArea) { this.mohArea = mohArea; }
    public void setContactNumber(String contactNumber) { this.contactNumber = contactNumber; }
}