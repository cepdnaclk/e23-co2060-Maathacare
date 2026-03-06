package com.Maathacare.Backend.model;

import jakarta.persistence.*;

@Entity
@Table(name = "weekly_milestones")
public class WeeklyMilestone {

    // The week number (1 to 40) will be our primary key ID!
    @Id
    private Integer weekNumber;

    private String babySize; // e.g., "Apple", "Avocado"
    private String babyWeight; // e.g., "70 grams"

    @Column(length = 1000)
    private String weeklyTip; // A long paragraph for the educational tip

    // --- GETTERS AND SETTERS ---
    public Integer getWeekNumber() {
        return weekNumber;
    }

    public void setWeekNumber(Integer weekNumber) {
        this.weekNumber = weekNumber;
    }

    public String getBabySize() {
        return babySize;
    }

    public void setBabySize(String babySize) {
        this.babySize = babySize;
    }

    public String getBabyWeight() {
        return babyWeight;
    }

    public void setBabyWeight(String babyWeight) {
        this.babyWeight = babyWeight;
    }

    public String getWeeklyTip() {
        return weeklyTip;
    }

    public void setWeeklyTip(String weeklyTip) {
        this.weeklyTip = weeklyTip;
    }
}