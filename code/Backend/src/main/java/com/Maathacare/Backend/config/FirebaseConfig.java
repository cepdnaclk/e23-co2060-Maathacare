package com.Maathacare.Backend.config;

import com.google.auth.oauth2.GoogleCredentials;
import com.google.firebase.FirebaseApp;
import com.google.firebase.FirebaseOptions;
import org.springframework.context.annotation.Configuration;
import jakarta.annotation.PostConstruct; // Make sure this is jakarta, not javax, for Spring Boot 3+
import java.io.InputStream;

@Configuration // This tells Spring Boot to run this file automatically on startup
public class FirebaseConfig {

    @PostConstruct
    public void initialize() {
        try {
            // This looks for the file in your resources folder!
            InputStream serviceAccount = getClass().getClassLoader().getResourceAsStream("serviceAccountKey.json");

            if (serviceAccount == null) {
                System.err.println("❌ Firebase error: serviceAccountKey.json not found in resources folder!");
                return;
            }

            FirebaseOptions options = FirebaseOptions.builder()
                    .setCredentials(GoogleCredentials.fromStream(serviceAccount))
                    .build();

            if (FirebaseApp.getApps().isEmpty()) {
                FirebaseApp.initializeApp(options);
                System.out.println("🔥 Firebase Admin SDK initialized successfully!");
            }
        } catch (Exception e) {
            System.err.println("❌ Failed to initialize Firebase Admin SDK: " + e.getMessage());
        }
    }
}