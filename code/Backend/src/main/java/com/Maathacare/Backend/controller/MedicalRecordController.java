package com.Maathacare.Backend.controller;

import com.Maathacare.Backend.model.entity.MedicalRecord;
import com.Maathacare.Backend.model.entity.MotherProfile;
import com.Maathacare.Backend.repository.MedicalRecordRepository;
import com.Maathacare.Backend.repository.MotherProfileRepository;
import com.Maathacare.Backend.service.StorageService;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;
import java.util.Optional;

@RestController
@RequestMapping("/api/medical-records")
public class MedicalRecordController {

    private final StorageService storageService;
    private final MedicalRecordRepository medicalRecordRepository;
    private final MotherProfileRepository motherProfileRepository; // Assuming you have this!

    public MedicalRecordController(StorageService storageService,
                                   MedicalRecordRepository medicalRecordRepository,
                                   MotherProfileRepository motherProfileRepository) {
        this.storageService = storageService;
        this.medicalRecordRepository = medicalRecordRepository;
        this.motherProfileRepository = motherProfileRepository;
    }

    @PostMapping("/upload")
    public ResponseEntity<?> uploadMedicalRecord(
            @RequestParam("file") MultipartFile file,
            @RequestParam("phoneNumber") String phoneNumber,
            @RequestParam("uploadedByRole") String uploadedByRole) {

        try {
            // 1. Check if mother exists
            Optional<MotherProfile> motherOpt = motherProfileRepository.findByUserPhoneNumber(phoneNumber);
            if (motherOpt.isEmpty()) {
                return ResponseEntity.status(HttpStatus.BAD_REQUEST).body("Mother profile not found.");
            }

            // 2. Upload file to Supabase S3
            String publicUrl = storageService.uploadFile(file);

            // 3. Save the link to PostgreSQL database
            MedicalRecord record = new MedicalRecord();
            record.setMotherProfile(motherOpt.get());
            record.setFileName(file.getOriginalFilename());
            record.setFileUrl(publicUrl);
            record.setUploadedByRole(uploadedByRole);

            medicalRecordRepository.save(record);

            return ResponseEntity.ok(record);

        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body("Failed to upload file: " + e.getMessage());
        }
    }

    // Changed endpoint to accept phone number
    @GetMapping("/mother/{phoneNumber}")
    public ResponseEntity<?> getRecordsForMother(@PathVariable String phoneNumber) {
        Optional<MotherProfile> motherOpt = motherProfileRepository.findByUserPhoneNumber(phoneNumber);

        if (motherOpt.isPresent()) {
            // Use the mother's actual UUID to fetch her records from the medical_records table
            List<MedicalRecord> records = medicalRecordRepository.findByMotherProfileId(motherOpt.get().getId());
            return ResponseEntity.ok(records);
        } else {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body("Mother not found");
        }
    }
}