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

    @Column(name = "fetal_heart_sounds")
    private String fhs;

    @Column(name = "fetal_movements")
    private String fetalMovements;

    @Column(name = "hemoglobin")
    private Double hb;

    @Column(name = "urine_protein")
    private String urineProtein;

    @Column(name = "urine_sugar")
    private String urineSugar;

    @Column(name = "iron_compliance")
    private Boolean iron;

    @Column(name = "folic_acid_compliance")
    private Boolean folicAcid;

    @Column(name = "calcium_compliance")
    private Boolean calcium;

    @CreationTimestamp
    @Column(name = "visit_date", updatable = false)
    private ZonedDateTime visitDate;

    // --- Getters and Setters ---
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

    public String getFhs() { return fhs; }
    public void setFhs(String fhs) { this.fhs = fhs; }

    public String getFetalMovements() { return fetalMovements; }
    public void setFetalMovements(String fetalMovements) { this.fetalMovements = fetalMovements; }

    public Double getHb() { return hb; }
    public void setHb(Double hb) { this.hb = hb; }

    public String getUrineProtein() { return urineProtein; }
    public void setUrineProtein(String urineProtein) { this.urineProtein = urineProtein; }

    public String getUrineSugar() { return urineSugar; }
    public void setUrineSugar(String urineSugar) { this.urineSugar = urineSugar; }

    public Boolean getIron() { return iron; }
    public void setIron(Boolean iron) { this.iron = iron; }

    public Boolean getFolicAcid() { return folicAcid; }
    public void setFolicAcid(Boolean folicAcid) { this.folicAcid = folicAcid; }

    public Boolean getCalcium() { return calcium; }
    public void setCalcium(Boolean calcium) { this.calcium = calcium; }

    public ZonedDateTime getVisitDate() { return visitDate; }
    public void setVisitDate(ZonedDateTime visitDate) { this.visitDate = visitDate; }
}