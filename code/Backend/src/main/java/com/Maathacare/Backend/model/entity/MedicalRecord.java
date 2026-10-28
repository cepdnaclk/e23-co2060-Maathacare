package com.Maathacare.Backend.model.entity;

import jakarta.persistence.*;
import org.hibernate.annotations.CreationTimestamp;
import java.time.ZonedDateTime;

@Entity
@Table(name = "medical_records")
public class MedicalRecord {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private String id;

    // Links this PDF directly to a specific mother
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "mother_id", nullable = false)
    private MotherProfile motherProfile;

    @Column(name = "file_name", nullable = false)
    private String fileName;

    @Column(name = "file_url", nullable = false, columnDefinition = "TEXT")
    private String fileUrl;

    @Column(name = "uploaded_by_role")
    private String uploadedByRole; // e.g., "MOTHER" or "PHM"

    @CreationTimestamp
    @Column(name = "uploaded_at", updatable = false)
    private ZonedDateTime uploadedAt;

    // Getters and Setters
    public String getId() { return id; }
    public void setId(String id) { this.id = id; }

    public MotherProfile getMotherProfile() { return motherProfile; }
    public void setMotherProfile(MotherProfile motherProfile) { this.motherProfile = motherProfile; }

    public String getFileName() { return fileName; }
    public void setFileName(String fileName) { this.fileName = fileName; }

    public String getFileUrl() { return fileUrl; }
    public void setFileUrl(String fileUrl) { this.fileUrl = fileUrl; }

    public String getUploadedByRole() { return uploadedByRole; }
    public void setUploadedByRole(String uploadedByRole) { this.uploadedByRole = uploadedByRole; }

    public ZonedDateTime getUploadedAt() { return uploadedAt; }
    public void setUploadedAt(ZonedDateTime uploadedAt) { this.uploadedAt = uploadedAt; }
}