package com.Maathacare.Backend.model.entity;

import jakarta.persistence.*;
import org.hibernate.annotations.CreationTimestamp;
import java.time.ZonedDateTime;

@Entity
@Table(name = "visit_records")
public class VisitRecord {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private String id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "mother_id", nullable = false)
    private MotherProfile motherProfile;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "phm_id", nullable = false)
    private PHMProfile phmProfile;

    @Column(name = "gestational_week", nullable = false)
    private Integer gestationalWeek;

    @Column(name = "weight_kg")
    private Double weight;

    @Column(name = "blood_pressure", length = 20)
    private String bloodPressure;

    @Column(name = "sfh_cm")
    private Double sfh;

    @CreationTimestamp
    @Column(name = "visit_date", updatable = false)
    private ZonedDateTime visitDate;

    // Getters and Setters
    public String getId() { return id; }
    public void setId(String id) { this.id = id; }
    public MotherProfile getMotherProfile() { return motherProfile; }
    public void setMotherProfile(MotherProfile motherProfile) { this.motherProfile = motherProfile; }
    public PHMProfile getPhmProfile() { return phmProfile; }
    public void setPhmProfile(PHMProfile phmProfile) { this.phmProfile = phmProfile; }
    public Integer getGestationalWeek() { return gestationalWeek; }
    public void setGestationalWeek(Integer gestationalWeek) { this.gestationalWeek = gestationalWeek; }
    public Double getWeight() { return weight; }
    public void setWeight(Double weight) { this.weight = weight; }
    public String getBloodPressure() { return bloodPressure; }
    public void setBloodPressure(String bloodPressure) { this.bloodPressure = bloodPressure; }
    public Double getSfh() { return sfh; }
    public void setSfh(Double sfh) { this.sfh = sfh; }
    public ZonedDateTime getVisitDate() { return visitDate; }
    public void setVisitDate(ZonedDateTime visitDate) { this.visitDate = visitDate; }
}