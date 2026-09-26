package com.Maathacare.Backend.service;

import com.Maathacare.Backend.dto.AdminMotherRecordResponse;
import com.Maathacare.Backend.model.entity.Appointment;
import com.Maathacare.Backend.model.entity.MedicalRecord;
import com.Maathacare.Backend.model.entity.MotherProfile;
import com.Maathacare.Backend.model.entity.PHMProfile;
import com.Maathacare.Backend.model.entity.VisitRecord;
import com.Maathacare.Backend.repository.AppointmentRepository;
import com.Maathacare.Backend.repository.MedicalRecordRepository;
import com.Maathacare.Backend.repository.MotherProfileRepository;
import com.Maathacare.Backend.repository.VisitRecordRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.time.ZoneId;
import java.time.ZonedDateTime;
import java.time.format.DateTimeFormatter;
import java.time.temporal.ChronoUnit;
import java.util.ArrayList;
import java.util.Comparator;
import java.util.HashMap;
import java.util.List;
import java.util.Locale;
import java.util.Map;

@Service
public class AdminMotherRecordService {

    private static final ZoneId SRI_LANKA_ZONE = ZoneId.of("Asia/Colombo");
    private static final DateTimeFormatter DATE_FORMAT = DateTimeFormatter.ofPattern("yyyy-MM-dd");
    private static final DateTimeFormatter TIME_FORMAT = DateTimeFormatter.ofPattern("hh:mm a", Locale.ENGLISH);

    private final MotherProfileRepository motherProfileRepository;
    private final AppointmentRepository appointmentRepository;
    private final VisitRecordRepository visitRecordRepository;
    private final MedicalRecordRepository medicalRecordRepository;

    public AdminMotherRecordService(
            MotherProfileRepository motherProfileRepository,
            AppointmentRepository appointmentRepository,
            VisitRecordRepository visitRecordRepository,
            MedicalRecordRepository medicalRecordRepository
    ) {
        this.motherProfileRepository = motherProfileRepository;
        this.appointmentRepository = appointmentRepository;
        this.visitRecordRepository = visitRecordRepository;
        this.medicalRecordRepository = medicalRecordRepository;
    }

    @Transactional(readOnly = true)
    public List<AdminMotherRecordResponse> getAllMotherRecords() {
        List<MotherProfile> mothers = motherProfileRepository.findAll();
        Map<String, Appointment> nextAppointments = indexNextAppointments();
        Map<String, VisitRecord> latestVisits = indexLatestVisits();
        Map<String, Integer> medicalRecordCounts = countMedicalRecords();

        return mothers.stream()
                .map(mother -> toResponse(
                        mother,
                        nextAppointments.get(mother.getId()),
                        latestVisits.get(mother.getId()),
                        medicalRecordCounts.getOrDefault(mother.getId(), 0)
                ))
                .sorted(Comparator.comparing(
                        AdminMotherRecordResponse::getRegistrationDate,
                        Comparator.nullsLast(Comparator.reverseOrder())
                ))
                .toList();
    }

    @Transactional(readOnly = true)
    public AdminMotherRecordResponse getMotherRecord(String motherId) {
        MotherProfile mother = motherProfileRepository.findById(motherId)
                .orElseGet(() -> motherProfileRepository.findByNic(motherId)
                        .orElseThrow(() -> new RuntimeException("Mother record not found: " + motherId)));

        Appointment nextAppointment = findNextAppointmentForMother(mother.getId());
        VisitRecord latestVisit = visitRecordRepository
                .findByMotherProfile_IdOrderByVisitDateDesc(mother.getId())
                .stream()
                .findFirst()
                .orElse(null);
        int medicalRecordCount = medicalRecordRepository.findByMotherProfileId(mother.getId()).size();

        return toResponse(mother, nextAppointment, latestVisit, medicalRecordCount);
    }

    private Map<String, Appointment> indexNextAppointments() {
        ZonedDateTime now = ZonedDateTime.now(SRI_LANKA_ZONE);
        Map<String, Appointment> result = new HashMap<>();

        appointmentRepository.findAll().stream()
                .filter(appointment -> appointment.getMother() != null)
                .filter(appointment -> appointment.getAppointmentDate() != null)
                .filter(appointment -> !appointment.getAppointmentDate().isBefore(now))
                .filter(this::isUpcomingAppointment)
                .sorted(Comparator.comparing(Appointment::getAppointmentDate))
                .forEach(appointment -> result.putIfAbsent(appointment.getMother().getId(), appointment));

        return result;
    }

    private Appointment findNextAppointmentForMother(String motherId) {
        ZonedDateTime now = ZonedDateTime.now(SRI_LANKA_ZONE);
        return appointmentRepository.findAll().stream()
                .filter(appointment -> appointment.getMother() != null && motherId.equals(appointment.getMother().getId()))
                .filter(appointment -> appointment.getAppointmentDate() != null && !appointment.getAppointmentDate().isBefore(now))
                .filter(this::isUpcomingAppointment)
                .min(Comparator.comparing(Appointment::getAppointmentDate))
                .orElse(null);
    }

