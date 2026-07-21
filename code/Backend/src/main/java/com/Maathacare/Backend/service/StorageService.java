package com.Maathacare.Backend.service;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.net.URI;
import java.net.http.HttpClient;
import java.net.http.HttpRequest;
import java.net.http.HttpResponse;
import java.util.UUID;

@Service
public class StorageService {

    private final String bucketName;
    private final String avatarsBucketName;
    private final String projectRef;
    private final String anonKey; //

    public StorageService(
            @Value("${supabase.s3.endpoint}") String endpoint,
            @Value("${supabase.s3.bucket}") String bucketName,
            @Value("${supabase.avatars.bucket:avatars}") String avatarsBucketName,
            @Value("${supabase.s3.anon-key}") String anonKey) { // Ensure this is in application.properties

        this.bucketName = bucketName;
        this.avatarsBucketName = avatarsBucketName;
        this.anonKey = anonKey; //
        this.projectRef = endpoint.replace("https://", "").split("\\.")[0];
    }

    /**
     * Stores one stable avatar object per role and user. Replacing the same object
     * avoids leaving old profile photos in Storage whenever a user changes theirs.
     */
    public String uploadAvatar(MultipartFile file, String role, String userId) throws IOException {
        if (file.isEmpty()) {
            throw new IllegalArgumentException("Please select an image to upload.");
        }

        String contentType = file.getContentType();
        if (contentType == null || !contentType.startsWith("image/")) {
            throw new IllegalArgumentException("Profile photo must be an image.");
        }

        String extension = switch (contentType) {
            case "image/png" -> ".png";
            case "image/webp" -> ".webp";
            default -> ".jpg";
        };
        String safeUserId = userId.replaceAll("[^A-Za-z0-9_-]", "_");
        String objectPath = role + "/" + safeUserId + extension;
        String uploadUrl = "https://" + projectRef + ".supabase.co/storage/v1/object/"
                + avatarsBucketName + "/" + objectPath;

        HttpRequest request = HttpRequest.newBuilder()
                .uri(URI.create(uploadUrl))
                .header("Authorization", "Bearer " + anonKey)
                .header("apikey", anonKey)
                .header("x-upsert", "true")
                .header("Content-Type", contentType)
                .POST(HttpRequest.BodyPublishers.ofByteArray(file.getBytes()))
                .build();

        try {
            HttpResponse<String> response = HttpClient.newHttpClient()
                    .send(request, HttpResponse.BodyHandlers.ofString());
            if (response.statusCode() < 200 || response.statusCode() >= 300) {
                throw new IOException("Avatar upload failed with status: " + response.statusCode());
            }
        } catch (InterruptedException e) {
            Thread.currentThread().interrupt();
            throw new IOException("Avatar upload interrupted", e);
        }

        return "https://" + projectRef + ".supabase.co/storage/v1/object/public/"
                + avatarsBucketName + "/" + objectPath;
    }

    public String uploadFile(MultipartFile file) throws IOException {
        String originalFilename = file.getOriginalFilename();
        String extension = (originalFilename != null && originalFilename.contains("."))
                ? originalFilename.substring(originalFilename.lastIndexOf("."))
                : ".pdf";

        String uniqueFileName = UUID.randomUUID().toString() + extension;
        String uploadUrl = "https://" + projectRef + ".supabase.co/storage/v1/object/" + bucketName + "/" + uniqueFileName;

        HttpClient client = HttpClient.newHttpClient();

        HttpRequest request = HttpRequest.newBuilder()
                .uri(URI.create(uploadUrl))
                .header("Authorization", "Bearer " + anonKey)
                .header("apikey", anonKey)
                .header("x-upsert", "true")
                .header("Content-Type", file.getContentType() != null ? file.getContentType() : "application/pdf")
                .POST(HttpRequest.BodyPublishers.ofByteArray(file.getBytes()))
                .build();

        try {
            HttpResponse<String> response = client.send(request, HttpResponse.BodyHandlers.ofString());

            if (response.statusCode() >= 200 && response.statusCode() < 300) {
                return "https://" + projectRef + ".supabase.co/storage/v1/object/public/" + bucketName + "/" + uniqueFileName;
            } else {
                System.err.println("Supabase Error: " + response.statusCode() + " " + response.body());
                throw new IOException("Upload failed with status: " + response.statusCode());
            }
        } catch (InterruptedException e) {
            Thread.currentThread().interrupt();
            throw new IOException("Upload interrupted", e);
        }
    }
    public void deleteFile(String fileName) throws IOException {
        // Extract the filename from the URL (the part after the last '/')
        String fileKey = fileName.substring(fileName.lastIndexOf("/") + 1);
        String deleteUrl = "https://" + projectRef + ".supabase.co/storage/v1/object/" + bucketName + "/" + fileKey;

        HttpClient client = HttpClient.newHttpClient();
        HttpRequest request = HttpRequest.newBuilder()
                .uri(URI.create(deleteUrl))
                .header("Authorization", "Bearer " + anonKey)
                .header("apikey", anonKey)
                .DELETE() // Supabase uses DELETE method for removal
                .build();

        try {
            HttpResponse<String> response = client.send(request, HttpResponse.BodyHandlers.ofString());
            if (response.statusCode() != 200) {
                throw new IOException("Failed to delete file from storage: " + response.statusCode());
            }
        } catch (InterruptedException e) {
            Thread.currentThread().interrupt();
            throw new IOException("Delete operation interrupted", e);
        }
    }
}
