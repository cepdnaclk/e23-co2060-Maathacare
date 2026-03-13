package com.Maathacare.Backend.service;

import com.Maathacare.Backend.model.entity.Appointment;
import com.Maathacare.Backend.repository.AppointmentRepository;
import org.springframework.stereotype.Service;
import org.springframework.security.core.context.SecurityContextHolder;
import java.util.List;
import java.util.UUID;

@Service
public class AppointmentService {
    private final AppointmentRepository appointmentRepository;

    public AppointmentService(AppointmentRepository appointmentRepository) {
        this.appointmentRepository = appointmentRepository;
    }

    public Appointment scheduleAppointment(Appointment appointment) {
        if (appointment.getStatus() == null) {
            appointment.setStatus("SCHEDULED");
        }
        return appointmentRepository.save(appointment);
    }

    // Change UUID to String
    public List<Appointment> getAppointmentsForMother(String motherId) {
        // Also, ensure the method name matches your Repository (findByMother_Id)
        return appointmentRepository.findByMother_Id(motherId);
    }

    // Inside AppointmentService.java
    public List<Appointment> getAppointmentsForLoggedInPHM() {
        String staffId = SecurityContextHolder.getContext().getAuthentication().getName();
        // Match the new repository method name here:
        return appointmentRepository.findByPhm_User_StaffId(staffId);
    }
}