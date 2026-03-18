package com.Maathacare.Backend.dto;

public class StaffResponse {
    private String nic;
    private String staffId;
    private String fullName;
    private String mohArea;

    // --- GETTERS ---
    public String getNic() { return nic; }
    public String getStaffId() { return staffId; }
    public String getFullName() { return fullName; }
    public String getMohArea() { return mohArea; }

    // --- SETTERS ---
    public void setNic(String nic) { this.nic = nic; }
    public void setStaffId(String staffId) { this.staffId = staffId; }
    public void setFullName(String fullName) { this.fullName = fullName; }
    public void setMohArea(String mohArea) { this.mohArea = mohArea; }
}