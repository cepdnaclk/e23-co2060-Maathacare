package com.Maathacare.Backend.dto;

public class AuthRequest {
    private String userId;     // For Mothers
    private String staffId;    // For Staff
    private String password;   // For Everyone

    // --- GETTERS AND SETTERS ---

    public String getUserId() {
        return userId;
    }

    public void setUserId(String userId) {
        this.userId = userId;
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
}