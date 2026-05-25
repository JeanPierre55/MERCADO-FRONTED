/**
 * JWT utility functions for the POS MERCATO auth system.
 *
 * These utilities decode and inspect JWT tokens client-side WITHOUT
 * verifying the signature — signature verification is the backend's
 * responsibility. They are used to check token expiry before making
 * requests and to restore sessions from sessionStorage.
 *
 * Requirements: 3.7, 8.3
 */

/**
 * Decodes the payload section of a JWT token (the second Base64-encoded
 * segment) and returns it as a plain object.
 *
 * Returns `null` if the token is malformed, the payload cannot be
 * Base64-decoded, or the decoded string is not valid JSON.
 * Never throws.
 */
export function decodeJwtPayload(token: string): Record<string, unknown> | null {
  try {
    const parts = token.split('.')
    if (parts.length !== 3) {
      return null
    }

    const payloadBase64 = parts[1]

    // Normalize Base64url → Base64 (replace URL-safe chars and add padding)
    const base64 = payloadBase64
      .replace(/-/g, '+')
      .replace(/_/g, '/')
      .padEnd(payloadBase64.length + ((4 - (payloadBase64.length % 4)) % 4), '=')

    const jsonString = atob(base64)
    const parsed = JSON.parse(jsonString)

    if (typeof parsed !== 'object' || parsed === null || Array.isArray(parsed)) {
      return null
    }

    return parsed as Record<string, unknown>
  } catch {
    return null
  }
}

/**
 * Returns `true` if the JWT token is expired or cannot be validated.
 *
 * Reads the `exp` claim from the decoded payload and compares
 * `exp * 1000` (milliseconds) against `Date.now()`.
 *
 * Treats the token as expired (returns `true`) when:
 * - The token is malformed and cannot be decoded
 * - The payload does not contain an `exp` field
 * - `exp` is not a number
 * - The current time is at or past the expiry time
 *
 * This fail-safe default prevents stale sessions from being restored.
 */
export function isJwtExpired(token: string): boolean {
  const payload = decodeJwtPayload(token)

  if (payload === null) {
    return true
  }

  const exp = payload['exp']

  if (typeof exp !== 'number') {
    return true
  }

  return Date.now() >= exp * 1000
}
