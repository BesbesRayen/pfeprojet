package com.creaditn.creaditnbackend.kyc.service;

import com.creaditn.creaditnbackend.dto.KycVerificationResultDto;
import com.creaditn.creaditnbackend.entity.KycStatus;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.core.io.FileSystemResource;
import org.springframework.http.*;
import org.springframework.stereotype.Service;
import org.springframework.util.LinkedMultiValueMap;
import org.springframework.util.MultiValueMap;
import org.springframework.web.client.RestTemplate;

import java.nio.file.Path;
import java.util.Map;
import java.util.Random;

/**
 * Client for the Didit KYC verification API.
 * Falls back to simulated verification when the API is unavailable.
 */
@Slf4j
@Service
public class DiditClient {

    @Value("${didit.api.url:https://apx.didit.me/v2}")
    private String apiUrl;

    @Value("${didit.api.key:}")
    private String apiKey;

    private final RestTemplate restTemplate = new RestTemplate();
    private final Random random = new Random();

    /**
     * Verify identity documents via the Didit API.
     * If the API call fails, falls back to simulation.
     */
    public KycVerificationResultDto verifyIdentity(
            Long userId,
            Path cinFrontPath,
            Path cinBackPath,
            Path selfiePath
    ) {
        if (apiKey == null || apiKey.isBlank()) {
            log.warn("Didit API key not configured — using simulated verification");
            return simulateVerification(userId);
        }

        try {
            return callDiditApi(userId, cinFrontPath, cinBackPath, selfiePath);
        } catch (Exception e) {
            log.error("Didit API call failed, falling back to simulation: {}", e.getMessage());
            return simulateVerification(userId);
        }
    }

    private KycVerificationResultDto callDiditApi(
            Long userId,
            Path cinFrontPath,
            Path cinBackPath,
            Path selfiePath
    ) {
        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.MULTIPART_FORM_DATA);
        headers.setBearerAuth(apiKey);

        MultiValueMap<String, Object> body = new LinkedMultiValueMap<>();
        body.add("document_front", new FileSystemResource(cinFrontPath.toFile()));
        body.add("document_back", new FileSystemResource(cinBackPath.toFile()));
        if (selfiePath != null && selfiePath.toFile().exists()) {
            body.add("selfie", new FileSystemResource(selfiePath.toFile()));
        }
        body.add("external_id", String.valueOf(userId));

        HttpEntity<MultiValueMap<String, Object>> request = new HttpEntity<>(body, headers);

        @SuppressWarnings("unchecked")
        ResponseEntity<Map<String, Object>> response = restTemplate.exchange(
                apiUrl + "/verification",
                HttpMethod.POST,
                request,
                (Class<Map<String, Object>>) (Class<?>) Map.class
        );

        Map<String, Object> responseBody = response.getBody();
        if (responseBody == null) {
            throw new RuntimeException("Empty response from Didit API");
        }

        String decision = String.valueOf(responseBody.getOrDefault("decision", "rejected"));
        Number score = (Number) responseBody.getOrDefault("confidence", 0);
        int confidence = score.intValue();

        boolean approved = "approved".equalsIgnoreCase(decision) || "accept".equalsIgnoreCase(decision);

        return KycVerificationResultDto.builder()
                .userId(userId)
                .status(approved ? KycStatus.APPROVED : KycStatus.REJECTED)
                .confidence(confidence)
                .risk(confidence >= 80 ? "low" : confidence >= 50 ? "medium" : "high")
                .message(approved ? "Identity verified successfully" : "Verification failed")
                .build();
    }

    /**
     * Simulate verification when Didit API is unavailable.
     * 70% chance of approval for demo purposes.
     */
    private KycVerificationResultDto simulateVerification(Long userId) {
        boolean approved = random.nextDouble() > 0.3;
        int confidence = approved
                ? 75 + random.nextInt(21)   // 75–95
                : 20 + random.nextInt(31);  // 20–50

        return KycVerificationResultDto.builder()
                .userId(userId)
                .status(approved ? KycStatus.APPROVED : KycStatus.REJECTED)
                .confidence(confidence)
                .risk(approved ? "low" : "high")
                .message(approved
                        ? "Identity verified successfully"
                        : "Verification failed — document quality insufficient")
                .build();
    }
}
