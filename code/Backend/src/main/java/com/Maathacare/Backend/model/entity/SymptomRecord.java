package com.Maathacare.Backend.model.entity;

import jakarta.persistence.*;
import java.time.LocalDateTime;
import java.util.List;

@Entity
@Table(name = "symptom_records") // Matches your database table exactly
public class SymptomRecord {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "user_id")
    private String userId;

    // This creates a secondary table to hold the list of string symptoms
    @ElementCollection
    @CollectionTable(name = "symptom_record_symptoms", joinColumns = @JoinColumn(name = "symptom_record_id"))
    @Column(name = "symptom")
    private List<String> symptoms;

    @Column(name = "timestamp")
    private LocalDateTime timestamp;

    public SymptomRecord() {}

    // Getters and Setters
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    public String getUserId() { return userId; }
    public void setUserId(String userId) { this.userId = userId; }
    public List<String> getSymptoms() { return symptoms; }
    public void setSymptoms(List<String> symptoms) { this.symptoms = symptoms; }
    public LocalDateTime getTimestamp() { return timestamp; }
    public void setTimestamp(LocalDateTime timestamp) { this.timestamp = timestamp; }
}