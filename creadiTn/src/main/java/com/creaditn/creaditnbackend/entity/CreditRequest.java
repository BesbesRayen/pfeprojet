package com.creaditn.creaditnbackend.entity;

import jakarta.persistence.*;
import lombok.*;
import java.math.BigDecimal;
import java.time.LocalDateTime;

@Entity
@Table(name = "credit_requests")
@Getter @Setter
@NoArgsConstructor @AllArgsConstructor
@Builder
public class CreditRequest {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    @Column(nullable = false)
    private BigDecimal totalAmount;

    @Column(nullable = false)
    private BigDecimal downPayment;

    @Column(nullable = false)
    private Integer numberOfInstallments;

    @Column(nullable = false)
    private BigDecimal monthlyAmount;

    private String productName;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private CreditRequestStatus status;

    private LocalDateTime createdAt;

    @PrePersist
    protected void onCreate() {
        createdAt = LocalDateTime.now();
        if (status == null) status = CreditRequestStatus.PENDING;
    }
}
