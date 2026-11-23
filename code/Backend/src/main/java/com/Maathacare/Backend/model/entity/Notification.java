package com.Maathacare.Backend.model.entity;

import jakarta.persistence.*;
import java.time.ZonedDateTime;
import java.util.UUID;

@Entity
@Table(name = "notifications")
public class Notification {

    @Id
    private String id;

    @ManyToOne
    @JoinColumn(name = "mother_id", nullable = false)
    private MotherProfile mother;

    private String title;
    private String body;
    private String type; // e.g., "APPOINTMENT", "SUPPLEMENT"

    @Column(name = "is_read")
    private boolean isRead = false;

    @Column(name = "created_at")
    private ZonedDateTime createdAt;

    @PrePersist
    protected void onCreate() {
        this.id = UUID.randomUUID().toString();
        this.createdAt = ZonedDateTime.now(java.time.ZoneId.of("Asia/Colombo"));
    }

    // Getters and Setters
    public String getId() { return id; }
    public void setId(String id) { this.id = id; }
    public MotherProfile getMother() { return mother; }
    public void setMother(MotherProfile mother) { this.mother = mother; }
    public String getTitle() { return title; }
    public void setTitle(String title) { this.title = title; }
    public String getBody() { return body; }
    public void setBody(String body) { this.body = body; }
    public String getType() { return type; }
    public void setType(String type) { this.type = type; }
    public boolean isRead() { return isRead; }
    public void setRead(boolean read) { isRead = read; }
    public ZonedDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(ZonedDateTime createdAt) { this.createdAt = createdAt; }
}