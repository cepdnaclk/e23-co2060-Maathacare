package com.Maathacare.Backend.controller;

import com.Maathacare.Backend.model.entity.MotherProfile;
import com.Maathacare.Backend.model.entity.PHMProfile;
import com.Maathacare.Backend.model.entity.VisitRecord;
import com.Maathacare.Backend.repository.MotherProfileRepository;
import com.Maathacare.Backend.repository.VisitRecordRepository;
import com.Maathacare.Backend.service.PHMProfileService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/visits")
public class VisitRecordController {

    private final VisitRecordRepository visitRepository;
    private final MotherProfileRepository motherRepository;
    private final PHMProfileService phmService;

    public VisitRecordController(VisitRecordRepository visitRepository, MotherProfileRepository motherRepository, PHMProfileService phmService) {
        this.visitRepository = visitRepository;
        this.motherRepository = motherRepository;
        this.phmService = phmService;
    }

    @PostMapping("/record")
    public ResponseEntity<?> recordVisit(
            @RequestParam String motherId,
            @RequestParam Integer gestationalWeek,
            @RequestParam Double weight,
            @RequestParam String bloodPressure,
            @RequestParam Double sfh) {

        try {
            PHMProfile phm = phmService.getMyProfile();
            MotherProfile mother = motherRepository.findById(motherId)
                    .orElseThrow(() -> new RuntimeException("Mother not found"));

            VisitRecord visit = new VisitRecord();
            visit.setPhmProfile(phm);
            visit.setMotherProfile(mother);
            visit.setGestationalWeek(gestationalWeek);
            visit.setWeight(weight);
            visit.setBloodPressure(bloodPressure);
            visit.setSfh(sfh);

            visitRepository.save(visit);
            return ResponseEntity.ok("Visit recorded successfully.");
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }
}