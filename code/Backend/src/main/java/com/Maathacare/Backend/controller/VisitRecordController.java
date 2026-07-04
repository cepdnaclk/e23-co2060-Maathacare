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

import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/visits")
@CrossOrigin(origins = "*")
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

    @GetMapping("/mother/{motherId}")
    public ResponseEntity<?> getVisitsForMother(@PathVariable String motherId) {
        try {
            List<VisitRecord> visits = visitRepository.findByMotherProfile_IdOrderByGestationalWeekAsc(motherId);

            // Map the data to a clean format for the mobile app
            List<Map<String, Object>> response = visits.stream().map(v -> {
                Map<String, Object> map = new HashMap<>();
                map.put("id", v.getId());
                map.put("gestationalWeek", v.getGestationalWeek());
                map.put("weight", v.getWeight());
                map.put("bloodPressure", v.getBloodPressure());
                map.put("sfh", v.getSfh());
                map.put("fhs", v.getFhs());
                map.put("fetalMovements", v.getFetalMovements());
                map.put("hb", v.getHb());
                map.put("urineProtein", v.getUrineProtein());
                map.put("urineSugar", v.getUrineSugar());
                map.put("iron", v.getIron());
                map.put("calcium", v.getCalcium());
                map.put("folicAcid", v.getFolicAcid());
                map.put("visitDate", v.getVisitDate());
                return map;
            }).collect(Collectors.toList());

            return ResponseEntity.ok(response);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<?> deleteVisitRecord(@PathVariable String id) {
        try {
            if (!visitRepository.existsById(id)) {
                return ResponseEntity.notFound().build();
            }
            visitRepository.deleteById(id);
            return ResponseEntity.ok("Record deleted successfully.");
        } catch (Exception e) {
            return ResponseEntity.badRequest().body("Failed to delete record: " + e.getMessage());
        }
    }
}