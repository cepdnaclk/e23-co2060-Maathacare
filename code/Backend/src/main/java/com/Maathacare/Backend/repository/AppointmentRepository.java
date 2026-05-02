package com.Maathacare.Backend.repository;

import com.Maathacare.Backend.model.entity.Appointment;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface AppointmentRepository extends JpaRepository<Appointment, String> {
    // Finds all appointments for a specific PHM and orders them by date
    List<Appointment> findByPhmUserUserIdOrderByAppointmentDateAsc(String phmUserId);
    List<Appointment> findByMotherUserUserIdOrderByAppointmentDateAsc(String userId);
}