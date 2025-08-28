package com.edusis.dto;

import com.edusis.enums.Role;

public record LoginResponse(
        String message,
        String username,
        String fullName,
        Role role,
        String dashboardUrl
) {}
