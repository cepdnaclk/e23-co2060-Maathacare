package com.Maathacare.Backend.service;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.HttpEntity;
import org.springframework.http.ResponseEntity;
import java.util.Map;
import java.util.HashMap;

@Service
public class ExpoNotificationService {

    private static final String EXPO_PUSH_URL = "https://exp.host/--/api/v2/push/send";

    public void sendPushNotification(String expoPushToken, String title, String body) {
        // 1. Check if the token is valid before trying to send
        if (expoPushToken == null || !expoPushToken.startsWith("ExponentPushToken")) {
            System.out.println("⚠️ Skipping notification: Invalid or missing push token.");
            return;
        }

        try {
            RestTemplate restTemplate = new RestTemplate();

            // 2. Set up the Headers (Telling Expo we are sending JSON)
            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.APPLICATION_JSON);
            headers.set("Accept", "application/json");

            // 3. Build the JSON Payload
            Map<String, String> payload = new HashMap<>();
            payload.put("to", expoPushToken);
            payload.put("title", title);
            payload.put("body", body);

            // 4. Package it together
            HttpEntity<Map<String, String>> request = new HttpEntity<>(payload, headers);

            // 5. Fire the request to Expo's servers!
            ResponseEntity<String> response = restTemplate.postForEntity(EXPO_PUSH_URL, request, String.class);

            System.out.println("✅ Push notification sent! Response: " + response.getBody());

        } catch (Exception e) {
            System.err.println("❌ Failed to send push notification: " + e.getMessage());
        }
    }
}