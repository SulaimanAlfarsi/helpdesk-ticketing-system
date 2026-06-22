package com.example.helpdesk.dto;

import com.example.helpdesk.enums.Priority;
import com.example.helpdesk.enums.TicketStatus;

import java.time.LocalDateTime;
import java.util.List;

public record TicketResponse(
        Long id,
        String title,
        String description,
        Priority priority,
        String category,
        TicketStatus status,
        UserResponse raisedByUser,
        AgentResponse assignedAgent,
        Long slaPolicyId,
        LocalDateTime createdAt,
        LocalDateTime updatedAt,
        LocalDateTime slaDueAt,
        LocalDateTime resolvedAt,
        LocalDateTime closedAt,
        List<CommentResponse> comments,
        List<TicketStatusHistoryResponse> statusHistory
) {
}
