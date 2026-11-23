package com.Maathacare.Backend.dto;

public class SupplementRequest {

    private String name;
    private String dosage;
    private String instructions;

    public String getName() {
        return name;
    }

    public String getDosage() {
        return dosage;
    }

    public String getInstructions() {
        return instructions;
    }

    public void setName(String name) {
        this.name = name;
    }

    public void setDosage(String dosage) {
        this.dosage = dosage;
    }

    public void setInstructions(String instructions) {
        this.instructions = instructions;
    }
}