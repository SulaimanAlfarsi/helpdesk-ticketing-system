package com.example.helpdesk.dto;

import com.example.helpdesk.enums.AuthorType;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;

public record AddCommentRequest(
        @NotNull(message = "authorType must not be null")
        AuthorType authorType,

        @NotNull(message = "authorId must not be null")
        @Positive(message = "authorId must be positive")
        Long authorId,

        @NotBlank(message = "message must not be blank")
        String message
) {
}
