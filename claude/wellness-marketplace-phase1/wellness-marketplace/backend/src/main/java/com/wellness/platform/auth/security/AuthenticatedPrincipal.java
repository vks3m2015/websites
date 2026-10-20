package com.wellness.platform.auth.security;

import java.util.UUID;

/**
 * Lightweight principal placed into the SecurityContext after JWT validation.
 * Controllers/services derive the acting user's id from THIS, never from client-supplied
 * request parameters, to prevent ID/role spoofing.
 */
public record AuthenticatedPrincipal(UUID userId, String subject) {
}