    private boolean isUpcomingAppointment(Appointment appointment) {
        if (appointment.getStatus() == null) return true;
        String status = appointment.getStatus().name().toUpperCase(Locale.ROOT);
        return !status.contains("CANCEL") && !status.contains("COMPLET") && !status.contains("MISSED");
    }

    private Map<String, VisitRecord> indexLatestVisits() {
        Map<String, VisitRecord> result = new HashMap<>();
        for (VisitRecord visit : visitRecordRepository.findAllByOrderByVisitDateDesc()) {
            if (visit.getMotherProfile() != null) {
                result.putIfAbsent(visit.getMotherProfile().getId(), visit);
            }
        }
        return result;
    }

    private Map<String, Integer> countMedicalRecords() {
        Map<String, Integer> result = new HashMap<>();
        for (MedicalRecord record : medicalRecordRepository.findAll()) {
            if (record.getMotherProfile() != null) {
                result.merge(record.getMotherProfile().getId(), 1, Integer::sum);
            }
        }
        return result;
    }

    private AdminMotherRecordResponse toResponse(
            MotherProfile mother,
            Appointment nextAppointment,
            VisitRecord latestVisit,
            int medicalRecordCount
    ) {
        AdminMotherRecordResponse response = new AdminMotherRecordResponse();

        response.setMotherId(mother.getId());
        response.setRegistrationId(mother.getUser() == null ? mother.getId() : mother.getUser().getUserId());
        response.setFullName(mother.getFullName());
        response.setNic(mother.getNic());
        response.setPhone(mother.getEmergencyContactNumber());
        response.setAddress(mother.getAddress());
        response.setDateOfBirth(mother.getDateOfBirth());
        response.setBloodGroup(mother.getBloodGroup());
        response.setLastMenstrualPeriod(mother.getLastMenstrualPeriod());
        response.setDistrict(mother.getDistrict());
        response.setProvince(mother.getProvince());
        response.setGnDivision(mother.getGnDivision());
        response.setResidentialDivision(mother.getResidentialDivision());
        response.setChronicDiseaseStatus(mother.getChronicDiseaseStatus());
        response.setRegistrationDate(mother.getCreatedAt());
        response.setMedicalRecordCount(medicalRecordCount);

        PHMProfile phm = mother.getPhmProfile();
        if (phm != null) {
            response.setAssignedPhmName(phm.getFullName());
            response.setAssignedStaffId(phm.getUser() == null ? phm.getRegistrationNumber() : phm.getUser().getStaffId());
            response.setMohArea(phm.getMohArea());
        }

        if (latestVisit != null) {
            response.setPregnancyWeek(latestVisit.getGestationalWeek());
            response.setPregnancyWeekSource("Latest PHM visit");
            response.setLatestVisitDate(latestVisit.getVisitDate());
        } else {
            Integer estimatedWeek = estimatePregnancyWeek(mother.getLastMenstrualPeriod());
            response.setPregnancyWeek(estimatedWeek);
            response.setPregnancyWeekSource(estimatedWeek == null ? "Not recorded" : "Estimated from LMP");
        }

        applyAdministrativeRiskStatus(response, mother);
        applyNextAppointment(response, nextAppointment);
        return response;
    }

    private Integer estimatePregnancyWeek(LocalDate lastMenstrualPeriod) {
        if (lastMenstrualPeriod == null) return null;
        long days = ChronoUnit.DAYS.between(lastMenstrualPeriod, LocalDate.now(SRI_LANKA_ZONE));
        if (days < 0 || days > 315) return null;
        return (int) (days / 7);
    }

    private void applyAdministrativeRiskStatus(AdminMotherRecordResponse response, MotherProfile mother) {
        List<String> notes = new ArrayList<>();
        String chronicStatus = mother.getChronicDiseaseStatus();

        if (hasRecordedCondition(chronicStatus)) {
            notes.add("A chronic-condition note is present in the mother profile.");
        }

        response.setRiskNotes(notes);
        response.setRiskLevel(notes.isEmpty() ? "Not assessed" : "Review required");
    }

    private boolean hasRecordedCondition(String value) {
        if (value == null || value.isBlank()) return false;
        String normalised = value.trim().toLowerCase(Locale.ROOT);
        return !(normalised.equals("no")
                || normalised.equals("none")
                || normalised.equals("nil")
                || normalised.equals("n/a")
                || normalised.equals("not applicable")
                || normalised.equals("no chronic disease"));
    }

    private void applyNextAppointment(AdminMotherRecordResponse response, Appointment appointment) {
        if (appointment == null || appointment.getAppointmentDate() == null) return;

        ZonedDateTime localDateTime = appointment.getAppointmentDate().withZoneSameInstant(SRI_LANKA_ZONE);
        response.setNextClinicDate(localDateTime.format(DATE_FORMAT));
        response.setNextClinicTime(localDateTime.format(TIME_FORMAT));
        response.setNextClinicLocation(appointment.getLocation());
        response.setNextClinicStatus(appointment.getStatus() == null ? "SCHEDULED" : appointment.getStatus().name());
    }
}