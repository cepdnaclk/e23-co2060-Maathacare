package com.Maathacare.Backend.dto;
import java.util.List;
public class AppointmentRequest {
    private ProfileRef mother;
    private ProfileRef phm;
    private String appointmentDate;
    private String status;
    private String remarks;
    private String location;
    private List<String> supplements;

    public static class ProfileRef {
        private String id;
        public String getId() { return id; }
        public void setId(String id) { this.id = id; }
    }

    // Getters and Setters
    public ProfileRef getMother() { return mother; }
    public void setMother(ProfileRef mother) { this.mother = mother; }
    public ProfileRef getPhm() { return phm; }
    public void setPhm(ProfileRef phm) { this.phm = phm; }
    public String getAppointmentDate() { return appointmentDate; }
    public void setAppointmentDate(String appointmentDate) { this.appointmentDate = appointmentDate; }
    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }
    public String getRemarks() { return remarks; }
    public void setRemarks(String remarks) { this.remarks = remarks; }
    public String getLocation() { return location; }
    public void setLocation(String location) { this.location = location; }

    public List<String> getSupplements() {
        return supplements;
    }

    public void setSupplements(List<String> supplements) {
        this.supplements = supplements;
    }
}