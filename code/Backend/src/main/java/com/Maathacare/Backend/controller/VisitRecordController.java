package com.Maathacare.Backend.controller;

import com.Maathacare.Backend.dto.VisitRecordRequest;
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
    public ResponseEntity<?> recordVisit(@RequestBody VisitRecordRequest request) {
        System.out.println("DEBUG: Received visit record for motherId: " + request.getMotherId());
        try {
            PHMProfile phm = phmService.getMyProfile();
            MotherProfile mother = motherRepository.findById(request.getMotherId())
                    .orElseThrow(() -> new RuntimeException("Mother not found"));

            VisitRecord visit = new VisitRecord();
            visit.setPhmProfile(phm);
            visit.setMotherProfile(mother);
            visit.setGestationalWeek(request.getGestationalWeek());
            visit.setWeight(request.getWeight());
            visit.setBloodPressure(request.getBloodPressure());
            visit.setSfh(request.getSfh());
            visit.setFhs(request.getFhs());
            visit.setFetalMovements(request.getFetalMovements());
            visit.setHb(request.getHb());
            visit.setUrineProtein(request.getUrineProtein());
            visit.setUrineSugar(request.getUrineSugar());
            visit.setIron(request.getIron());
            visit.setFolicAcid(request.getFolicAcid());
            visit.setCalcium(request.getCalcium());

            visitRepository.save(visit);
            return ResponseEntity.ok("Visit recorded successfully.");
        } catch (Exception e) {
            e.printStackTrace(); // This is crucial: it will print the specific error in your Java terminal
            return ResponseEntity.badRequest().body("Error: " + e.getMessage());
        }
    }
}