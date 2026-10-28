import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.*;
import org.springframework.stereotype.Service;
import org.springframework.util.LinkedMultiValueMap;
import org.springframework.util.MultiValueMap;
import org.springframework.web.client.RestTemplate;
import org.springframework.web.multipart.MultipartFile;

@Service
public class S3StorageService {

    @Value("${supabase.url}") // Add 'supabase.url' to application.properties
    private String supabaseUrl;

    @Value("${supabase.anon-key}") // Add 'supabase.anon-key' to application.properties
    private String anonKey;

    public String uploadProfilePicture(MultipartFile file, String userId) throws Exception {
        String fileName = "profile_" + userId + "_" + System.currentTimeMillis() + ".jpg";
        String uploadUrl = supabaseUrl + "/storage/v1/object/avatars/" + fileName;

        RestTemplate restTemplate = new RestTemplate();

        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.IMAGE_JPEG);
        headers.set("Authorization", "Bearer " + anonKey);
        headers.set("apikey", anonKey);

        HttpEntity<byte[]> requestEntity = new HttpEntity<>(file.getBytes(), headers);

        // Upload to Supabase Storage
        restTemplate.exchange(uploadUrl, HttpMethod.POST, requestEntity, String.class);

        // Return the public URL
        return supabaseUrl + "/storage/v1/object/public/avatars/" + fileName;
    }
}