package com.Maathacare.Backend.model.entity;

import jakarta.persistence.*;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;
import java.time.LocalDate;
import java.time.ZonedDateTime;
import java.util.UUID;

@Entity
@Table(name = "mother_profiles")
public class MotherProfile {
    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    // Links to auth credentials
    @OneToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", referencedColumnName = "id", nullable = false)
    private User user;

    // Links the mother to her assigned PHM
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "phm_id", referencedColumnName = "id")
    private PHMProfile phmProfile;

    @Column(length = 12, unique = true, nullable = false)
    private String nic;

    @Column(name = "full_name", length = 100, nullable = false)
    private String fullName;

    @Column(name = "date_of_birth")
    private LocalDate dateOfBirth;

    @Column(columnDefinition = "TEXT")
    private String address;

    @Column(name = "emergency_contact_number", length = 15, nullable = false)
    private String emergencyContactNumber;

    @Column(name = "chronic_disease_status", columnDefinition = "TEXT")
    private String chronicDiseaseStatus;

    @Column(name = "blood_group", length = 5)
    private String bloodGroup;

    @CreationTimestamp
    @Column(name = "created_at", updatable = false)
    private ZonedDateTime createdAt;

    @UpdateTimestamp
    @Column(name = "updated_at")
    private ZonedDateTime updatedAt;

    public UUID getId() {
        return id;
    }

    public void setId(UUID id) {
        this.id = id;
    }

    public User getUser() {
        return user;
    }

    public void setUser(User user) {
        this.user = user;
    }

    public PHMProfile getPhmProfile() {
        return phmProfile;
    }

    public void setPhmProfile(PHMProfile phmProfile) {
        this.phmProfile = phmProfile;
    }

    public String getNic() {
        return nic;
    }

    public void setNic(String nic) {
        this.nic = nic;
    }

    public String getFullName() {
        return fullName;
    }

    public void setFullName(String fullName) {
        this.fullName = fullName;
    }

    public LocalDate getDateOfBirth() {
        return dateOfBirth;
    }

    public void setDateOfBirth(LocalDate dateOfBirth) {
        this.dateOfBirth = dateOfBirth;
    }

    public String getAddress() {
        return address;
    }

    public void setAddress(String address) {
        this.address = address;
    }

    public String getEmergencyContactNumber() {
        return emergencyContactNumber;
    }

    public void setEmergencyContactNumber(String emergencyContactNumber) {
        this.emergencyContactNumber = emergencyContactNumber;
    }

    public String getChronicDiseaseStatus() {
        return chronicDiseaseStatus;
    }

    public void setChronicDiseaseStatus(String chronicDiseaseStatus) {
        this.chronicDiseaseStatus = chronicDiseaseStatus;
    }

    public String getBloodGroup() {
        return bloodGroup;
    }

    public void setBloodGroup(String bloodGroup) {
        this.bloodGroup = bloodGroup;
    }

    public ZonedDateTime getCreatedAt() {
        return createdAt;
    }

    public void setCreatedAt(ZonedDateTime createdAt) {
        this.createdAt = createdAt;
    }

    public ZonedDateTime getUpdatedAt() {
        return updatedAt;
    }

    public void setUpdatedAt(ZonedDateTime updatedAt) {
        this.updatedAt = updatedAt;
    }
}