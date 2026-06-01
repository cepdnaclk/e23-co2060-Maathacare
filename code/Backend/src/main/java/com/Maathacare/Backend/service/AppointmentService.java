package com.Maathacare.Backend.service;

import com.Maathacare.Backend.dto.AppointmentRequest;
import com.Maathacare.Backend.dto.AppointmentResponse;
import com.Maathacare.Backend.model.entity.Appointment;
import com.Maathacare.Backend.model.entity.MotherProfile;
import com.Maathacare.Backend.model.entity.PHMProfile;
import com.Maathacare.Backend.model.entity.Supplement;
import com.Maathacare.Backend.model.enums.AppointmentStatus;
import com.Maathacare.Backend.repository.AppointmentRepository;
import com.Maathacare.Backend.repository.MotherProfileRepository;
import com.Maathacare.Backend.repository.PHMProfileRepository;
import com.Maathacare.Backend.repository.SupplementRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import com.Maathacare.Backend.dto.ClinicVisitRequest;
import java.time.LocalDate;
import java.time.ZonedDateTime;
import java.time.format.DateTimeFormatter;
import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;
import com.google.firebase.messaging.FirebaseMessaging;
import com.google.firebase.messaging.Message;
import com.google.firebase.messaging.Notification;
@Service
public class AppointmentService {

    private final AppointmentRepository appointmentRepository;
    private final MotherProfileRepository motherProfileRepository;
    private final PHMProfileRepository phmProfileRepository;
    private final SupplementRepository supplementRepository;

    public AppointmentService(AppointmentRepository appointmentRepository,
                              MotherProfileRepository motherProfileRepository,
                              PHMProfileRepository phmProfileRepository,
                              SupplementRepository supplementRepository) {
        this.appointmentRepository = appointmentRepository;
        this.motherProfileRepository = motherProfileRepository;
        this.phmProfileRepository = phmProfileRepository;
        this.supplementRepository = supplementRepository;
    }

