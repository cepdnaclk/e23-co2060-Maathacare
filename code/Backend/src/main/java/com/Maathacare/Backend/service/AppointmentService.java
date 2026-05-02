package com.Maathacare.Backend.service;

import com.Maathacare.Backend.dto.AppointmentRequest;
import com.Maathacare.Backend.dto.AppointmentResponse;
import com.Maathacare.Backend.model.entity.Appointment;
import com.Maathacare.Backend.model.entity.MotherProfile;
import com.Maathacare.Backend.model.entity.PHMProfile;
import com.Maathacare.Backend.model.enums.AppointmentStatus;
import com.Maathacare.Backend.repository.AppointmentRepository;
import com.Maathacare.Backend.repository.MotherProfileRepository;
import com.Maathacare.Backend.repository.PHMProfileRepository;
import org.springframework.stereotype.Service;

import java.time.ZonedDateTime;
import java.time.format.DateTimeFormatter;
import java.util.List;
import java.util.stream.Collectors;

@Service
public class AppointmentService {

    private final AppointmentRepository appointmentRepository;
    private final MotherProfileRepository motherProfileRepository;
    private final PHMProfileRepository phmProfileRepository;

    public AppointmentService(AppointmentRepository appointmentRepository,
                              MotherProfileRepository motherProfileRepository,
                              PHMProfileRepository phmProfileRepository) {
        this.appointmentRepository = appointmentRepository;
        this.motherProfileRepository = motherProfileRepository;
        this.phmProfileRepository = phmProfileRepository;
    }

    public void scheduleAppointment(AppointmentRequest request) {
        MotherProfile mother = motherProfileRepository.findById(request.getMother().getId())
                .orElseThrow(() -> new RuntimeException("Mother not found"));

        PHMProfile phm = phmProfileRepository.findById(request.getPhm().getId())
                .orElseThrow(() -> new RuntimeException("PHM not found"));

        Appointment appointment = new Appointment();
        appointment.setMother(mother);
        appointment.setPhm(phm);
        appointment.setAppointmentDate(ZonedDateTime.parse(request.getAppointmentDate()));
        appointment.setStatus(AppointmentStatus.valueOf(request.getStatus()));
        appointment.setRemarks(request.getRemarks());
        appointment.setLocation(request.getLocation());

        appointmentRepository.save(appointment);
    }

    public List<AppointmentResponse> getAppointmentsForPhm(String phmUserId) {
        List<Appointment> appointments = appointmentRepository.findByPhmUserUserIdOrderByAppointmentDateAsc(phmUserId);
        DateTimeFormatter timeFormatter = DateTimeFormatter.ofPattern("hh:mm a");
        DateTimeFormatter dayFormatter = DateTimeFormatter.ofPattern("dd");
        DateTimeFormatter fullDateFormatter = DateTimeFormatter.ofPattern("yyyy-MM-dd");

        return appointments.stream().map(app -> {
            AppointmentResponse res = new AppointmentResponse();
            res.setId(app.getId());
            res.setMotherName(app.getMother().getFullName());
            res.setReason(app.getRemarks());
            res.setType(app.getLocation());
            res.setStatus(app.getStatus().name());

            // 🌟 FIX: Convert UTC database time back to Sri Lanka local time!
            ZonedDateTime localTime = app.getAppointmentDate().withZoneSameInstant(java.time.ZoneId.of("Asia/Colombo"));

            // Use the converted 'localTime' variable instead of the raw database time
            res.setTime(localTime.format(timeFormatter));
            res.setDateDay(localTime.format(dayFormatter));
            res.setFullDate(localTime.format(fullDateFormatter));
            return res;
        }).collect(Collectors.toList());
    }

    // 🌟 NEW: Update the status of an appointment
    public void updateAppointmentStatus(String appointmentId, String newStatus) {
        Appointment appointment = appointmentRepository.findById(appointmentId)
                .orElseThrow(() -> new RuntimeException("Appointment not found"));

        appointment.setStatus(AppointmentStatus.valueOf(newStatus));
        appointmentRepository.save(appointment);
    }

    // 🌟 NEW: Completely delete a mistaken appointment
    public void deleteAppointment(String appointmentId) {
        appointmentRepository.deleteById(appointmentId);
    }

    // 🌟 NEW: Get appointments specifically formatted for the Mother's Mobile UI
    public List<com.Maathacare.Backend.dto.MotherAppointmentResponse> getAppointmentsForMother(String motherUserId) {
        List<Appointment> appointments = appointmentRepository.findByMotherUserUserIdOrderByAppointmentDateAsc(motherUserId);

        DateTimeFormatter timeFormatter = DateTimeFormatter.ofPattern("hh:mm a");
        DateTimeFormatter dateFormatter = DateTimeFormatter.ofPattern("dd MMM yyyy");

        return appointments.stream()
                // Optional: Filter out completed/missed so the mother only sees upcoming ones
                .filter(app -> app.getStatus() == AppointmentStatus.SCHEDULED)
                .map(app -> {
                    com.Maathacare.Backend.dto.MotherAppointmentResponse res = new com.Maathacare.Backend.dto.MotherAppointmentResponse();
                    res.setId(app.getId());
                    res.setLocation(app.getLocation());
                    res.setPhmName(app.getPhm().getFullName());
                    res.setNotes(app.getRemarks());

                    // Convert UTC database time back to Sri Lanka local time
                    ZonedDateTime localTime = app.getAppointmentDate().withZoneSameInstant(java.time.ZoneId.of("Asia/Colombo"));

                    res.setTime(localTime.format(timeFormatter));
                    res.setDate(localTime.format(dateFormatter));

                    return res;
                }).collect(Collectors.toList());
    }


}