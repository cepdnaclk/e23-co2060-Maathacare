package com.Maathacare.Backend.dto;

public class VisitRecordRequest {
    private String motherId;
    private Integer gestationalWeek;
    private Double weight;
    private String bloodPressure;
    private Double sfh;
    private String fhs;
    private String fetalMovements;
    private Double hb;
    private String urineProtein;
    private String urineSugar;
    private Boolean iron;
    private Boolean folicAcid;
    private Boolean calcium;

    // Standard Getters and Setters
    public String getMotherId() { return motherId; }
    public void setMotherId(String motherId) { this.motherId = motherId; }
    public Integer getGestationalWeek() { return gestationalWeek; }
    public void setGestationalWeek(Integer gestationalWeek) { this.gestationalWeek = gestationalWeek; }
    public Double getWeight() { return weight; }
    public void setWeight(Double weight) { this.weight = weight; }
    public String getBloodPressure() { return bloodPressure; }
    public void setBloodPressure(String bloodPressure) { this.bloodPressure = bloodPressure; }
    public Double getSfh() { return sfh; }
    public void setSfh(Double sfh) { this.sfh = sfh; }
    public String getFhs() { return fhs; }
    public void setFhs(String fhs) { this.fhs = fhs; }
    public String getFetalMovements() { return fetalMovements; }
    public void setFetalMovements(String fetalMovements) { this.fetalMovements = fetalMovements; }
    public Double getHb() { return hb; }
    public void setHb(Double hb) { this.hb = hb; }
    public String getUrineProtein() { return urineProtein; }
    public void setUrineProtein(String urineProtein) { this.urineProtein = urineProtein; }
    public String getUrineSugar() { return urineSugar; }
    public void setUrineSugar(String urineSugar) { this.urineSugar = urineSugar; }
    public Boolean getIron() { return iron; }
    public void setIron(Boolean iron) { this.iron = iron; }
    public Boolean getFolicAcid() { return folicAcid; }
    public void setFolicAcid(Boolean folicAcid) { this.folicAcid = folicAcid; }
    public Boolean getCalcium() { return calcium; }
    public void setCalcium(Boolean calcium) { this.calcium = calcium; }
}