    @Transactional // 🌟 Ensures atomic transaction across both appointment and supplement tables
    public void scheduleAppointment(AppointmentRequest request) {
        MotherProfile mother = motherProfileRepository.findById(request.getMother().getId())
                .orElseThrow(() -> new RuntimeException("Mother not found"));

        PHMProfile phm = phmProfileRepository.findById(request.getPhm().getId())
                .orElseThrow(() -> new RuntimeException("PHM not found"));

        Appointment appointment = new Appointment();
        appointment.setMother(mother);
        appointment.setPhm(phm);
        appointment.setAppointmentDate(ZonedDateTime.parse(request.getAppointmentDate()));
        appointment.setStatus(AppointmentStatus.valueOf(request.getStatus().toUpperCase())); // UpperCase safety
        appointment.setRemarks(request.getRemarks());
        appointment.setLocation(request.getLocation());

        appointmentRepository.save(appointment);

        // 🌟 NEW: Loop and save the List<String> supplements into the new table
        if (request.getSupplements() != null && !request.getSupplements().isEmpty()) {
            for (String supplementName : request.getSupplements()) {
                Supplement supplement = new Supplement();

                // Generates a clean UUID matching your database string PK preferences
                supplement.setId(UUID.randomUUID().toString());
                supplement.setMotherId(mother.getUser().getUserId()); // Links cleanly to mother reference ID
                supplement.setSupplementName(supplementName);
                supplement.setAssignedDate(LocalDate.now());

                supplementRepository.save(supplement);
            }
        }

        String token = mother.getUser().getPushToken();
        String title = "New Appointment Scheduled 📅";
        String body = "A new clinic session has been scheduled at " + appointment.getLocation();
        sendInstantPushNotification(token, title, body);
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

            // Convert UTC database time back to Sri Lanka local time!
            ZonedDateTime localTime = app.getAppointmentDate().withZoneSameInstant(java.time.ZoneId.of("Asia/Colombo"));

            res.setTime(localTime.format(timeFormatter));
            res.setDateDay(localTime.format(dayFormatter));
            res.setFullDate(localTime.format(fullDateFormatter));
            return res;
        }).collect(Collectors.toList());
    }

    public void updateAppointmentStatus(String appointmentId, String newStatus) {
        Appointment appointment = appointmentRepository.findById(appointmentId)
                .orElseThrow(() -> new RuntimeException("Appointment not found"));

        appointment.setStatus(AppointmentStatus.valueOf(newStatus.toUpperCase()));
        appointmentRepository.save(appointment);
    }

    public void deleteAppointment(String appointmentId) {
        appointmentRepository.deleteById(appointmentId);
    }
    @Transactional
    public void completeClinicVisit(String appointmentId, ClinicVisitRequest request) {
        // 1. Find the scheduled appointment
        Appointment appointment = appointmentRepository.findById(appointmentId)
                .orElseThrow(() -> new RuntimeException("Appointment not found"));

        // 2. Add the personalized remarks and complete the visit
        appointment.setRemarks(request.getRemarks());
        appointment.setStatus(AppointmentStatus.COMPLETED);
        appointmentRepository.save(appointment);

        // 3. Loop through the detailed supplements and save them
        if (request.getSupplements() != null && !request.getSupplements().isEmpty()) {
            for (ClinicVisitRequest.SupplementDetail suppDetail : request.getSupplements()) {
                Supplement supplement = new Supplement();
                supplement.setId(UUID.randomUUID().toString());
                supplement.setMotherId(appointment.getMother().getUser().getUserId());

                // Map the personalized data from the DTO
                supplement.setSupplementName(suppDetail.getName());
                supplement.setInstructions(suppDetail.getInstructions());
                supplement.setAssignedDate(LocalDate.now());

                supplementRepository.save(supplement);
            }
        }

        // 🌟 NEW: Trigger push notification so mother knows her instructions are ready
        String token = appointment.getMother().getUser().getPushToken();
        String title = "Medical Plan Updated 💊";
        String body = "Your PHM has updated your supplement instructions. Tap to view your prescription chart.";

        sendInstantPushNotification(token, title, body);
    }
    public List<com.Maathacare.Backend.dto.MotherAppointmentResponse> getAppointmentsForMother(String motherUserId) {
        List<Appointment> appointments = appointmentRepository.findByMotherUserUserIdOrderByAppointmentDateAsc(motherUserId);

        DateTimeFormatter timeFormatter = DateTimeFormatter.ofPattern("hh:mm a");
        DateTimeFormatter dateFormatter = DateTimeFormatter.ofPattern("dd MMM yyyy");

        return appointments.stream()
                //.filter(app -> app.getStatus() == AppointmentStatus.SCHEDULED)
                .map(app -> {
                    com.Maathacare.Backend.dto.MotherAppointmentResponse res = new com.Maathacare.Backend.dto.MotherAppointmentResponse();
                    res.setId(app.getId());
                    res.setLocation(app.getLocation());
                    res.setPhmName(app.getPhm().getFullName());
                    res.setNotes(app.getRemarks()); // This acts as the post-clinic advice display

                    ZonedDateTime localTime = app.getAppointmentDate().withZoneSameInstant(java.time.ZoneId.of("Asia/Colombo"));

                    res.setTime(localTime.format(timeFormatter));
                    res.setDate(localTime.format(dateFormatter));

                    return res;
                }).collect(Collectors.toList());
    }
    // Needs import com.Maathacare.Backend.model.entity.Supplement;
    public List<Supplement> getSupplementsForMother(String motherUserId) {
        // Assuming you added a basic findByMotherId method in SupplementRepository
        return supplementRepository.findByMotherIdOrderByAssignedDateDesc(motherUserId);
    }
    // Stub method for push notifications
    private void sendInstantPushNotification(String motherId, String ISOStringDate) {
        System.out.println("Push Alert fired instantly to Mother ID: " + motherId + " for schedule: " + ISOStringDate);
    }
    private void sendInstantPushNotification(String targetPushToken, String title, String body) {
        if (targetPushToken == null || targetPushToken.isEmpty()) {
            System.out.println("⚠️ Skipping notification: No push token registered for this user.");
            return;
        }

        // Build the cross-platform visible banner
        Notification notification = Notification.builder()
                .setTitle(title)
                .setBody(body)
                .build();

        // Attach the target token and build the payload
        Message message = Message.builder()
                .setToken(targetPushToken)
                .setNotification(notification)
                .putData("click_action", "FLUTTER_NOTIFICATION_CLICK") // Helps target deep links
                .build();

        try {
            // Send asynchronously to prevent blocking the HTTP response thread
            String response = FirebaseMessaging.getInstance().sendAsync(message).get();
            System.out.println("🚀 Successfully sent message notification id: " + response);
        } catch (Exception e) {
            System.err.println("❌ Failed to deliver Firebase push notification: " + e.getMessage());
        }
    }
}