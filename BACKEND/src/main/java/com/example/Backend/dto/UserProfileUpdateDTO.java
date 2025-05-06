package com.example.Backend.dto;

import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotNull;

public class UserProfileUpdateDTO {

    @NotNull(message = "Age is required")
    @Min(value = 1, message = "Age must be positive")
    private Integer age;

    @NotNull(message = "Weight is required")
    @Min(value = 1, message = "Weight must be positive")
    private Double weight;

    @NotNull(message = "Height is required")
    @Min(value = 1, message = "Height must be positive")
    private Double height;

    @NotNull(message = "Health goal is required")
    private String healthGoal;

    @NotNull(message = "Diet preference is required")
    private String dietPreference;

    // Getters and Setters
    public Integer getAge() {
        return age;
    }

    public void setAge(Integer age) {
        this.age = age;
    }

    public Double getWeight() {
        return weight;
    }

    public void setWeight(Double weight) {
        this.weight = weight;
    }

    public Double getHeight() {
        return height;
    }

    public void setHeight(Double height) {
        this.height = height;
    }

    public String getHealthGoal() {
        return healthGoal;
    }

    public void setHealthGoal(String healthGoal) {
        this.healthGoal = healthGoal;
    }

    public String getDietPreference() {
        return dietPreference;
    }

    public void setDietPreference(String dietPreference) {
        this.dietPreference = dietPreference;
    }
}