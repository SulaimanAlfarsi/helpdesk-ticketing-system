package com.example.helpdesk.dto;

import com.example.helpdesk.enums.ChangedByType;
import com.example.helpdesk.enums.TicketStatus;

import java.time.LocalDateTime;

public record TicketStatusHistoryResponse(
        Long id,
        TicketStatus fromStatus,
        TicketStatus toStatus,
        ChangedByType changedByType,
        Long changedById,
        LocalDateTime changedAt
) {
}
