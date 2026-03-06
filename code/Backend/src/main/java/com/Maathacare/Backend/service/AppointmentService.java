package com.Maathacare.Backend.service;

import com.Maathacare.Backend.model.entity.Appointment;
import com.Maathacare.Backend.repository.AppointmentRepository;
import org.springframework.stereotype.Service;
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

    public List<Appointment> getAppointmentsForMother(UUID motherId) {
        return appointmentRepository.findAllByMotherId(motherId);
    }
}