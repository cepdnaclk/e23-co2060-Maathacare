package com.Maathacare.Backend.entity;

import jakarta.persistence.*;

@Entity
@Table(name = "weekly_milestones")
public class WeeklyMilestone {

    @Id
    private Integer weekNumber;

    private String babySize;
    private String babyWeight;
    private String videoUrl;

    @Column(length = 1000)
    private String weeklyTip;

    // 🆕 NEW DETAILED FIELDS
    @Column(length = 2000)
    private String babyDevelopment; // Details about organ growth, etc.

    @Column(length = 2000)
    private String motherChanges;   // Symptoms and body changes

    @Column(length = 1500)
    private String phmChecklist;    // Sri Lankan clinic specific tasks

    // --- CONSTRUCTORS ---

    /**
     * Default constructor required by JPA
     */
    public WeeklyMilestone() {
    }

    /**
     * Full constructor for MilestoneDataLoader
     */
    public WeeklyMilestone(Integer weekNumber, String babySize, String babyWeight,
                           String babyDevelopment, String motherChanges,
                           String phmChecklist, String weeklyTip, String videoUrl) {
        this.weekNumber = weekNumber;
        this.babySize = babySize;
        this.babyWeight = babyWeight;
        this.babyDevelopment = babyDevelopment;
        this.motherChanges = motherChanges;
        this.phmChecklist = phmChecklist;
        this.weeklyTip = weeklyTip;
        this.videoUrl = videoUrl;
    }

    public WeeklyMilestone(int i, String s, String negligible, String s1, String video) {
    }

    // --- GETTERS AND SETTERS ---

    public Integer getWeekNumber() { return weekNumber; }
    public void setWeekNumber(Integer weekNumber) { this.weekNumber = weekNumber; }

    public String getBabySize() { return babySize; }
    public void setBabySize(String babySize) { this.babySize = babySize; }

    public String getBabyWeight() { return babyWeight; }
    public void setBabyWeight(String babyWeight) { this.babyWeight = babyWeight; }

    public String getVideoUrl() { return videoUrl; }
    public void setVideoUrl(String videoUrl) { this.videoUrl = videoUrl; }

    public String getWeeklyTip() { return weeklyTip; }
    public void setWeeklyTip(String weeklyTip) { this.weeklyTip = weeklyTip; }

    public String getBabyDevelopment() { return babyDevelopment; }
    public void setBabyDevelopment(String babyDevelopment) { this.babyDevelopment = babyDevelopment; }

    public String getMotherChanges() { return motherChanges; }
    public void setMotherChanges(String motherChanges) { this.motherChanges = motherChanges; }

    public String getPhmChecklist() { return phmChecklist; }
    public void setPhmChecklist(String phmChecklist) { this.phmChecklist = phmChecklist; }
}