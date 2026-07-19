package com.Maathacare.Backend.dto;

import lombok.Data;

@Data
public class StaffResponse {
    private String nic;
    private String staffId;
    private String fullName;
    private String mohArea;
    private Boolean isActive;
    private String gnDivision;
    private long motherCount;
}
