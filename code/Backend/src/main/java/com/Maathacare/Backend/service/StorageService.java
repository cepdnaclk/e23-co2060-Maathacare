package com.Maathacare.Backend.service;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;
import software.amazon.awssdk.auth.credentials.AwsBasicCredentials;
import software.amazon.awssdk.auth.credentials.StaticCredentialsProvider;
import software.amazon.awssdk.core.sync.RequestBody;
import software.amazon.awssdk.http.apache.ApacheHttpClient;
import software.amazon.awssdk.regions.Region;
import software.amazon.awssdk.services.s3.S3Client;
import software.amazon.awssdk.services.s3.model.PutObjectRequest;

import java.io.IOException;
import java.net.URI;
import java.util.UUID;

@Service
public class StorageService {

    private final S3Client s3Client;
    private final String bucketName;
    private final String projectRef;

    public StorageService(
            @Value("${supabase.s3.endpoint}") String endpoint,
            @Value("${supabase.s3.region}") String region,
            @Value("${supabase.s3.access-key}") String accessKey,
            @Value("${supabase.s3.secret-key}") String secretKey,
            @Value("${supabase.s3.bucket}") String bucketName) {

        this.bucketName = bucketName;
        this.projectRef = endpoint.replace("https://", "").split("\\.")[0];

        // Standard, reliable builder for Java 17
        this.s3Client = S3Client.builder()
                .endpointOverride(URI.create(endpoint))
                .region(Region.of(region))
                .credentialsProvider(StaticCredentialsProvider.create(AwsBasicCredentials.create(accessKey, secretKey)))
                .httpClientBuilder(ApacheHttpClient.builder())
                .build();
    }

    public String uploadFile(MultipartFile file) throws IOException {
        String uniqueFileName = UUID.randomUUID().toString() + (file.getOriginalFilename().contains(".")
                ? file.getOriginalFilename().substring(file.getOriginalFilename().lastIndexOf("."))
                : ".pdf");

        // Construct the direct Supabase REST API URL
        String uploadUrl = "https://" + projectRef + ".supabase.co/storage/v1/object/" + bucketName + "/" + uniqueFileName;

        // Use Java's native HttpClient to send the file
        java.net.http.HttpClient client = java.net.http.HttpClient.newHttpClient();

        java.net.http.HttpRequest request = java.net.http.HttpRequest.newBuilder()
                .uri(URI.create(uploadUrl))
                .header("Authorization", "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InNtd2JsdWNkZXJmbnNnbWd6ZW53Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3Nzg1OTM0MzIsImV4cCI6MjA5NDE2OTQzMn0.Ioq4zTPt3iZstMc3Cd5n6HIj8LEWjpMqZn0FsoRM5PM") // IMPORTANT: Use your project's anon key
                .header("Content-Type", file.getContentType())
                .POST(java.net.http.HttpRequest.BodyPublishers.ofByteArray(file.getBytes()))
                .build();

        try {
            client.send(request, java.net.http.HttpResponse.BodyHandlers.ofString());
            return "https://" + projectRef + ".supabase.co/storage/v1/object/public/" + bucketName + "/" + uniqueFileName;
        } catch (InterruptedException e) {
            throw new IOException("Upload interrupted", e);
        }
    }
}