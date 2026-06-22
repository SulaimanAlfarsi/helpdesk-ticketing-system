package com.example.helpdesk.dto;

import com.example.helpdesk.enums.AuthorType;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

public record AddCommentRequest(
        @NotNull AuthorType authorType,
        @NotNull Long authorId,
        @NotBlank String message
) {
}
