package com.Maathacare.Backend.model.entity;

import com.Maathacare.Backend.model.enums.AppointmentStatus;
import jakarta.persistence.*;
import org.hibernate.annotations.CreationTimestamp;

import java.time.ZonedDateTime;

@Entity
@Table(name = "appointments")
public class Appointment {
    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private String id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "mother_id", nullable = false)
    private MotherProfile mother;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "phm_id", nullable = false)
    private PHMProfile phm;

    @Column(name = "appointment_date", nullable = false)
    private ZonedDateTime appointmentDate;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private AppointmentStatus status;

    @Column(columnDefinition = "TEXT")
    private String remarks;

    @Column(length = 100)
    private String location; // e.g., "Home Visit" or "Clinic"

    @CreationTimestamp
    @Column(name = "created_at", updatable = false)
    private ZonedDateTime createdAt;

    // Getters and Setters
    public String getId() { return id; }
    public void setId(String id) { this.id = id; }
    public MotherProfile getMother() { return mother; }
    public void setMother(MotherProfile mother) { this.mother = mother; }
    public PHMProfile getPhm() { return phm; }
    public void setPhm(PHMProfile phm) { this.phm = phm; }
    public ZonedDateTime getAppointmentDate() { return appointmentDate; }
    public void setAppointmentDate(ZonedDateTime appointmentDate) { this.appointmentDate = appointmentDate; }
    public AppointmentStatus getStatus() { return status; }
    public void setStatus(AppointmentStatus status) { this.status = status; }
    public String getRemarks() { return remarks; }
    public void setRemarks(String remarks) { this.remarks = remarks; }
    public String getLocation() { return location; }
    public void setLocation(String location) { this.location = location; }
    public ZonedDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(ZonedDateTime createdAt) { this.createdAt = createdAt; }
}