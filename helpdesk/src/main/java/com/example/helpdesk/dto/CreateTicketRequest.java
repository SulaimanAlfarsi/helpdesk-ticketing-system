package com.example.helpdesk.dto;

import com.example.helpdesk.enums.Priority;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Positive;
import jakarta.validation.constraints.Size;

public record CreateTicketRequest(
        @NotBlank(message = "title must not be blank")
        @Size(max = 200, message = "title must be at most 200 characters")
        String title,

        @NotBlank(message = "description must not be blank")
        String description,

        @NotNull(message = "priority must not be null")
        Priority priority,

        @NotBlank(message = "category must not be blank")
        @Pattern(regexp = "^(Network|Hardware|Software|Account|Other)$",
                 message = "category must be one of: Network, Hardware, Software, Account, Other")
        String category,

        @NotNull(message = "raisedByUserId must not be null")
        @Positive(message = "raisedByUserId must be positive")
        Long raisedByUserId
) {
}
