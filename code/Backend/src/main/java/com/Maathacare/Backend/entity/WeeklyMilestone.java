package com.Maathacare.Backend.entity;

import jakarta.persistence.*;

@Entity
@Table(name = "weekly_milestones") // Matches your pgAdmin table name
public class WeeklyMilestone {

    @Id
    private Integer weekNumber;

    private String babySize;
    private String babyWeight;

    @Column(length = 1000)
    private String weeklyTip;

    // --- CONSTRUCTORS ---

    /**
     * Required by JPA/Hibernate to fetch data from the database.
     */
    public WeeklyMilestone() {
    }

    /**
     * Required by MilestoneDataLoader to create new weeks of data.
     * This fixes the "cannot be applied to given types" error.
     */
    public WeeklyMilestone(Integer weekNumber, String babySize, String babyWeight, String weeklyTip) {
        this.weekNumber = weekNumber;
        this.babySize = babySize;
        this.babyWeight = babyWeight;
        this.weeklyTip = weeklyTip;
    }

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