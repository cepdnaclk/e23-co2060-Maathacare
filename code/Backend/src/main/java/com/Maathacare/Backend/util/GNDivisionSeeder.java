package com.Maathacare.Backend.util;

import com.Maathacare.Backend.model.entity.GNDivision;
import com.Maathacare.Backend.repository.GNDivisionRepository;
import org.springframework.boot.CommandLineRunner;
import org.springframework.core.io.ClassPathResource;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

import java.io.BufferedReader;
import java.io.InputStreamReader;
import java.nio.charset.StandardCharsets;
import java.util.ArrayList;
import java.util.HashSet;
import java.util.List;
import java.util.Set;
import java.util.stream.Collectors;

@Component
public class GNDivisionSeeder implements CommandLineRunner {

    private final GNDivisionRepository repository;

    public GNDivisionSeeder(GNDivisionRepository repository) {
        this.repository = repository;
    }

    @Override
    @Transactional
    public void run(String... args) throws Exception {
        // 1. Load ALL existing names into memory ONCE
        Set<String> existingNames = repository.findAll()
                .stream()
                .map(GNDivision::getName)
                .collect(Collectors.toSet());

        String[] districtFiles = {
                "gn_data_kandy.csv",
                "gn_data_mathale.csv",
                "gn_data_nuwaraeliya.csv",
                "gn_data_matara.csv",
                "gn_data_galle.csv",
                "gn_data_hambantota.csv",
                "gn_data_colombo.csv",
                "gn_data_kaluthara.csv",
                "gn_data_gampaha.csv",
                "gn_data_anuradhapura.csv",
                "gn_data_polonnaruwa.csv",
                "gn_data_kurunegala.csv",
                "gn_data_puttalam.csv",
                "gn_data_kegalle.csv",
                "gn_data_rathnapura.csv",
                "gn_data_monaragala.csv",
                "gn_data_badulla.csv",
                "gn_data_ampara.csv",
                "gn_data_trincomalee.csv",
                "gn_data_batticalo.csv",
                "gn_data_jaffna.csv",
                "gn_data_mulativ.csv",
                "gn_data_mannar.csv",
                "gn_data_kilinochchi.csv",
                "gn_data_vavniya.csv"
        };

        for (String fileName : districtFiles) {
            importCsv(fileName, existingNames);
        }
        System.out.println("✅ Seeding complete.");
    }

    private void importCsv(String fileName, Set<String> existingNames) {
        try (BufferedReader br = new BufferedReader(
                new InputStreamReader(new ClassPathResource(fileName).getInputStream(), StandardCharsets.UTF_8))) {

            String line;
            boolean isHeader = true;
            List<GNDivision> batch = new ArrayList<>();

            while ((line = br.readLine()) != null) {
                if (isHeader) { isHeader = false; continue; }

                String[] data = line.split(",");
                if (data.length >= 2) {
                    String gnName = data[0].trim();

                    // 2. Memory-based check (Instant)
                    if (!existingNames.contains(gnName)) {
                        GNDivision div = new GNDivision();
                        div.setName(gnName);
                        div.setMohArea(data[1].trim());
                        batch.add(div);
                        existingNames.add(gnName);
                    }
                }
            }
            // 3. Batch insert
            if (!batch.isEmpty()) {
                repository.saveAll(batch);
                System.out.println("🚀 Saved " + batch.size() + " records from " + fileName);
            }
        } catch (Exception e) {
            System.err.println("❌ Error: " + fileName + " - " + e.getMessage());
        }
    }
}