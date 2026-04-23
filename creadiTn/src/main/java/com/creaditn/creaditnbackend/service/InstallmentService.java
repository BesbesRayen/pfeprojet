package com.creaditn.creaditnbackend.service;

import com.creaditn.creaditnbackend.dto.InstallmentDto;
import com.creaditn.creaditnbackend.entity.*;
import com.creaditn.creaditnbackend.exception.ResourceNotFoundException;
import com.creaditn.creaditnbackend.repository.FinancialProfileRepository;
import com.creaditn.creaditnbackend.repository.InstallmentRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Service
@RequiredArgsConstructor
public class InstallmentService {

    private final InstallmentRepository installmentRepository;
    private final FinancialProfileRepository financialProfileRepository;

    public void generateInstallments(CreditRequest creditRequest) {
        int count = creditRequest.getNumberOfInstallments();
        BigDecimal monthly = creditRequest.getMonthlyAmount();
        Integer salaryDay = financialProfileRepository.findByUserId(creditRequest.getUser().getId())
                .map(FinancialProfile::getSalaryDay)
                .orElse(25);

        LocalDate firstDueDate = calculateFirstDueDate(salaryDay);

        List<Installment> installments = new ArrayList<>();
        for (int i = 1; i <= count; i++) {
            Installment installment = Installment.builder()
                    .creditRequest(creditRequest)
                    .dueDate(firstDueDate.plusMonths(i - 1L))
                    .amount(monthly)
                    .status(InstallmentStatus.PENDING)
                    .penalty(BigDecimal.ZERO)
                    .build();
            installments.add(installment);
        }
        installmentRepository.saveAll(installments);
    }

    public List<InstallmentDto> getInstallmentsForCredit(Long creditRequestId) {
        return installmentRepository.findByCreditRequestId(creditRequestId)
                .stream().map(this::mapToDto).toList();
    }

    public List<InstallmentDto> getAllInstallments() {
        return installmentRepository.findAll()
                .stream().map(this::mapToDto).toList();
    }

    public List<InstallmentDto> getUserInstallments(Long userId) {
        return installmentRepository.findByCreditRequestUserId(userId)
                .stream().map(this::mapToDto).toList();
    }

    public List<InstallmentDto> getUserPendingInstallments(Long userId) {
        return installmentRepository.findByCreditRequestUserIdAndStatus(userId, InstallmentStatus.PENDING)
                .stream().map(this::mapToDto).toList();
    }

    public Installment getInstallmentEntity(Long id) {
        return installmentRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Installment not found with id: " + id));
    }

    public void markAsPaid(Long installmentId) {
        Installment installment = getInstallmentEntity(installmentId);
        installment.setStatus(InstallmentStatus.PAID);
        installment.setPaidDate(LocalDateTime.now());
        installmentRepository.save(installment);
    }

    public List<Installment> getUserUnpaidInstallments(Long userId) {
        List<Installment> pending = installmentRepository
                .findByCreditRequestUserIdAndStatus(userId, InstallmentStatus.PENDING);
        List<Installment> overdue = installmentRepository
                .findByCreditRequestUserIdAndStatus(userId, InstallmentStatus.OVERDUE);

        List<Installment> unpaid = new ArrayList<>(pending.size() + overdue.size());
        unpaid.addAll(pending);
        unpaid.addAll(overdue);
        return unpaid;
    }

    @Transactional
    public int markAllAsPaid(List<Installment> installments) {
        if (installments.isEmpty()) {
            return 0;
        }

        LocalDateTime paidAt = LocalDateTime.now();
        for (Installment installment : installments) {
            installment.setStatus(InstallmentStatus.PAID);
            installment.setPaidDate(paidAt);
        }

        installmentRepository.saveAll(installments);
        return installments.size();
    }

    public void markOverdueInstallments() {
        List<Installment> overdue = installmentRepository
                .findByStatusAndDueDateBefore(InstallmentStatus.PENDING, LocalDate.now());

        for (Installment inst : overdue) {
            inst.setStatus(InstallmentStatus.OVERDUE);
            inst.setPenalty(inst.getAmount().multiply(BigDecimal.valueOf(0.05)));
        }
        installmentRepository.saveAll(overdue);
    }

    private LocalDate calculateFirstDueDate(Integer salaryDay) {
        LocalDate now = LocalDate.now();
        int dueDay = Math.min(salaryDay + 2, now.lengthOfMonth());
        LocalDate dueThisMonth = now.withDayOfMonth(dueDay);

        if (dueThisMonth.isAfter(now)) {
            return dueThisMonth;
        }

        LocalDate nextMonth = now.plusMonths(1);
        int nextMonthDueDay = Math.min(salaryDay + 2, nextMonth.lengthOfMonth());
        return nextMonth.withDayOfMonth(nextMonthDueDay);
    }

    private InstallmentDto mapToDto(Installment i) {
        CreditRequest cr = i.getCreditRequest();
        BigDecimal penalty = i.getPenalty() != null ? i.getPenalty() : BigDecimal.ZERO;
        BigDecimal remainingAmount = i.getStatus() == InstallmentStatus.PAID
            ? BigDecimal.ZERO
            : i.getAmount().add(penalty);

        return InstallmentDto.builder()
                .id(i.getId())
                .creditRequestId(cr.getId())
                .productName(cr.getProductName())
                .totalAmount(cr.getTotalAmount())
                .dueDate(i.getDueDate())
                .amount(i.getAmount())
            .remainingAmount(remainingAmount)
                .status(i.getStatus())
                .paidDate(i.getPaidDate())
            .penalty(penalty)
                .build();
    }
}
