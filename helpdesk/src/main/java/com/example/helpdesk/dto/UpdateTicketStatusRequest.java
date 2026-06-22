package com.example.helpdesk.dto;

import com.example.helpdesk.enums.ChangedByType;
import com.example.helpdesk.enums.TicketStatus;
import jakarta.validation.constraints.AssertTrue;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;

public record UpdateTicketStatusRequest(
        @NotNull(message = "newStatus must not be null")
        TicketStatus newStatus,

        @NotNull(message = "changedByType must not be null")
        ChangedByType changedByType,

        @Positive(message = "changedById must be positive")
        Long changedById
) {
    @AssertTrue(message = "changedById is required when changedByType is USER or AGENT")
    public boolean isChangedByIdValid() {
        return changedByType == null || changedByType == ChangedByType.SYSTEM || changedById != null;
    }
}
