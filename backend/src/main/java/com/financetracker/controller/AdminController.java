package com.financetracker.controller;

import java.util.ArrayList;
import java.util.Date;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/admin")
public class AdminController {

    private static final List<Map<String, Object>> activityLog = new ArrayList<>();
    
    public static void log(String user, String action) {
        Map<String, Object> entry = new HashMap<>();
        entry.put("user", user);
        entry.put("action", action);
        entry.put("timestamp", new Date());
        activityLog.add(entry);
    }

    @GetMapping("/activity")
    public List<Map<String, Object>> getActivity() {
        return activityLog;
    }
}
