package com.Maathacare.Backend.repository;

import com.Maathacare.Backend.model.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;
import java.util.UUID;

@Repository
public interface UserRepository extends JpaRepository<User, UUID> {
    // Spring Boot automatically translates this into: SELECT * FROM users WHERE phone_number = ?
    Optional<User> findByPhoneNumber(String phoneNumber);
}
