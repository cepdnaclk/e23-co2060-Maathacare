package com.Maathacare.Backend.controller;

import com.Maathacare.Backend.dto.KickCountRequest;
import com.Maathacare.Backend.dto.SymptomRequest;
import com.Maathacare.Backend.model.entity.KickRecord;
import com.Maathacare.Backend.model.entity.MotherProfile;
import com.Maathacare.Backend.model.entity.SymptomRecord;
import com.Maathacare.Backend.repository.KickRepository;
import com.Maathacare.Backend.repository.MotherProfileRepository;
import com.Maathacare.Backend.repository.SymptomRepository;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.server.ResponseStatusException;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/mothers")
@CrossOrigin(origins = "*")
public class MotherWellnessController {

    private final MotherProfileRepository motherProfileRepository;
    private final KickRepository kickRepository;
    private final SymptomRepository symptomRepository;

    public MotherWellnessController(
            MotherProfileRepository motherProfileRepository,
            KickRepository kickRepository,
            SymptomRepository symptomRepository
    ) {
        this.motherProfileRepository = motherProfileRepository;
        this.kickRepository = kickRepository;
        this.symptomRepository = symptomRepository;
    }

    @PostMapping("/kicks")
    public ResponseEntity<?> saveKickCount(
            @RequestBody KickCountRequest request,
            Authentication authentication
    ) {
        if (request.getKickCount() < 0) {
            return ResponseEntity.badRequest()
                    .body("Kick count cannot be negative.");
        }

        MotherProfile mother = getAuthenticatedMother(authentication);
        LocalDate recordDate = parseDateOrToday(request.getDate());

        LocalDateTime recordTimestamp =
                recordDate.equals(LocalDate.now())
                        ? LocalDateTime.now()
                        : LocalDateTime.of(
                        recordDate,
                        LocalTime.MIDNIGHT
                );

        KickRecord record = new KickRecord();
        record.setMotherProfile(mother);
        record.setCount(request.getKickCount());
        record.setTimestamp(recordTimestamp);

        KickRecord saved = kickRepository.save(record);

        Map<String, Object> response = new LinkedHashMap<>();
        response.put(
                "message",
                "Kick count saved successfully"
        );
        response.put("id", saved.getId());
        response.put("kickCount", saved.getCount());
        response.put(
                "date",
                saved.getTimestamp() == null
                        ? null
                        : saved.getTimestamp().toLocalDate()
        );
        response.put("timestamp", saved.getTimestamp());

        return ResponseEntity.ok(response);
    }

    @GetMapping("/kicks/history")
    public ResponseEntity<List<Map<String, Object>>> getKickHistory(
            Authentication authentication
    ) {
        MotherProfile mother =
                getAuthenticatedMother(authentication);

        List<Map<String, Object>> history = kickRepository
                .findByMotherProfile_IdOrderByTimestampAsc(
                        mother.getId()
                )
                .stream()
                .map(record -> {
                    Map<String, Object> item =
                            new LinkedHashMap<>();

                    item.put("id", record.getId());
                    item.put(
                            "kickCount",
                            record.getCount()
                    );
                    item.put(
                            "date",
                            record.getTimestamp() == null
                                    ? null
                                    : record.getTimestamp()
                                    .toLocalDate()
                    );
                    item.put(
                            "timestamp",
                            record.getTimestamp()
                    );

                    return item;
                })
                .toList();

        return ResponseEntity.ok(history);
    }

    @PostMapping("/symptoms")
    public ResponseEntity<?> saveSymptoms(
            @RequestBody SymptomRequest request,
            Authentication authentication
    ) {
        if (request.getSymptoms() == null
                || request.getSymptoms().isEmpty()) {
            return ResponseEntity.badRequest()
                    .body("Select at least one symptom.");
        }

        String userId =
                requireAuthenticatedUser(authentication);

        SymptomRecord record = new SymptomRecord();
        record.setUserId(userId);
        record.setSymptoms(request.getSymptoms());
        record.setTimestamp(LocalDateTime.now());

        SymptomRecord saved =
                symptomRepository.save(record);

        Map<String, Object> response =
                new LinkedHashMap<>();

        response.put(
                "message",
                "Symptoms saved successfully"
        );
        response.put("id", saved.getId());
        response.put(
                "symptoms",
                saved.getSymptoms()
        );
        response.put(
                "timestamp",
                saved.getTimestamp()
        );

        return ResponseEntity.ok(response);
    }

    @GetMapping("/symptoms/history")
    public ResponseEntity<List<SymptomRecord>>
    getSymptomHistory(Authentication authentication) {

        String userId =
                requireAuthenticatedUser(authentication);

        return ResponseEntity.ok(
                symptomRepository
                        .findByUserIdOrderByTimestampDesc(
                                userId
                        )
        );
    }

    private MotherProfile getAuthenticatedMother(
            Authentication authentication
    ) {
        String userId =
                requireAuthenticatedUser(authentication);

        return motherProfileRepository
                .findByUserUserId(userId)
                .orElseThrow(() ->
                        new ResponseStatusException(
                                HttpStatus.NOT_FOUND,
                                "Mother profile not found for authenticated user."
                        )
                );
    }

    private String requireAuthenticatedUser(
            Authentication authentication
    ) {
        if (authentication == null
                || !authentication.isAuthenticated()
                || authentication.getName() == null
                || authentication.getName().isBlank()) {

            throw new ResponseStatusException(
                    HttpStatus.UNAUTHORIZED,
                    "Authentication is required."
            );
        }

        return authentication.getName();
    }

    private LocalDate parseDateOrToday(String date) {
        if (date == null || date.isBlank()) {
            return LocalDate.now();
        }

        try {
            String datePart = date.substring(
                    0,
                    Math.min(10, date.length())
            );

            return LocalDate.parse(datePart);
        } catch (Exception ignored) {
            return LocalDate.now();
        }
    }
}