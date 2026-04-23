package com.creaditn.creaditnbackend.dto;

import com.creaditn.creaditnbackend.entity.KycStatus;
import lombok.*;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class KycVerificationResultDto {
    private Long documentId;
    private Long userId;
    private KycStatus status;
    private int confidence;
    private String risk;
    private String message;
}
