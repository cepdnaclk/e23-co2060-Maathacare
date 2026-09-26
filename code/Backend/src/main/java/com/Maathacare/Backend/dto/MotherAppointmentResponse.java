package com.Maathacare.Backend.dto;

public class MotherAppointmentResponse {
    private String id;
    private String date; // Format: "15 May 2026"
    private String time; // Format: "09:00 AM"
    private String location;
    private String phmName;
    private String notes;

    // Add standard getters and setters

    public String getId() {
        return id;
    }

    public void setId(String id) {
        this.id = id;
    }

    public String getDate() {
        return date;
    }

    public void setDate(String date) {
        this.date = date;
    }

    public String getTime() {
        return time;
    }

    public void setTime(String time) {
        this.time = time;
    }

    public String getLocation() {
        return location;
    }

    public void setLocation(String location) {
        this.location = location;
    }

    public String getNotes() {
        return notes;
    }

    public void setNotes(String notes) {
        this.notes = notes;
    }

    public String getPhmName() {
        return phmName;
    }

    public void setPhmName(String phmName) {
        this.phmName = phmName;
    }
}