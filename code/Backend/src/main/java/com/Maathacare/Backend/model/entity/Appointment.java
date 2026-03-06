package com.Maathacare.Backend.model.entity;

import jakarta.persistence.*;
import java.time.LocalDateTime;
import java.util.UUID;

@Entity
@Table(name = "appointments")
public class Appointment {
    @Id
    @GeneratedValue(strategy = GenerationType.UUID) // Specifically for String IDs
    private String id;

    @ManyToOne
    @JoinColumn(name = "mother_id", nullable = false)
    private MotherProfile mother;

    @ManyToOne
    @JoinColumn(name = "phm_id", nullable = false)
    private PHMProfile phm;

    private LocalDateTime appointmentDate;
    private String location;
    private String status;
    private String remarks;

    // --- Getters and Setters ---

    public String getId() { return id; }
    public void setId(String id) { this.id = id; }

    public MotherProfile getMother() { return mother; }
    public void setMother(MotherProfile mother) { this.mother = mother; }

    public PHMProfile getPhm() { return phm; }
    public void setPhm(PHMProfile phm) { this.phm = phm; }

    public LocalDateTime getAppointmentDate() { return appointmentDate; }
    public void setAppointmentDate(LocalDateTime appointmentDate) { this.appointmentDate = appointmentDate; }

    public String getLocation() { return location; }
    public void setLocation(String location) { this.location = location; }

    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }

    public String getRemarks() { return remarks; }
    public void setRemarks(String remarks) { this.remarks = remarks; }
}