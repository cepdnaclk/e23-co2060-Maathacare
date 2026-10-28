package com.Maathacare.Backend.controller;

import com.Maathacare.Backend.dto.AdminMotherRecordResponse;
import com.Maathacare.Backend.service.AdminMotherRecordService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api/users/mothers")
@CrossOrigin(origins = "*")
public class AdminMotherController {

    private final AdminMotherRecordService adminMotherRecordService;

    public AdminMotherController(AdminMotherRecordService adminMotherRecordService) {
        this.adminMotherRecordService = adminMotherRecordService;
    }

    @GetMapping("/all")
    public ResponseEntity<List<AdminMotherRecordResponse>> getAllMotherRecords() {
        return ResponseEntity.ok(adminMotherRecordService.getAllMotherRecords());
    }

    @GetMapping("/{motherId}")
    public ResponseEntity<?> getMotherRecord(@PathVariable String motherId) {
        try {
            return ResponseEntity.ok(adminMotherRecordService.getMotherRecord(motherId));
        } catch (RuntimeException exception) {
            return ResponseEntity.notFound().build();
        }
    }
}