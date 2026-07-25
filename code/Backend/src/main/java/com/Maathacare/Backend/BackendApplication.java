package com.Maathacare.Backend;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.scheduling.annotation.EnableScheduling;
import jakarta.annotation.PostConstruct;

@SpringBootApplication
@EnableScheduling
public class BackendApplication {

	// This method runs immediately when the app starts
	@PostConstruct
	public void init() {
		System.setProperty("https.protocols", "TLSv1.2");
	}

	public static void main(String[] args) {
		SpringApplication.run(BackendApplication.class, args);
	}
}