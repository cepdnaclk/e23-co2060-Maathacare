package com.Maathacare.Backend.dto;

import lombok.Data;

@Data // This annotation (if using Lombok) automatically generates Getters and Setters
public class KickCountRequest {
    private String userId;     // Must match the key in your React Native code
    private int kickCount;
    private String date;       // Sent as ISO string from frontend
}