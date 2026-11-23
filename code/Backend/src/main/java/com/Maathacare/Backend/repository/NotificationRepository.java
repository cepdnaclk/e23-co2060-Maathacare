package com.Maathacare.Backend.repository;

import com.Maathacare.Backend.model.entity.Notification;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface NotificationRepository extends JpaRepository<Notification, String> {
    List<Notification> findByMotherIdOrderByCreatedAtDesc(String motherId);
}