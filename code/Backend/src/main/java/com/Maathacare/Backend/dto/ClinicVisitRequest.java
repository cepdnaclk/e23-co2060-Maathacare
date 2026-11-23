package com.Maathacare.Backend.dto;

import java.util.List;

public class ClinicVisitRequest {

    private String remarks;
    private String additionalNotes;
    private String nextDate;
    private String nextTime;
    private List<SupplementDetail> supplements;

    public String getRemarks() {
        return remarks;
    }

    public void setRemarks(String remarks) {
        this.remarks = remarks;
    }

    public String getAdditionalNotes() {
        return additionalNotes;
    }

    public void setAdditionalNotes(String additionalNotes) {
        this.additionalNotes = additionalNotes;
    }

    public String getNextDate() {
        return nextDate;
    }

    public void setNextDate(String nextDate) {
        this.nextDate = nextDate;
    }

    public String getNextTime() {
        return nextTime;
    }

    public void setNextTime(String nextTime) {
        this.nextTime = nextTime;
    }

    public List<SupplementDetail> getSupplements() {
        return supplements;
    }

    public void setSupplements(List<SupplementDetail> supplements) {
        this.supplements = supplements;
    }

    public static class SupplementDetail {
        private String name;
        private String dosage;
        private String instructions;

        public String getName() {
            return name;
        }

        public void setName(String name) {
            this.name = name;
        }

        public String getDosage() {
            return dosage;
        }

        public void setDosage(String dosage) {
            this.dosage = dosage;
        }

        public String getInstructions() {
            return instructions;
        }

        public void setInstructions(String instructions) {
            this.instructions = instructions;
        }
    }
}