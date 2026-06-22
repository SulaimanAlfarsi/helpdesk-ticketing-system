package com.example.helpdesk.dto;

import com.example.helpdesk.enums.ChangedByType;
import com.example.helpdesk.enums.TicketStatus;
import jakarta.validation.constraints.NotNull;

public record UpdateTicketStatusRequest(
        @NotNull TicketStatus newStatus,
        @NotNull ChangedByType changedByType,
        Long changedById
) {
}
