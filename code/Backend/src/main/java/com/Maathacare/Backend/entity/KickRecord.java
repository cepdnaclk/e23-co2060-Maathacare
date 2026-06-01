package com.Maathacare.Backend.model.entity;

import jakarta.persistence.*;
import lombok.Data;
import java.time.LocalDateTime;

@Entity
@Data
@Table(name = "kick_records")
public class KickRecord {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne
    @JoinColumn(name = "mother_id")
    private MotherProfile motherProfile;

    private int count;
    private LocalDateTime timestamp;
}