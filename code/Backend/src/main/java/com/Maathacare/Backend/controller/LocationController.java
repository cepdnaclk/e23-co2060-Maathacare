package com.Maathacare.Backend.controller;

import com.Maathacare.Backend.model.entity.GNDivision;
import com.Maathacare.Backend.repository.GNDivisionRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.stream.Collectors;

@CrossOrigin(origins = "*")
@RestController
@RequestMapping("/api/locations")
public class LocationController {

    @Autowired
    private GNDivisionRepository gnDivisionRepository;

    @GetMapping("/gn-divisions")
    public ResponseEntity<List<String>> getGnDivisionsByMohArea(@RequestParam String mohArea) {
        // Query the database and extract just the string names to send to the mobile app
        List<String> divisions = gnDivisionRepository.findByMohAreaOrderByNameAsc(mohArea.trim())
                .stream()
                .map(GNDivision::getName)
                .collect(Collectors.toList());

        return ResponseEntity.ok(divisions);
    }
}