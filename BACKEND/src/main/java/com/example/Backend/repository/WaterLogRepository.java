package com.example.Backend.repository;

import com.example.Backend.model.WaterLog;
import org.springframework.data.mongodb.repository.MongoRepository;

import java.time.LocalDate;
import java.util.List;

public interface WaterLogRepository extends MongoRepository<WaterLog, String> {
    List<WaterLog> findByUserIdAndDate(String userId, LocalDate date);

    List<WaterLog> findByUserIdAndDateBetween(String userId, LocalDate startDate, LocalDate endDate);
}