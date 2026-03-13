package com.Maathacare.Backend.dto;

public class StaffRegistrationRequest {
    private String nic;
    private String staffId;
    private String password;
    private String fullName;
    private String mohArea;

    public String getNic() {
        return nic;
    }

    public void setNic(String nic) {
        this.nic = nic;
    }

    public String getStaffId() {
        return staffId;
    }

    public void setStaffId(String staffId) {
        this.staffId = staffId;
    }

    public String getPassword() {
        return password;
    }

    public void setPassword(String password) {
        this.password = password;
    }

    public String getFullName() {
        return fullName;
    }

    public void setFullName(String fullName) {
        this.fullName = fullName;
    }

    public String getMohArea() {
        return mohArea;
    }

    public void setMohArea(String mohArea) {
        this.mohArea = mohArea;
    }
}