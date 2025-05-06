package com.example.Backend.controller;

import com.example.Backend.dto.FoodLogDTO;
import com.example.Backend.dto.UserProfileUpdateDTO;
import com.example.Backend.dto.WaterLogDTO;
import com.example.Backend.service.NutritionService;
import com.example.Backend.service.UserService;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.time.format.DateTimeParseException;

@RestController
@RequestMapping("/api/nutrition")
public class NutritionController {

    private final NutritionService nutritionService;
    private final UserService userService;

    @Autowired
    public NutritionController(NutritionService nutritionService, UserService userService) {
        this.nutritionService = nutritionService;
        this.userService = userService;
    }

    @PutMapping("/profile/{userId}")
    public ResponseEntity<?> updateNutritionProfile(@PathVariable String userId,
            @Valid @RequestBody UserProfileUpdateDTO profileDTO) {
        return userService.updateNutritionProfile(userId, profileDTO);
    }

    @PostMapping("/food/{userId}")
    public ResponseEntity<?> logFood(@PathVariable String userId, @Valid @RequestBody FoodLogDTO foodLogDTO) {
        return nutritionService.logFood(userId, foodLogDTO);
    }

    @PostMapping("/water/{userId}")
    public ResponseEntity<?> logWater(@PathVariable String userId, @Valid @RequestBody WaterLogDTO waterLogDTO) {
        return nutritionService.logWater(userId, waterLogDTO);
    }

    @GetMapping("/progress/daily/{userId}")
    public ResponseEntity<?> getDailyProgress(@PathVariable String userId,
            @RequestParam String date) {
        try {
            LocalDate localDate = LocalDate.parse(date);
            return nutritionService.getDailyProgress(userId, localDate);
        } catch (DateTimeParseException e) {
            return ResponseEntity.badRequest().body("Invalid date format. Use YYYY-MM-DD.");
        }
    }

    @GetMapping("/progress/weekly/{userId}")
    public ResponseEntity<?> getWeeklyProgress(@PathVariable String userId,
            @RequestParam String startDate) {
        if (userId == null || userId.trim().isEmpty()) {
            return ResponseEntity.badRequest().body("User ID is required.");
        }
        if (startDate == null || startDate.trim().isEmpty()) {
            return ResponseEntity.badRequest().body("Start date is required.");
        }
        try {
            LocalDate localStartDate = LocalDate.parse(startDate);
            return nutritionService.getWeeklyProgress(userId, localStartDate);
        } catch (DateTimeParseException e) {
            return ResponseEntity.badRequest().body("Invalid start date format. Use YYYY-MM-DD.");
        }
    }
}