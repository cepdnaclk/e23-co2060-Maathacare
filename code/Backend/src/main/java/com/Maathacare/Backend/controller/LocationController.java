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
        // .trim() prevents issues if the frontend sends extra spaces
        List<String> divisions = gnDivisionRepository.findByMohAreaOrderByNameAsc(mohArea.trim())
                .stream()
                .map(GNDivision::getName)
                .distinct() // Prevents duplicate names in the dropdown
                .collect(Collectors.toList());

        return ResponseEntity.ok(divisions);
    }
}