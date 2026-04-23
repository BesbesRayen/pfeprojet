package com.creaditn.creaditnbackend.service;

import com.creaditn.creaditnbackend.dto.*;
import com.creaditn.creaditnbackend.entity.User;
import com.creaditn.creaditnbackend.entity.UserWallet;
import com.creaditn.creaditnbackend.exception.BadRequestException;
import com.creaditn.creaditnbackend.repository.UserRepository;
import com.creaditn.creaditnbackend.repository.UserWalletRepository;
import com.creaditn.creaditnbackend.security.JwtUtil;
import lombok.RequiredArgsConstructor;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.security.SecureRandom;
import java.time.LocalDateTime;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;

@Service
@RequiredArgsConstructor
public class AuthService {

    private final UserRepository userRepository;
    private final UserWalletRepository userWalletRepository;
    private final CreadiScoreService creadiScoreService;
    private final JwtUtil jwtUtil;
    private final PasswordEncoder passwordEncoder;
    private final EmailService emailService;
    private final Map<String, ResetSession> resetSessions = new ConcurrentHashMap<>();
    private final SecureRandom secureRandom = new SecureRandom();

    private String normalizeEmail(String email) {
        return email == null ? "" : email.trim().toLowerCase();
    }

    private String normalizePhone(String phone) {
        return phone == null ? "" : phone.trim();
    }

    private String normalizeIdentifier(String identifier) {
        if (identifier == null) return "";
        String value = identifier.trim();
        return value.contains("@") ? normalizeEmail(value) : normalizePhone(value);
    }

    public AuthResponse register(RegisterRequest request) {
        String normalizedEmail = normalizeEmail(request.getEmail());
        if (normalizedEmail.isBlank()) {
            throw new BadRequestException("Email is required");
        }
        if (userRepository.existsByEmailIgnoreCase(normalizedEmail)) {
            throw new BadRequestException("Email already registered");
        }
        if (request.getPassword() == null || request.getPassword().length() < 8) {
            throw new BadRequestException("Password must be at least 8 characters");
        }

        User user = User.builder()
                .firstName(request.getFirstName())
                .lastName(request.getLastName())
                .email(normalizedEmail)
                .password(passwordEncoder.encode(request.getPassword()))
                .phone(request.getPhone())
                .address(request.getAddress())
                .profession(request.getProfession())
                .build();

        userRepository.save(user);

        // Create initial wallet with simulation balance
        userWalletRepository.save(UserWallet.builder()
                .userId(user.getId())
                .balance(new BigDecimal("2000.00"))
                .build());

        // Auto-calculate initial Creadi Score
        try { creadiScoreService.calculateScore(user.getId()); } catch (Exception ignored) {}

        // Send welcome email
        emailService.sendWelcome(user.getEmail(), user.getFirstName());

        String token = jwtUtil.generateToken(user.getId(), user.getEmail());
        return AuthResponse.builder()
                .userId(user.getId())
                .email(user.getEmail())
                .firstName(user.getFirstName())
                .lastName(user.getLastName())
                .message("Inscription rÃ©ussie â€” bienvenue sur CreadiTN !")
                .token(token)
                .build();
    }

    public AuthResponse login(AuthRequest request) {
        String normalizedEmail = normalizeEmail(request.getEmail());
        User user = userRepository.findByEmailIgnoreCase(normalizedEmail)
                .orElseThrow(() -> new BadRequestException("Email ou mot de passe incorrect"));

        boolean valid;
        if (user.getPassword().startsWith("$2a$") || user.getPassword().startsWith("$2b$")) {
            // BCrypt hash — use encoder
            valid = passwordEncoder.matches(request.getPassword(), user.getPassword());
        } else {
            // Legacy plaintext — compare directly then migrate
            valid = user.getPassword().equals(request.getPassword());
            if (valid) {
                // Migrate to BCrypt on successful login
                user.setPassword(passwordEncoder.encode(request.getPassword()));
                userRepository.save(user);
            }
        }

        if (!valid) {
            throw new BadRequestException("Email ou mot de passe incorrect");
        }

        String token = jwtUtil.generateToken(user.getId(), user.getEmail());
        return AuthResponse.builder()
                .userId(user.getId())
                .email(user.getEmail())
                .firstName(user.getFirstName())
                .lastName(user.getLastName())
                .message("Connexion rÃ©ussie")
                .token(token)
                .build();
    }

