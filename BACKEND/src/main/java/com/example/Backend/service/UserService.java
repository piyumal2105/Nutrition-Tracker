package com.example.Backend.service;

import com.example.Backend.dto.ProfileUpdateDTO;
import com.example.Backend.dto.UserDTO;
import com.example.Backend.dto.UserProfileDTO;
import com.example.Backend.dto.UserProfileUpdateDTO;
import com.example.Backend.enums.RegistrationSource;
import com.example.Backend.model.User;
import com.example.Backend.repository.UserRepository;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.security.Keys;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.stereotype.Service;

import java.security.Key;
import java.util.*;
import java.util.stream.Collectors;

@Service
public class UserService {

    private final UserRepository userRepository;
    private final BCryptPasswordEncoder bCryptPasswordEncoder;
    private final long JWT_EXPIRATION = 86400000; // 24 hours in milliseconds
    private final Key jwtSecretKey;
    private final String jwtSecret = "aslsdadadq9iqpweipqowie293i112313sdadadadqweqe1smgs90329109310"; // Replace with a
                                                                                                       // secure key

    @Autowired
    public UserService(UserRepository userRepository, BCryptPasswordEncoder bCryptPasswordEncoder, Key jwtSecretKey) {
        this.userRepository = userRepository;
        this.bCryptPasswordEncoder = bCryptPasswordEncoder;
        this.jwtSecretKey = jwtSecretKey;
    }

    public ResponseEntity<Object> createUser(User user) {
        Optional<User> existingUser = userRepository.findByEmail(user.getEmail());

        if (existingUser.isPresent()) {
            if (user.getRegistrationSource() == RegistrationSource.GOOGLE) {
                return generateTokenResponse(existingUser.get());
            }
            return ResponseEntity.status(HttpStatus.CONFLICT).body("User with this email already exists");
        }

        if (user.getRegistrationSource() == null) {
            user.setRegistrationSource(RegistrationSource.CREDENTIAL);
        }

        if (user.getRegistrationSource() == RegistrationSource.CREDENTIAL && user.getPassword() != null) {
            user.setPassword(bCryptPasswordEncoder.encode(user.getPassword()));
        }

        // Initialize lists if they're null
        if (user.getFollowingUsers() == null) {
            user.setFollowingUsers(new ArrayList<>());
        }

        if (user.getFollowedUsers() == null) {
            user.setFollowedUsers(new ArrayList<>());
        }

        if (user.getSkills() == null) {
            user.setSkills(new ArrayList<>());
        }

        try {
            User savedUser = userRepository.save(user);
            return generateTokenResponse(savedUser);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body("Failed to create user: " + e.getMessage());
        }
    }

    public ResponseEntity<Object> loginUser(String email, String password) {
        Optional<User> user = userRepository.findByEmail(email);

        if (user.isEmpty()) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body("User credentials are incorrect");
        }

        User foundUser = user.get();

