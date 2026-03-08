package com.Maathacare.Backend.controller;

import com.Maathacare.Backend.entity.WeeklyMilestone;
import com.Maathacare.Backend.repository.WeeklyMilestoneRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Optional;

@RestController
@RequestMapping("/api/weekly-milestones")
@CrossOrigin(origins = "*") // This allows your React Native phone app to talk to it safely!
public class WeeklyMilestoneController {

    @Autowired
    private WeeklyMilestoneRepository repository;

    // This creates the URL doorway: http://localhost:8080/api/milestones/{week}
    @GetMapping("/{week}")
    public ResponseEntity<WeeklyMilestone> getMilestoneByWeek(@PathVariable Integer week) {

        // Ask the librarian to find the data for this specific week
        Optional<WeeklyMilestone> milestone = repository.findById(week);

        // If we found the week in the database, send it back with a 200 OK success code!
        if (milestone.isPresent()) {
            return ResponseEntity.ok(milestone.get());
        } else {
            // If the week doesn't exist yet, send a 404 Not Found error
            return ResponseEntity.notFound().build();
        }
    }
}