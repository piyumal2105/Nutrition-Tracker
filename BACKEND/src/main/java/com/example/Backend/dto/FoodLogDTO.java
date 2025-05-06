package com.example.Backend.dto;

import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

import java.time.LocalDate;

public class FoodLogDTO {

    @NotBlank(message = "Meal type is required")
    private String mealType;

    @NotBlank(message = "Food name is required")
    private String foodName;

    @NotNull(message = "Calories are required")
    @Min(value = 1, message = "Calories must be positive")
    private Integer calories;

    @NotNull(message = "Date is required")
    private LocalDate date;

    // Getters and Setters
    public String getMealType() {
        return mealType;
    }

    public void setMealType(String mealType) {
        this.mealType = mealType;
    }

    public String getFoodName() {
        return foodName;
    }

    public void setFoodName(String foodName) {
        this.foodName = foodName;
    }

    public Integer getCalories() {
        return calories;
    }

    public void setCalories(Integer calories) {
        this.calories = calories;
    }

    public LocalDate getDate() {
        return date;
    }

    public void setDate(LocalDate date) {
        this.date = date;
    }
}