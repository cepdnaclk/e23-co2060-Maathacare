package com.Maathacare.Backend.dto;

public class AreaStat {

    private String areaName;
    private long phmCount;
    private long motherCount;
    private String status;

    public AreaStat() {
    }

    public AreaStat(
            String areaName,
            long phmCount,
            long motherCount,
            String status
    ) {
        this.areaName = areaName;
        this.phmCount = phmCount;
        this.motherCount = motherCount;
        this.status = status;
    }

    public String getAreaName() {
        return areaName;
    }

    public void setAreaName(String areaName) {
        this.areaName = areaName;
    }

    public long getPhmCount() {
        return phmCount;
    }

    public void setPhmCount(long phmCount) {
        this.phmCount = phmCount;
    }

    public long getMotherCount() {
        return motherCount;
    }

    public void setMotherCount(long motherCount) {
        this.motherCount = motherCount;
    }

    public String getStatus() {
        return status;
    }

    public void setStatus(String status) {
        this.status = status;
    }
}