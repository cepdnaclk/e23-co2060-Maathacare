package com.Maathacare.Backend.controller;

import com.Maathacare.Backend.model.entity.Notification;
import com.Maathacare.Backend.repository.NotificationRepository;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/notifications")
@CrossOrigin(origins = "*") // Adjust based on your security config
public class NotificationController {

    private final NotificationRepository notificationRepository;

    public NotificationController(NotificationRepository notificationRepository) {
        this.notificationRepository = notificationRepository;
    }

    // 1. Fetch all notifications for a specific mother
    @GetMapping("/mother/{motherId}")
    public ResponseEntity<List<Notification>> getMotherNotifications(@PathVariable String motherId) {
        List<Notification> notifications = notificationRepository.findByMotherIdOrderByCreatedAtDesc(motherId);
        return ResponseEntity.ok(notifications);
    }

    // 2. Mark a notification as read
    @PutMapping("/{id}/read")
    public ResponseEntity<Void> markAsRead(@PathVariable String id) {
        notificationRepository.findById(id).ifPresent(notification -> {
            notification.setRead(true);
            notificationRepository.save(notification);
        });
        return ResponseEntity.ok().build();
    }
}