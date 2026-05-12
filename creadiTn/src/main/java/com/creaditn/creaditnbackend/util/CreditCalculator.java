package com.creaditn.creaditnbackend.util;

import lombok.experimental.UtilityClass;
import java.math.BigDecimal;
import java.math.RoundingMode;

/**
 * Utility class for credit-related calculations
 */
@UtilityClass
public class CreditCalculator {

    public static final BigDecimal DOWN_PAYMENT_RATIO = BigDecimal.valueOf(0.20);

    /**
     * Calculate the monthly installment amount
     * @param totalAmount the total credit amount
     * @param downPayment the down payment amount
     * @param numberOfInstallments the number of installments
     * @return the monthly installment amount
     */
    public static BigDecimal calculateMonthlyAmount(
            BigDecimal totalAmount,
            BigDecimal downPayment,
            Integer numberOfInstallments) {
        BigDecimal remaining = totalAmount.subtract(downPayment);
        BigDecimal interestRate = getInterestRate(numberOfInstallments);
        BigDecimal totalWithInterest = remaining.multiply(BigDecimal.ONE.add(interestRate));

        return totalWithInterest.divide(
                BigDecimal.valueOf(numberOfInstallments),
                2,
                RoundingMode.HALF_UP
        );
    }

    public static BigDecimal getInterestRate(Integer numberOfInstallments) {
        return switch (numberOfInstallments) {
            case 3 -> BigDecimal.ZERO;
            case 6 -> BigDecimal.valueOf(0.03);
            case 9 -> BigDecimal.valueOf(0.06);
            case 12 -> BigDecimal.valueOf(0.12);
            default -> throw new IllegalArgumentException("Unsupported installment plan. Allowed values: 3, 6, 9, 12");
        };
    }

    public static BigDecimal requiredDownPayment(BigDecimal totalAmount) {
        return totalAmount.multiply(DOWN_PAYMENT_RATIO).setScale(2, RoundingMode.HALF_UP);
    }
}
