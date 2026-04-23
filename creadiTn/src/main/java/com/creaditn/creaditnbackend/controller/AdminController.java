package com.creaditn.creaditnbackend.controller;

import com.creaditn.creaditnbackend.dto.*;
import com.creaditn.creaditnbackend.repository.*;
import com.creaditn.creaditnbackend.service.CreditService;
import com.creaditn.creaditnbackend.service.InstallmentService;
import com.creaditn.creaditnbackend.service.KycService;
import com.creaditn.creaditnbackend.service.UserService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/admin")
@RequiredArgsConstructor
public class AdminController {

    private final UserService userService;
    private final KycService kycService;
    private final CreditService creditService;
    private final InstallmentService installmentService;
    private final UserRepository userRepository;
    private final CreditRequestRepository creditRequestRepository;
    private final InstallmentRepository installmentRepository;
    private final KycDocumentRepository kycDocumentRepository;

    // ---- Admin Auth ----
    @PostMapping("/login")
    public ResponseEntity<?> adminLogin(@RequestBody Map<String, String> credentials) {
        String email = credentials.get("email");
        String password = credentials.get("password");

        if ("admin@bnpl.com".equals(email) && "admin123".equals(password)) {
            Map<String, Object> response = new HashMap<>();
            response.put("token", "admin-session-" + System.currentTimeMillis());
            response.put("email", email);
            response.put("role", "ADMIN");
            response.put("name", "Admin CreadiTN");
            return ResponseEntity.ok(response);
        }

        return ResponseEntity.status(401).body(Map.of("message", "Identifiants invalides"));
    }

    // ---- Dashboard Stats ----
    @GetMapping("/stats")
    public ResponseEntity<Map<String, Object>> getDashboardStats() {
        Map<String, Object> stats = new HashMap<>();
        stats.put("totalUsers", userRepository.count());
        stats.put("totalCredits", creditRequestRepository.count());
        stats.put("totalInstallments", installmentRepository.count());
        stats.put("pendingKyc", kycDocumentRepository.countByStatus(com.creaditn.creaditnbackend.entity.KycStatus.PENDING));
        stats.put("approvedKyc", kycDocumentRepository.countByStatus(com.creaditn.creaditnbackend.entity.KycStatus.APPROVED));
        stats.put("pendingCredits", creditRequestRepository.countByStatus(com.creaditn.creaditnbackend.entity.CreditRequestStatus.PENDING));
        stats.put("approvedCredits", creditRequestRepository.countByStatus(com.creaditn.creaditnbackend.entity.CreditRequestStatus.APPROVED));
        stats.put("rejectedCredits", creditRequestRepository.countByStatus(com.creaditn.creaditnbackend.entity.CreditRequestStatus.REJECTED));
        return ResponseEntity.ok(stats);
    }

    // ---- All Credits ----
    @GetMapping("/credits")
    public ResponseEntity<List<CreditRequestResponse>> getAllCredits() {
        return ResponseEntity.ok(creditService.getAllRequests());
    }

    // ---- All Installments ----
    @GetMapping("/installments")
    public ResponseEntity<List<InstallmentDto>> getAllInstallments() {
        return ResponseEntity.ok(installmentService.getAllInstallments());
    }

    // ---- Users ----
    @GetMapping("/users")
    public ResponseEntity<List<UserDto>> getAllUsers() {
        return ResponseEntity.ok(userService.getAllUsers());
    }

    // ---- KYC ----
    @GetMapping("/kyc/pending")
    public ResponseEntity<List<KycDocumentDto>> getPendingKyc() {
        return ResponseEntity.ok(kycService.getPendingDocuments());
    }

    @PutMapping("/kyc/{id}/approve")
    public ResponseEntity<KycDocumentDto> approveKyc(@PathVariable Long id,
                                                      @RequestParam(required = false) String comment) {
        return ResponseEntity.ok(kycService.approveKyc(id, comment));
    }

    @PutMapping("/kyc/{id}/reject")
    public ResponseEntity<KycDocumentDto> rejectKyc(@PathVariable Long id,
                                                     @RequestParam String comment) {
        return ResponseEntity.ok(kycService.rejectKyc(id, comment));
    }

    // ---- Credits ----
    @GetMapping("/credits/pending")
    public ResponseEntity<List<CreditRequestResponse>> getPendingCredits() {
        return ResponseEntity.ok(creditService.getPendingRequests());
    }

    @PutMapping("/credits/{id}/approve")
    public ResponseEntity<CreditRequestResponse> approveCredit(@PathVariable Long id) {
        return ResponseEntity.ok(creditService.approveCreditRequest(id));
    }

    @PutMapping("/credits/{id}/reject")
    public ResponseEntity<CreditRequestResponse> rejectCredit(@PathVariable Long id) {
        return ResponseEntity.ok(creditService.rejectCreditRequest(id));
    }
}
