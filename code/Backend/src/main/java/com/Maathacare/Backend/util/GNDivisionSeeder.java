package com.Maathacare.Backend.util;

import com.Maathacare.Backend.model.entity.GNDivision;
import com.Maathacare.Backend.repository.GNDivisionRepository;
import org.springframework.boot.CommandLineRunner;
import org.springframework.core.io.ClassPathResource;
import org.springframework.stereotype.Component;

import java.io.BufferedReader;
import java.io.InputStreamReader;
import java.nio.charset.StandardCharsets;

@Component
public class GNDivisionSeeder implements CommandLineRunner {

    private final GNDivisionRepository repository;

    public GNDivisionSeeder(GNDivisionRepository repository) {
        this.repository = repository;
    }

    @Override
    public void run(String... args) throws Exception {
        // Only run if the table is empty to prevent duplicates
        if (repository.count() == 0) {
            try (BufferedReader br = new BufferedReader(
                    new InputStreamReader(new ClassPathResource("gn_data_clean.csv").getInputStream(), StandardCharsets.UTF_8))) {

                String line;
                boolean isHeader = true;
                while ((line = br.readLine()) != null) {
                    if (isHeader) { isHeader = false; continue; } // Skip CSV header

                    String[] data = line.split(",");
                    if (data.length >= 2) {
                        GNDivision div = new GNDivision();
                        div.setName(data[0].trim());
                        div.setMohArea(data[1].trim());
                        repository.save(div);
                    }
                }
                System.out.println("✅ Successfully seeded 14,000+ GN Divisions!");
            }
        }
    }
}