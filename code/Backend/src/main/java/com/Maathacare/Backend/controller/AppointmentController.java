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
    public ResponseEntity<List<Appointment>> getMotherAppointments(@PathVariable UUID motherId) {
        return ResponseEntity.ok(appointmentService.getAppointmentsForMother(motherId));
    }
}