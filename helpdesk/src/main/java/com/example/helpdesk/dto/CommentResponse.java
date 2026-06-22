package com.example.helpdesk.dto;

import com.example.helpdesk.enums.AuthorType;

import java.time.LocalDateTime;

public record CommentResponse(
        Long id,
        AuthorType authorType,
        Long authorId,
        String message,
        LocalDateTime createdAt
) {
}
