package com.Maathacare.Backend.controller;

import com.Maathacare.Backend.dto.AppointmentRequest;
import com.Maathacare.Backend.service.AppointmentService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

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

    // 🌟 NEW API: Endpoint to update status
    @PutMapping("/{id}/status")
    public ResponseEntity<?> updateStatus(@PathVariable String id, @RequestParam String status) {
        try {
            appointmentService.updateAppointmentStatus(id, status);
            return ResponseEntity.ok("Appointment marked as " + status);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body("Error: " + e.getMessage());
        }
    }

    // 🌟 NEW API: Endpoint to delete
    @DeleteMapping("/{id}")
    public ResponseEntity<?> deleteAppointment(@PathVariable String id) {
        try {
            appointmentService.deleteAppointment(id);
            return ResponseEntity.ok("Appointment deleted successfully");
        } catch (Exception e) {
            return ResponseEntity.badRequest().body("Error: " + e.getMessage());
        }
    }
}