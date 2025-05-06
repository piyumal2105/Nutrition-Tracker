package com.example.Backend.dto;

import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotNull;

import java.time.LocalDate;

public class WaterLogDTO {

    @NotNull(message = "Glasses are required")
    @Min(value = 1, message = "Glasses must be positive")
    private Integer glasses;

    @NotNull(message = "Date is required")
    private LocalDate date;

    // Getters and Setters
    public Integer getGlasses() {
        return glasses;
    }

    public void setGlasses(Integer glasses) {
        this.glasses = glasses;
    }

    public LocalDate getDate() {
        return date;
    }

    public void setDate(LocalDate date) {
        this.date = date;
    }
}