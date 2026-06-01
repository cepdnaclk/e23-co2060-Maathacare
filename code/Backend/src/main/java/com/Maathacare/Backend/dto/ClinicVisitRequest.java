package com.Maathacare.Backend.dto;

import java.util.List;

public class ClinicVisitRequest {
    private String remarks;
    private List<SupplementDetail> supplements;

    // Inner class to handle both the name and how to take it
    public static class SupplementDetail {
        private String name;
        private String instructions;

        public String getName() { return name; }
        public void setName(String name) { this.name = name; }
        public String getInstructions() { return instructions; }
        public void setInstructions(String instructions) { this.instructions = instructions; }
    }

    public String getRemarks() { return remarks; }
    public void setRemarks(String remarks) { this.remarks = remarks; }
    public List<SupplementDetail> getSupplements() { return supplements; }
    public void setSupplements(List<SupplementDetail> supplements) { this.supplements = supplements; }
}
