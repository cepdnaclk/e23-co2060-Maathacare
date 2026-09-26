package com.Maathacare.Backend.dto;

public class AppointmentResponse {
    private String id;
    private String time;       // e.g. "10:30 AM"
    private String dateDay;    // e.g. "17"
    private String fullDate;   // e.g. "2026-05-17"
    private String motherName;
    private String type;
    private String reason;
    private String status;

    // Getters and Setters
    public String getId() { return id; }
    public void setId(String id) { this.id = id; }
    public String getTime() { return time; }
    public void setTime(String time) { this.time = time; }
    public String getDateDay() { return dateDay; }
    public void setDateDay(String dateDay) { this.dateDay = dateDay; }
    public String getFullDate() { return fullDate; }
    public void setFullDate(String fullDate) { this.fullDate = fullDate; }
    public String getMotherName() { return motherName; }
    public void setMotherName(String motherName) { this.motherName = motherName; }
    public String getType() { return type; }
    public void setType(String type) { this.type = type; }
    public String getReason() { return reason; }
    public void setReason(String reason) { this.reason = reason; }
    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }
}