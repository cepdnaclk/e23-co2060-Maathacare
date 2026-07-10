package com.Maathacare.Backend.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class AreaStat {
    private String areaName;
    private long phmCount;
    private long motherCount;
    private String status;
}
