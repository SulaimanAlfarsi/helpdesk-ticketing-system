package com.example.helpdesk.dto;

public record AverageResolutionTimeResponse(
        Long agentId,
        String category,
        Double averageResolutionHours,
        Double averageResolutionSeconds
) {
}
