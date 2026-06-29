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

        // 0. Validate input before doing anything
        if (file.isEmpty()) {
            return ResponseEntity.badRequest().body("File is empty.");
        }

        try {
            // 1. Check if mother exists
            Optional<MotherProfile> motherOpt = motherProfileRepository.findByUserPhoneNumber(phoneNumber);
            if (motherOpt.isEmpty()) {
                System.err.println("DEBUG: Mother not found for phone: " + phoneNumber);
                return ResponseEntity.status(HttpStatus.BAD_REQUEST).body("Mother profile not found.");
            }

            // 2. Upload file to Supabase S3
            System.out.println("DEBUG: Starting S3 upload for file: " + file.getOriginalFilename());
            String publicUrl = storageService.uploadFile(file);
            System.out.println("DEBUG: File uploaded to: " + publicUrl);

            // 3. Save the link to PostgreSQL database
            MedicalRecord record = new MedicalRecord();
            record.setMotherProfile(motherOpt.get());
            record.setFileName(file.getOriginalFilename());
            record.setFileUrl(publicUrl);
            record.setUploadedByRole(uploadedByRole);

            MedicalRecord savedRecord = medicalRecordRepository.save(record);

            return ResponseEntity.ok(savedRecord);

        } catch (Exception e) {
            // THIS WILL NOW SHOW THE REAL ERROR IN YOUR TERMINAL
            e.printStackTrace();
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