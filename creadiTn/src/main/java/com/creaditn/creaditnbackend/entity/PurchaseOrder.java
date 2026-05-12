package com.creaditn.creaditnbackend.entity;

import jakarta.persistence.*;
import lombok.*;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Entity
@Table(name = "purchase_orders")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class PurchaseOrder {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, unique = true, length = 70)
    private String transactionId;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "article_id", nullable = false)
    private Article article;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "credit_request_id")
    private CreditRequest creditRequest;

    @Column(nullable = false, length = 160)
    private String articleName;

    @Column(nullable = false, length = 160)
    private String boutiqueName;

    @Column(nullable = false, length = 100)
    private String category;

    @Column(nullable = false, precision = 12, scale = 2)
    private BigDecimal totalPrice;

    @Column(nullable = false, precision = 12, scale = 2)
    private BigDecimal downPayment;

    @Column(nullable = false, precision = 12, scale = 2)
    private BigDecimal financedAmount;

    @Column(precision = 12, scale = 2)
    private BigDecimal monthlyAmount;

    private Integer installmentMonths;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 20)
    private PurchasePaymentType paymentType;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 30)
    private PurchaseOrderStatus status;

    @Column(nullable = false)
    private Boolean merchantPaid;

    @Column(length = 120)
    private String merchantPayoutReference;

    private LocalDateTime merchantPaidAt;

    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;

    @PrePersist
    protected void onCreate() {
        createdAt = LocalDateTime.now();
        updatedAt = LocalDateTime.now();
        if (merchantPaid == null) {
            merchantPaid = false;
        }
    }

    @PreUpdate
    protected void onUpdate() {
        updatedAt = LocalDateTime.now();
    }
}
