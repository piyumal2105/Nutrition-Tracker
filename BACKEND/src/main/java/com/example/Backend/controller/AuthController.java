package com.example.Backend.controller;

import com.example.Backend.dto.LoginRequest;
import com.example.Backend.dto.RegisterRequest;
import com.example.Backend.enums.RegistrationSource;
import com.example.Backend.model.User;
import com.example.Backend.service.AuthService;
import com.example.Backend.service.UserService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.oauth2.core.user.OAuth2User;
import org.springframework.web.bind.annotation.*;

import java.net.URI;
import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/api/auth")
public class AuthController {

    private final UserService userService;

    @Autowired
    public AuthController(UserService userService) {
        this.userService = userService;
    }

    @GetMapping("/oauth2/success")
    public ResponseEntity<Object> handleOAuth2Success(@AuthenticationPrincipal OAuth2User principal) {
        if (principal != null) {
            String name = principal.getAttribute("name");
            String email = principal.getAttribute("email");
            String picture = principal.getAttribute("picture");
            User user = new User();
            user.setEmail(email);
            user.setName(name);
            user.setProfileImage(picture);
            user.setRegistrationSource(RegistrationSource.GOOGLE);

            ResponseEntity<Object> userResponse = userService.createUser(user);
            if (userResponse.getStatusCode() == HttpStatus.OK) {
                Map<String, Object> userData = (Map<String, Object>) userResponse.getBody();
                String token = (String) userData.get("token");
                // Redirect to frontend with token
                HttpHeaders headers = new HttpHeaders();
                headers.setLocation(URI.create("http://localhost:5173/auth/callback?token=" + token));
                return new ResponseEntity<>(headers, HttpStatus.FOUND);
            }
            return ResponseEntity.badRequest().body("Failed to create user");
        } else {
            return ResponseEntity.badRequest().body("OAuth authentication failed");
        }
    }

    @PostMapping("/register")
    public ResponseEntity<Object> createUser(@RequestBody User user) {
        return userService.createUser(user);
    }

    @PostMapping("/login")
    public ResponseEntity<Object> loginUser(@RequestBody User user) {
        return userService.loginUser(user.getEmail(), user.getPassword());
    }

    @GetMapping("/me")
    public ResponseEntity<Object> getCurrentUser(@RequestHeader("Authorization") String token) {
        Map<String, String> response = new HashMap<>();
        response.put("message", "Token is valid");
        return ResponseEntity.ok(response);
    }
}