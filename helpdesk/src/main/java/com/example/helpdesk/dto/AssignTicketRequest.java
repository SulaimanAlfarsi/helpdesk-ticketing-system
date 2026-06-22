package com.example.helpdesk.dto;

import jakarta.validation.constraints.NotNull;

public record AssignTicketRequest(
        @NotNull Long agentId
) {
}
