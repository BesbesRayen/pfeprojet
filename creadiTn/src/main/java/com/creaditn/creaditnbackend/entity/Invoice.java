package com.creaditn.creaditnbackend.entity;

import jakarta.persistence.*;
import lombok.*;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Entity
@Table(name = "invoices")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Invoice {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, unique = true, length = 70)
    private String invoiceNumber;

    @Column(nullable = false, unique = true, length = 70)
    private String transactionId;

    @OneToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "order_id", nullable = false, unique = true)
    private PurchaseOrder order;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    @Column(nullable = false, length = 180)
    private String clientName;

    @Column(nullable = false, length = 180)
    private String clientEmail;

    @Column(length = 40)
    private String clientPhone;

    @Column(nullable = false, length = 180)
    private String articleName;

    @Column(nullable = false, length = 180)
    private String boutiqueName;

    @Column(nullable = false, precision = 12, scale = 2)
    private BigDecimal totalPrice;

    @Column(nullable = false, length = 20)
    private String paymentType;

    @Column(nullable = false)
    private Integer numberOfInstallments;

    @Column(nullable = false)
    private LocalDateTime purchaseDate;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 20)
    private InvoiceStatus status;

    @Column(nullable = false, length = 800)
    private String statement;

    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;

    @PrePersist
    protected void onCreate() {
        createdAt = LocalDateTime.now();
        updatedAt = LocalDateTime.now();
        if (status == null) {
            status = InvoiceStatus.ISSUED;
        }
        if (statement == null || statement.isBlank()) {
            statement = "The application paid the boutique; the client must reimburse the application.";
        }
    }

    @PreUpdate
    protected void onUpdate() {
        updatedAt = LocalDateTime.now();
    }
}
