package com.Maathacare.Backend.model.entity;

import jakarta.persistence.*;

@Entity
@Table(name = "gn_divisions")
public class GNDivision {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "name", nullable = false)
    private String name;

    @Column(name = "moh_area", nullable = false)
    private String mohArea;

    // --- Getters and Setters ---
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public String getName() { return name; }
    public void setName(String name) { this.name = name; }

    public String getMohArea() { return mohArea; }
    public void setMohArea(String mohArea) { this.mohArea = mohArea; }
}