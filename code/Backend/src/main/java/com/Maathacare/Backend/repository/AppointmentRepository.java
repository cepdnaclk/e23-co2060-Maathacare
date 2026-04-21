package com.Maathacare.Backend.repository;

import com.Maathacare.Backend.model.entity.Appointment;
import org.springframework.data.domain.Limit;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;
import java.util.UUID;

public interface AppointmentRepository extends JpaRepository<Appointment,String> {
    List<Appointment> findByMother_Id(String motherId);
    List<Appointment> findByPhm_User_StaffId(String staffId);

    List<Appointment> findAllByMother_Id(String motherId);
}