    public ApiResponse requestPasswordReset(ForgotPasswordRequest request) {
        String identifier = normalizeIdentifier(request.getIdentifier());
        if (identifier.isBlank()) {
            throw new BadRequestException("Email ou numÃ©ro de tÃ©lÃ©phone requis");
        }

        User user = findByIdentifier(identifier);
        String code = String.valueOf(100000 + secureRandom.nextInt(900000));
        resetSessions.put(identifier, new ResetSession(user.getId(), code, LocalDateTime.now().plusMinutes(10)));

        // Send OTP only via email â€” never return it in the API response
        if (identifier.contains("@")) {
            emailService.sendOtp(user.getEmail(), user.getFirstName(), code);
        }

        return ApiResponse.success("Un code de vÃ©rification a Ã©tÃ© envoyÃ© Ã  votre " +
                (identifier.contains("@") ? "email" : "numÃ©ro de tÃ©lÃ©phone") + ".");
    }

    public ApiResponse confirmPasswordReset(ForgotPasswordConfirmRequest request) {
        String identifier = normalizeIdentifier(request.getIdentifier());
        ResetSession session = resetSessions.get(identifier);
        if (session == null) {
            throw new BadRequestException("Aucune demande de rÃ©initialisation trouvÃ©e. Recommencez.");
        }
        if (LocalDateTime.now().isAfter(session.expiresAt())) {
            resetSessions.remove(identifier);
            throw new BadRequestException("Code expirÃ©. Veuillez demander un nouveau code.");
        }
        if (!session.code().equals(request.getCode().trim())) {
            throw new BadRequestException("Code de vÃ©rification incorrect.");
        }
        if (request.getNewPassword() == null || request.getNewPassword().length() < 8) {
            throw new BadRequestException("Le nouveau mot de passe doit contenir au moins 8 caractÃ¨res.");
        }

        User user = userRepository.findById(session.userId())
                .orElseThrow(() -> new BadRequestException("Utilisateur introuvable"));
        user.setPassword(passwordEncoder.encode(request.getNewPassword()));
        userRepository.save(user);
        resetSessions.remove(identifier);

        // Confirmation email
        emailService.sendPasswordChanged(user.getEmail(), user.getFirstName());

        return ApiResponse.success("Mot de passe rÃ©initialisÃ© avec succÃ¨s.");
    }

    private User findByIdentifier(String identifier) {
        if (identifier.contains("@")) {
            return userRepository.findByEmailIgnoreCase(identifier)
                    .orElseThrow(() -> new BadRequestException("Aucun compte trouvÃ© avec cet email."));
        }
        return userRepository.findByPhone(identifier)
                .orElseThrow(() -> new BadRequestException("Aucun compte trouvÃ© avec ce numÃ©ro."));
    }

    private record ResetSession(Long userId, String code, LocalDateTime expiresAt) {}

    public AuthResponse googleLogin(GoogleAuthRequest request) {
        if (request.getIdToken() == null || request.getIdToken().isBlank()) {
            throw new BadRequestException("Token Google invalide");
        }
        User user = userRepository.findAll().stream().findFirst()
                .orElseThrow(() -> new BadRequestException("Aucun utilisateur â€” inscrivez-vous d'abord"));
        String token = jwtUtil.generateToken(user.getId(), user.getEmail());
        return AuthResponse.builder()
                .userId(user.getId()).email(user.getEmail())
                .firstName(user.getFirstName()).lastName(user.getLastName())
                .message("Connexion Google (dÃ©mo)").token(token)
                .build();
    }
}

