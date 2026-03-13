package com.Maathacare.Backend.controller;

import com.Maathacare.Backend.model.entity.Appointment;
import com.Maathacare.Backend.service.AppointmentService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/appointments")
public class AppointmentController {
    private final AppointmentService appointmentService;

    public AppointmentController(AppointmentService appointmentService) {
        this.appointmentService = appointmentService;
    }

    @PostMapping("/schedule")
    public ResponseEntity<Appointment> createAppointment(@RequestBody Appointment appointment) {
        return ResponseEntity.ok(appointmentService.scheduleAppointment(appointment));
    }

    @GetMapping("/mother/{motherId}")
    public ResponseEntity<List<Appointment>> getMotherAppointments(@PathVariable String motherId) {
        return ResponseEntity.ok(appointmentService.getAppointmentsForMother(motherId));
    }
    @GetMapping("/phm")
    public ResponseEntity<List<Appointment>> getPHMAppointments() {
        // You'll need to add getAppointmentsForPHM to your Service
        List<Appointment> appointments = appointmentService.getAppointmentsForLoggedInPHM();
        return ResponseEntity.ok(appointments);
    }
}