package com.example.helpdesk.dto;

import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;

public record AssignTicketRequest(
        @NotNull(message = "agentId must not be null")
        @Positive(message = "agentId must be positive")
        Long agentId
) {
}
