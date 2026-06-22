package com.example.helpdesk.dto;

import java.time.LocalDateTime;

public record AgentResponse(
        Long id,
        String name,
        String email,
        boolean active,
        LocalDateTime createdAt
) {
}
