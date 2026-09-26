package com.Maathacare.Backend.dto;

import lombok.Data;

@Data // This annotation (if using Lombok) automatically generates Getters and Setters
public class KickCountRequest {
    private String userId;     // Must match the key in your React Native code
    private int kickCount;
    private String date;       // Sent as ISO string from frontend

    public String getUserId() {
        return userId;
    }

    public void setUserId(String userId) {
        this.userId = userId;
    }

    public int getKickCount() {
        return kickCount;
    }

    public void setKickCount(int kickCount) {
        this.kickCount = kickCount;
    }

    public String getDate() {
        return date;
    }

    public void setDate(String date) {
        this.date = date;
    }
}