        if (foundUser.getRegistrationSource() == RegistrationSource.GOOGLE && foundUser.getPassword() == null) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body("User credentials are incorrect");
        }

        // for credential users, validate password
        if (!bCryptPasswordEncoder.matches(password, foundUser.getPassword())) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("Invalid credentials");
        }

        return generateTokenResponse(foundUser);
    }

    private ResponseEntity<Object> generateTokenResponse(User user) {
        String token = generateJwtToken(user);

        Map<String, Object> responseMap = new HashMap<>();
        responseMap.put("id", user.getId());
        responseMap.put("name", user.getName());
        responseMap.put("email", user.getEmail());
        responseMap.put("profileImage", user.getProfileImage());
        responseMap.put("token", token);
        responseMap.put("followingUsers", user.getFollowingUsers());
        responseMap.put("followedUsers", user.getFollowedUsers());
        responseMap.put("profileCompleted", user.isProfileCompleted());

        return ResponseEntity.ok(responseMap);
    }

    private String generateJwtToken(User user) {
        Date now = new Date();
        Date expiryDate = new Date(now.getTime() + JWT_EXPIRATION);

        return Jwts.builder().setSubject(user.getId()).claim("name", user.getName()).claim("email", user.getEmail())
                .setIssuedAt(now).setExpiration(expiryDate).signWith(jwtSecretKey).compact();
    }

    public String generateJwtTokenForOAuthUser(User user) {
        Optional<User> existingUser = userRepository.findByEmail(user.getEmail());
        User savedUser;
        if (existingUser.isPresent()) {
            savedUser = existingUser.get();
        } else {
            savedUser = userRepository.save(user);
        }

        Key key = Keys.hmacShaKeyFor(jwtSecret.getBytes());
        return Jwts.builder()
                .setSubject(savedUser.getId())
                .setIssuedAt(new Date())
                .setExpiration(new Date(System.currentTimeMillis() + 86400000)) // 1 day
                .signWith(key)
                .compact();
    }

    public UserProfileDTO convertToProfileDTO(User user) {
        UserProfileDTO profileDTO = new UserProfileDTO();

        profileDTO.setId(user.getId());
        profileDTO.setName(user.getName());
        profileDTO.setEmail(user.getEmail());
        profileDTO.setProfileImage(user.getProfileImage());
        profileDTO.setBio(user.getBio());
        profileDTO.setSkills(user.getSkills());
        profileDTO.setLocation(user.getLocation());
        profileDTO.setFollowingUsers(user.getFollowingUsers());
        profileDTO.setFollowedUsers(user.getFollowedUsers());
        profileDTO.setRegistrationSource(user.getRegistrationSource());

        return profileDTO;
    }

    public ResponseEntity<?> getUserProfile(String userId) {
        Optional<User> userOpt = userRepository.findById(userId);

        if (userOpt.isEmpty()) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body("User not found");
        }

        User user = userOpt.get();
        UserProfileDTO profileDTO = convertToProfileDTO(user);

        return ResponseEntity.ok(profileDTO);
    }

    public List<UserProfileDTO> getUsersByIds(List<String> userIds) {
        List<User> users = userRepository.findAllById(userIds);

        return users.stream().map(this::convertToProfileDTO).collect(Collectors.toList());
    }

    public ResponseEntity<?> updateUserProfile(String userId, ProfileUpdateDTO profileDTO) {
        Optional<User> userOpt = userRepository.findById(userId);

        if (userOpt.isEmpty()) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body("User not found");
        }

        User user = userOpt.get();

        if (profileDTO.getName() != null && !profileDTO.getName().trim().isEmpty()) {
            user.setName(profileDTO.getName());
        }

        if (profileDTO.getBio() != null) {
            user.setBio(profileDTO.getBio());
        }

        if (profileDTO.getSkills() != null) {
            user.setSkills(profileDTO.getSkills());
        }

        if (profileDTO.getLocation() != null) {
            user.setLocation(profileDTO.getLocation());
        }

        if (profileDTO.getProfileImage() != null) {
            user.setProfileImage(profileDTO.getProfileImage());
        }

        try {
            User updatedUser = userRepository.save(user);
            return ResponseEntity.ok(convertToProfileDTO(updatedUser));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body("Failed to update profile: " + e.getMessage());
        }
    }

    public ResponseEntity<?> followUser(String userId, String followerId) {
        Optional<User> targetUserOpt = userRepository.findById(userId);
        Optional<User> followerUserOpt = userRepository.findById(followerId);

        if (targetUserOpt.isEmpty() || followerUserOpt.isEmpty()) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body("User not found");
        }

        User targetUser = targetUserOpt.get();
        User followerUser = followerUserOpt.get();

        if (targetUser.getFollowedUsers().contains(followerId) || followerUser.getFollowingUsers().contains(userId)) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body("Already following this user");
        }

        targetUser.getFollowedUsers().add(followerId);
        followerUser.getFollowingUsers().add(userId);

        try {
            userRepository.save(targetUser);
            userRepository.save(followerUser);

            Map<String, Object> response = new HashMap<>();
            response.put("message", "Successfully followed user");
            response.put("user", convertToProfileDTO(targetUser));

            return ResponseEntity.ok(response);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body("Failed to follow user: " + e.getMessage());
        }
    }

    public ResponseEntity<?> unfollowUser(String userId, String followerId) {
        Optional<User> targetUserOpt = userRepository.findById(userId);
        Optional<User> followerUserOpt = userRepository.findById(followerId);

        if (targetUserOpt.isEmpty() || followerUserOpt.isEmpty()) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body("User not found");
        }

        User targetUser = targetUserOpt.get();
        User followerUser = followerUserOpt.get();

        targetUser.getFollowedUsers().remove(followerId);
        followerUser.getFollowingUsers().remove(userId);

        try {
            userRepository.save(targetUser);
            userRepository.save(followerUser);

            Map<String, Object> response = new HashMap<>();
            response.put("message", "Successfully unfollowed user");
            response.put("user", convertToProfileDTO(targetUser));

            return ResponseEntity.ok(response);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body("Failed to unfollow user: " + e.getMessage());
        }
    }

    public ResponseEntity<?> updateNutritionProfile(String userId, UserProfileUpdateDTO profileDTO) {
        Optional<User> userOpt = userRepository.findById(userId);

        if (userOpt.isEmpty()) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body("User not found");
        }

        User user = userOpt.get();

        user.setAge(profileDTO.getAge());
        user.setWeight(profileDTO.getWeight());
        user.setHeight(profileDTO.getHeight());
        user.setHealthGoal(profileDTO.getHealthGoal());
        user.setDietPreference(profileDTO.getDietPreference());
        user.setDailyCalorieGoal(calculateDailyCalorieGoal(user));
        user.setDailyWaterGoal(calculateDailyWaterGoal(user));
        user.setProfileCompleted(true);

        try {
            User updatedUser = userRepository.save(user);
            return ResponseEntity.ok(convertToProfileDTO(updatedUser));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body("Failed to update nutrition profile: " + e.getMessage());
        }
    }

    private Integer calculateDailyCalorieGoal(User user) {
        // Simplified Mifflin-St Jeor Equation for BMR
        double bmr;
        if (user.getAge() != null && user.getWeight() != null && user.getHeight() != null) {
            bmr = 10 * user.getWeight() + 6.25 * user.getHeight() - 5 * user.getAge();
            bmr += 5; // Assuming male for simplicity; adjust for female if needed
        } else {
            return 2000; // Default value
        }

        // Adjust based on health goal
        switch (user.getHealthGoal().toLowerCase()) {
            case "weight_loss":
                return (int) (bmr * 0.8); // 20% deficit
            case "muscle_gain":
                return (int) (bmr * 1.2); // 20% surplus
            default:
                return (int) bmr;
        }
    }

    private Integer calculateDailyWaterGoal(User user) {
        // Simple rule: 0.033 liters per kg of body weight, assume 250ml per glass
        if (user.getWeight() != null) {
            double liters = user.getWeight() * 0.033;
            return (int) Math.ceil(liters / 0.25); // Convert to glasses
        }
        return 8; // Default
    }
}