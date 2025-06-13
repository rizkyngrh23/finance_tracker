package com.financetracker.controller;

import java.io.IOException;
import java.util.ArrayList;
import java.util.Arrays;
import java.util.List;
import java.util.Map;

import org.springframework.http.ContentDisposition;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.multipart.MultipartFile;

import com.fasterxml.jackson.databind.ObjectMapper;

@RestController
@RequestMapping("/api/backup")
public class BackupController {

    private static List<Map<String, Object>> dummyData = new ArrayList<>();

    @GetMapping("/export")
    public ResponseEntity<byte[]> exportData() throws IOException {
        ObjectMapper mapper = new ObjectMapper();
        byte[] data = mapper.writeValueAsBytes(dummyData);
        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.APPLICATION_OCTET_STREAM);
        headers.setContentDisposition(ContentDisposition.attachment().filename("backup.json").build());
        return new ResponseEntity<>(data, headers, HttpStatus.OK);
    }

    @PostMapping("/import")
    @SuppressWarnings("unchecked")
    public ResponseEntity<?> importData(@RequestParam("file") MultipartFile file) throws IOException {
        ObjectMapper mapper = new ObjectMapper();
        Map<String, Object>[] importedArray = mapper.readValue(file.getInputStream(), Map[].class);
        List<Map<String, Object>> imported = Arrays.asList(importedArray);
        dummyData = new ArrayList<>(imported);
        return ResponseEntity.ok().build();
    }
}
