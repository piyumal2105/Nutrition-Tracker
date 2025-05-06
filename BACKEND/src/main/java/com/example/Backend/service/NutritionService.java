package com.example.Backend.service;

import com.example.Backend.dto.FoodLogDTO;
import com.example.Backend.dto.WaterLogDTO;
import com.example.Backend.model.FoodLog;
import com.example.Backend.model.User;
import com.example.Backend.model.WaterLog;
import com.example.Backend.repository.FoodLogRepository;
import com.example.Backend.repository.UserRepository;
import com.example.Backend.repository.WaterLogRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Optional;

@Service
public class NutritionService {

    private final FoodLogRepository foodLogRepository;
    private final WaterLogRepository waterLogRepository;
    private final UserRepository userRepository;

    @Autowired
    public NutritionService(FoodLogRepository foodLogRepository, WaterLogRepository waterLogRepository,
            UserRepository userRepository) {
        this.foodLogRepository = foodLogRepository;
        this.waterLogRepository = waterLogRepository;
        this.userRepository = userRepository;
    }

    public ResponseEntity<?> logFood(String userId, FoodLogDTO foodLogDTO) {
        Optional<User> userOpt = userRepository.findById(userId);
        if (userOpt.isEmpty()) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body("User not found");
        }

        FoodLog foodLog = new FoodLog();
        foodLog.setUserId(userId);
        foodLog.setDate(foodLogDTO.getDate());
        foodLog.setMealType(foodLogDTO.getMealType());
        foodLog.setFoodName(foodLogDTO.getFoodName());
        foodLog.setCalories(foodLogDTO.getCalories());

        // Check calorie limits
        User user = userOpt.get();
        Map<String, Object> response = new HashMap<>();
        if (user.getDailyCalorieGoal() != null) {
            List<FoodLog> dailyLogs = foodLogRepository.findByUserIdAndDate(userId, foodLogDTO.getDate());
            int totalCalories = dailyLogs.stream().mapToInt(FoodLog::getCalories).sum() + foodLogDTO.getCalories();
            if (totalCalories > user.getDailyCalorieGoal()) {
                response.put("warning", "This meal exceeds your daily calorie goal!");
            }
        }

        try {
            foodLogRepository.save(foodLog);
            response.put("message", "Food logged successfully");
            response.put("foodLog", foodLog);
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body("Failed to log food: " + e.getMessage());
        }
    }

    public ResponseEntity<?> logWater(String userId, WaterLogDTO waterLogDTO) {
        Optional<User> userOpt = userRepository.findById(userId);
        if (userOpt.isEmpty()) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body("User not found");
        }

        WaterLog waterLog = new WaterLog();
        waterLog.setUserId(userId);
        waterLog.setDate(waterLogDTO.getDate());
        waterLog.setGlasses(waterLogDTO.getGlasses());

        // Check water goal
        User user = userOpt.get();
        Map<String, Object> response = new HashMap<>();
        if (user.getDailyWaterGoal() != null) {
            List<WaterLog> dailyLogs = waterLogRepository.findByUserIdAndDate(userId, waterLogDTO.getDate());
            int totalGlasses = dailyLogs.stream().mapToInt(WaterLog::getGlasses).sum() + waterLogDTO.getGlasses();
            if (totalGlasses > user.getDailyWaterGoal()) {
                response.put("message", "Great job! You've exceeded your daily water goal!");
            }
        }

        try {
            waterLogRepository.save(waterLog);
            response.put("message", "Water logged successfully");
            response.put("waterLog", waterLog);
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body("Failed to log water: " + e.getMessage());
        }
    }

    public ResponseEntity<?> getDailyProgress(String userId, LocalDate date) {
        Optional<User> userOpt = userRepository.findById(userId);
        if (userOpt.isEmpty()) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body("User not found");
        }

        User user = userOpt.get();
        List<FoodLog> foodLogs = foodLogRepository.findByUserIdAndDate(userId, date);
        List<WaterLog> waterLogs = waterLogRepository.findByUserIdAndDate(userId, date);

        int totalCalories = foodLogs.stream().mapToInt(FoodLog::getCalories).sum();
        int totalGlasses = waterLogs.stream().mapToInt(WaterLog::getGlasses).sum();

        Map<String, Object> response = new HashMap<>();
        response.put("caloriesConsumed", totalCalories);
        response.put("calorieGoal", user.getDailyCalorieGoal());
        response.put("caloriesRemaining",
                user.getDailyCalorieGoal() != null ? user.getDailyCalorieGoal() - totalCalories : 0);
        response.put("waterConsumed", totalGlasses);
        response.put("waterGoal", user.getDailyWaterGoal());
        response.put("foodLogs", foodLogs);
        response.put("waterLogs", waterLogs);

        if (user.getDailyCalorieGoal() != null && totalCalories > user.getDailyCalorieGoal()) {
            response.put("calorieStatus", "Over goal");
        } else {
            response.put("calorieStatus", "Within goal");
        }

        if (user.getDailyWaterGoal() != null && totalGlasses >= user.getDailyWaterGoal()) {
            response.put("waterStatus", "Goal met");
        } else {
            response.put("waterStatus", "Below goal");
        }

        return ResponseEntity.ok(response);
    }

    public ResponseEntity<?> getWeeklyProgress(String userId, LocalDate startDate) {
        if (userId == null || userId.trim().isEmpty()) {
            return ResponseEntity.badRequest().body("User ID is required.");
        }
        if (startDate == null) {
            return ResponseEntity.badRequest().body("Start date is required.");
        }

        LocalDate endDate = startDate.plusDays(6);
        Optional<User> userOpt = userRepository.findById(userId);
        if (userOpt.isEmpty()) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body("User not found");
        }

        User user = userOpt.get();
        List<FoodLog> foodLogs = foodLogRepository.findByUserIdAndDateBetween(userId, startDate, endDate);
        List<WaterLog> waterLogs = waterLogRepository.findByUserIdAndDateBetween(userId, startDate, endDate);

        Map<LocalDate, Integer> dailyCalories = new HashMap<>();
        Map<LocalDate, Integer> dailyWater = new HashMap<>();
        for (LocalDate date = startDate; !date.isAfter(endDate); date = date.plusDays(1)) {
            dailyCalories.put(date, 0);
            dailyWater.put(date, 0);
        }

        foodLogs.forEach(log -> dailyCalories.merge(log.getDate(), log.getCalories(), Integer::sum));
        waterLogs.forEach(log -> dailyWater.merge(log.getDate(), log.getGlasses(), Integer::sum));

        int daysCalorieGoalMet = (int) dailyCalories.values().stream()
                .filter(calories -> user.getDailyCalorieGoal() != null && calories <= user.getDailyCalorieGoal())
                .count();
        int daysWaterGoalMet = (int) dailyWater.values().stream()
                .filter(glasses -> user.getDailyWaterGoal() != null && glasses >= user.getDailyWaterGoal())
                .count();

        Map<String, Object> response = new HashMap<>();
        response.put("dailyCalories", dailyCalories);
        response.put("dailyWater", dailyWater);
        response.put("daysCalorieGoalMet", daysCalorieGoalMet);
        response.put("daysWaterGoalMet", daysWaterGoalMet);
        response.put("calorieGoal", user.getDailyCalorieGoal());
        response.put("waterGoal", user.getDailyWaterGoal());
        response.put("summary",
                String.format("You met your calorie goal for %d days and water goal for %d days this week!",
                        daysCalorieGoalMet, daysWaterGoalMet));

        return ResponseEntity.ok(response);
    }
}