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

    @Column(name = "reminder_3_days_sent")
    private boolean reminder3DaysSent = false;

    @Column(name = "reminder_1_day_sent")
    private boolean reminder1DaySent = false;

    @Column(name = "reminder_3_hours_sent")
    private boolean reminder3HoursSent = false;

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
    public boolean isReminder3DaysSent() { return reminder3DaysSent; }
    public void setReminder3DaysSent(boolean reminder3DaysSent) { this.reminder3DaysSent = reminder3DaysSent; }
    public boolean isReminder1DaySent() { return reminder1DaySent; }
    public void setReminder1DaySent(boolean reminder1DaySent) { this.reminder1DaySent = reminder1DaySent; }
    public boolean isReminder3HoursSent() { return reminder3HoursSent; }
    public void setReminder3HoursSent(boolean reminder3HoursSent) { this.reminder3HoursSent = reminder3HoursSent; }
}