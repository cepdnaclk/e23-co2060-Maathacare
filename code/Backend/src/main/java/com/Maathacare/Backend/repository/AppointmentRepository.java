package com.Maathacare.Backend.repository;

import com.Maathacare.Backend.model.entity.Appointment;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;
import java.util.UUID;

public interface AppointmentRepository extends JpaRepository<Appointment, UUID> {
    List<Appointment> findAllByMotherId(UUID motherId);
}