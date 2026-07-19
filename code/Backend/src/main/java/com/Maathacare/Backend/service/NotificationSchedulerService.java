package com.Maathacare.Backend.service;

import com.Maathacare.Backend.model.entity.Appointment;
import com.Maathacare.Backend.model.entity.MotherProfile;
import com.Maathacare.Backend.model.entity.Notification;
import com.Maathacare.Backend.model.enums.AppointmentStatus;
import com.Maathacare.Backend.repository.AppointmentRepository;
import com.Maathacare.Backend.repository.MotherProfileRepository;
import com.Maathacare.Backend.repository.NotificationRepository;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.ZoneId;
import java.time.ZonedDateTime;
import java.time.temporal.ChronoUnit;
import java.util.List;

@Service
public class NotificationSchedulerService {

    private final AppointmentRepository appointmentRepository;
    private final NotificationRepository notificationRepository;
    private final MotherProfileRepository motherProfileRepository;
    private final ExpoNotificationService expoNotificationService;

    public NotificationSchedulerService(AppointmentRepository appointmentRepository,
                                        NotificationRepository notificationRepository,
                                        MotherProfileRepository motherProfileRepository,
                                        ExpoNotificationService expoNotificationService) {
        this.appointmentRepository = appointmentRepository;
        this.notificationRepository = notificationRepository;
        this.motherProfileRepository = motherProfileRepository;
        this.expoNotificationService = expoNotificationService;
    }

    // Runs every hour at minute 0 (e.g., 1:00, 2:00, 3:00)
    @Scheduled(cron = "0 0 * * * *")
    @Transactional
    public void checkUpcomingAppointments() {
        ZonedDateTime now = ZonedDateTime.now(ZoneId.of("Asia/Colombo"));
        List<Appointment> scheduledAppointments = appointmentRepository.findByStatus(AppointmentStatus.SCHEDULED);

        for (Appointment appt : scheduledAppointments) {
            long hoursUntilClinic = ChronoUnit.HOURS.between(now, appt.getAppointmentDate());
            MotherProfile mother = appt.getMother();

            // 1. Three Days Before (72 Hours)
            if (hoursUntilClinic <= 72 && hoursUntilClinic > 24 && !appt.isReminder3DaysSent()) {
                sendAndSaveNotification(mother, "Upcoming Clinic 📅", "You have a clinic visit in 3 days at " + appt.getLocation(), "APPOINTMENT");
                appt.setReminder3DaysSent(true);
            }
            // 2. One Day Before (24 Hours)
            else if (hoursUntilClinic <= 24 && hoursUntilClinic > 3 && !appt.isReminder1DaySent()) {
                sendAndSaveNotification(mother, "Clinic Tomorrow 📅", "Don't forget your clinic visit tomorrow at " + appt.getLocation(), "APPOINTMENT");
                appt.setReminder1DaySent(true);
            }
            // 3. Three Hours Before
            else if (hoursUntilClinic <= 3 && hoursUntilClinic > 0 && !appt.isReminder3HoursSent()) {
                sendAndSaveNotification(mother, "Clinic Today 🏥", "Your clinic visit is in 3 hours. Please prepare to leave soon.", "APPOINTMENT");
                appt.setReminder3HoursSent(true);
            }

            // Save the updated boolean flags back to the database
            appointmentRepository.save(appt);
        }
    }

    // Runs every morning at 8:00 AM Sri Lanka Time
    @Scheduled(cron = "0 0 8 * * *", zone = "Asia/Colombo")
    @Transactional
    public void sendDailySupplementReminders() {
        List<MotherProfile> allMothers = motherProfileRepository.findAll();

        for (MotherProfile mother : allMothers) {
            // In the future, you can filter this to only send if they actually have active supplements assigned
            sendAndSaveNotification(mother, "Daily Supplement Reminder 💊", "Good morning! Please remember to take your prescribed daily supplements.", "SUPPLEMENT");
        }
    }

    // Helper method to push to Expo AND save to the Database inbox
    private void sendAndSaveNotification(MotherProfile mother, String title, String body, String type) {
        // 1. Push to device
        String token = mother.getPushToken();
        if (token != null && !token.isEmpty()) {
            expoNotificationService.sendPushNotification(token, title, body);
        }

        // 2. Save to Inbox History
        Notification notification = new Notification();
        notification.setMother(mother);
        notification.setTitle(title);
        notification.setBody(body);
        notification.setType(type);
        notificationRepository.save(notification);
    }
}