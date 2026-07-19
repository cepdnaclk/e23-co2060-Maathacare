package com.Maathacare.Backend.model.entity;

import java.time.LocalDate;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import jakarta.persistence.Table;

@Entity
@Table(name = "supplements")
public class Supplement {

    @Id
    private String id; // character varying(255) to match your UUID preference

    @Column(name = "mother_id", nullable = false, length = 255)
    private String motherId;

    @Column(name = "supplement_name", nullable = false, length = 100)
    private String supplementName;

    @Column(name = "assigned_date")
    private LocalDate assignedDate;

    @Column(name = "instructions", length = 255)
    private String instructions;

    @Column(name = "dosage", length = 100)
    private String dosage;


    // Getters and Setters
    public String getId() { return id; }
    public void setId(String id) { this.id = id; }

    public String getMotherId() { return motherId; }
    public void setMotherId(String motherId) { this.motherId = motherId; }

    public String getSupplementName() { return supplementName; }
    public void setSupplementName(String supplementName) { this.supplementName = supplementName; }

    public LocalDate getAssignedDate() { return assignedDate; }
    public void setAssignedDate(LocalDate assignedDate) { this.assignedDate = assignedDate; }

    public String getInstructions() {
        return instructions;
    }

    public void setInstructions(String instructions) {
        this.instructions = instructions;
    }

    public String getDosage() {
        return dosage;
    }

    public void setDosage(String dosage) {
        this.dosage = dosage;
    }
}
