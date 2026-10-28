package com.Maathacare.Backend.dto;

public class StaffResponse {

    private String fullName;
    private String mohArea;
    private String nic;
    private String staffId;
    private String gnDivision;
    private Boolean isActive;
    private int motherCount;

    public StaffResponse() {
    }

    public StaffResponse(
            String fullName,
            String mohArea,
            String nic,
            String staffId,
            String gnDivision,
            Boolean isActive,
            int motherCount
    ) {
        this.fullName = fullName;
        this.mohArea = mohArea;
        this.nic = nic;
        this.staffId = staffId;
        this.gnDivision = gnDivision;
        this.isActive = isActive;
        this.motherCount = motherCount;
    }

    public String getFullName() {
        return fullName;
    }

    public void setFullName(String fullName) {
        this.fullName = fullName;
    }

    public String getMohArea() {
        return mohArea;
    }

    public void setMohArea(String mohArea) {
        this.mohArea = mohArea;
    }

    public String getNic() {
        return nic;
    }

    public void setNic(String nic) {
        this.nic = nic;
    }

    public String getStaffId() {
        return staffId;
    }

    public void setStaffId(String staffId) {
        this.staffId = staffId;
    }

    public String getGnDivision() {
        return gnDivision;
    }

    public void setGnDivision(String gnDivision) {
        this.gnDivision = gnDivision;
    }

    public Boolean getIsActive() {
        return isActive;
    }

    public void setIsActive(Boolean active) {
        isActive = active;
    }

    public int getMotherCount() {
        return motherCount;
    }

    public void setMotherCount(int motherCount) {
        this.motherCount = motherCount;
    }
}