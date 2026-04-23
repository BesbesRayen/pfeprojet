package com.creaditn.creaditnbackend.controller;

import com.creaditn.creaditnbackend.dto.KycDocumentDto;
import com.creaditn.creaditnbackend.dto.KycVerificationResultDto;
import com.creaditn.creaditnbackend.service.KycService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;

@RestController
@RequestMapping("/api/kyc")
@RequiredArgsConstructor
public class KycController {

    private final KycService kycService;

    @PostMapping("/upload")
    public ResponseEntity<KycDocumentDto> uploadDocument(
            @RequestParam Long userId,
            @RequestParam String cinNumber,
            @RequestParam String cinFrontUrl,
            @RequestParam String cinBackUrl,
            @RequestParam String selfieUrl) {
        return ResponseEntity.ok(kycService.submitKycDocuments(userId, cinNumber, cinFrontUrl, cinBackUrl, selfieUrl));
    }

    @PostMapping(value = "/upload-multipart", consumes = "multipart/form-data")
    public ResponseEntity<KycDocumentDto> uploadMultipart(
            @RequestParam Long userId,
            @RequestParam String cinNumber,
            @RequestParam("cinFront") MultipartFile cinFront,
            @RequestParam("cinBack") MultipartFile cinBack,
            @RequestParam(value = "selfie", required = false) MultipartFile selfie) throws IOException {
        return ResponseEntity.ok(kycService.uploadMultipart(userId, cinNumber, cinFront, cinBack, selfie));
    }

    /**
     * Upload documents + run AI verification via Didit.
     * Accepts all KYC form data + images in a single multipart request.
     */
    @PostMapping(value = "/verify", consumes = "multipart/form-data")
    public ResponseEntity<KycVerificationResultDto> uploadAndVerify(
            @RequestParam Long userId,
            @RequestParam(required = false, defaultValue = "") String cinNumber,
            @RequestParam("cinFront") MultipartFile cinFront,
            @RequestParam("cinBack") MultipartFile cinBack,
            @RequestParam(value = "selfie", required = false) MultipartFile selfie,
            @RequestParam(required = false) String maritalStatus,
            @RequestParam(required = false) Integer numberOfChildren,
            @RequestParam(required = false) Double monthlySalary,
            @RequestParam(required = false) Boolean usIndicator) throws IOException {
        return ResponseEntity.ok(kycService.uploadAndVerify(
                userId, cinNumber, cinFront, cinBack, selfie,
                maritalStatus, numberOfChildren, monthlySalary, usIndicator
        ));
    }

    @GetMapping("/status")
    public ResponseEntity<KycDocumentDto> getKycStatus(@RequestParam Long userId) {
        return kycService.getLatestKycOptional(userId)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }
}
