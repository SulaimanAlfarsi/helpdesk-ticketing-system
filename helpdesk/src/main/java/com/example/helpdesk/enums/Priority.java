package com.example.helpdesk.enums;

import com.fasterxml.jackson.annotation.JsonCreator;

public enum Priority {
    LOW,
    MEDIUM,
    HIGH,
    CRITICAL;

    @JsonCreator
    public static Priority fromValue(String value) {
        if (value == null) return null;
        return Priority.valueOf(value.toUpperCase());
    }
}
