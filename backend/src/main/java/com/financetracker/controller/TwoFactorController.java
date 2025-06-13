package com.financetracker.controller;

import java.util.HashMap;
import java.util.Map;
import java.util.Random;
import java.util.concurrent.ConcurrentHashMap;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/2fa")
public class TwoFactorController {

    private static final Logger logger = LoggerFactory.getLogger(TwoFactorController.class);
    private final JavaMailSender mailSender;
    private final Map<String, String> otpStore = new ConcurrentHashMap<>();

    public TwoFactorController(JavaMailSender mailSender) {
        this.mailSender = mailSender;
    }

    @PostMapping("/request")
    public ResponseEntity<?> requestOtp(@RequestBody Map<String, String> payload) {
        logger.info("Received OTP request for email: {}", payload.get("email"));
String email = payload.get("email");
String otp = String.valueOf(new Random().nextInt(900_000) + 100_000);

otpStore.put(email, otp);

SimpleMailMessage message = new SimpleMailMessage();
message.setTo(email);
message.setSubject("Your OTP Code");
message.setText("Your OTP code is: " + otp);
try {
    mailSender.send(message);
    logger.info("OTP sent to {}: {}", email, otp);
    return ResponseEntity.ok().body(Map.of("message", "OTP sent"));
        } catch (org.springframework.mail.MailException e) {
            logger.error("Failed to send OTP email to {}: {}", email, e.getMessage(), e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body(Map.of("error", "Failed to send OTP email", "details", e.getMessage()));
        }
    }

    @PostMapping("/verify")
    public Map<String, Object> verifyOtp(@RequestBody Map<String, String> payload) {
        String email = payload.get("email");
        String otp = payload.get("otp");
        Map<String, Object> res = new HashMap<>();
        boolean valid = otp != null && otp.equals(otpStore.get(email));
        res.put("valid", valid);
        if (valid) otpStore.remove(email);
        return res;
    }
}
