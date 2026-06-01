package com.Maathacare.Backend.controller;

import com.Maathacare.Backend.dto.AppointmentRequest;
import com.Maathacare.Backend.dto.ClinicVisitRequest;
import com.Maathacare.Backend.model.entity.Supplement;
import com.Maathacare.Backend.service.AppointmentService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@CrossOrigin(origins = "*")
@RestController
@RequestMapping("/api/appointments")
public class AppointmentController {

    private final AppointmentService appointmentService;

    public AppointmentController(AppointmentService appointmentService) {
        this.appointmentService = appointmentService;
    }

    @PostMapping("/schedule")
    public ResponseEntity<?> scheduleAppointment(@RequestBody AppointmentRequest request) {
        try {
            appointmentService.scheduleAppointment(request);
            return ResponseEntity.ok("Appointment Scheduled Successfully");
        } catch (Exception e) {
            return ResponseEntity.badRequest().body("Error: " + e.getMessage());
        }
    }

    @GetMapping("/phm/{userId}")
    public ResponseEntity<?> getPhmAppointments(@PathVariable String userId) {
        try {
            return ResponseEntity.ok(appointmentService.getAppointmentsForPhm(userId));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body("Error: " + e.getMessage());
        }
    }

    @PutMapping("/{id}/status")
    public ResponseEntity<?> updateStatus(@PathVariable String id, @RequestParam String status) {
        try {
            appointmentService.updateAppointmentStatus(id, status);
            return ResponseEntity.ok("Appointment marked as " + status);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body("Error: " + e.getMessage());
        }
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<?> deleteAppointment(@PathVariable String id) {
        try {
            appointmentService.deleteAppointment(id);
            return ResponseEntity.ok("Appointment deleted successfully");
        } catch (Exception e) {
            return ResponseEntity.badRequest().body("Error: " + e.getMessage());
        }
    }

    @GetMapping("/mother/{userId}")
    public ResponseEntity<?> getMotherAppointments(@PathVariable String userId) {
        try {
            return ResponseEntity.ok(appointmentService.getAppointmentsForMother(userId));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body("Error fetching appointments: " + e.getMessage());
        }
    }

    @GetMapping("/mother/{motherId}/supplements")
    public ResponseEntity<List<Supplement>> getSupplementsForMother(@PathVariable String motherId) {
        // Safe wrap in a try-catch to keep your error handling consistent
        try {
            List<Supplement> supplements = appointmentService.getSupplementsForMother(motherId);
            return ResponseEntity.ok(supplements);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(null);
        }
    }


    @PutMapping("/{appointmentId}/complete")
    public ResponseEntity<?> completeClinicVisit(
            @PathVariable String appointmentId,
            @RequestBody ClinicVisitRequest request) {
        try {
            appointmentService.completeClinicVisit(appointmentId, request);
            return ResponseEntity.ok("Clinic visit recorded and personalized supplements assigned.");
        } catch (Exception e) {
            return ResponseEntity.badRequest().body("Error completing visit: " + e.getMessage());
        }
    }
}