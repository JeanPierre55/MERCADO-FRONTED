/**
 * Auth_Service — HTTP authentication module for POS MERCATO.
 *
 * Uses native browser `fetch` (not axios) so all requests are visible
 * in the browser's Network tab.
 *
 * Requirements: 2.1, 2.2, 2.3, 2.4, 2.5, 2.6, 7.1, 7.2, 7.4, 7.5, 7.6, 8.3
 */

import type { UserRole, AuthUser } from '../types/index'

// ---------------------------------------------------------------------------
// Public types
// ---------------------------------------------------------------------------

export interface LoginCredentials {
  username: string
  password: string
}

export interface LoginResponse {
  token: string
  role: UserRole
  user: AuthUser
}

export interface AuthServiceError {
  type: 'unauthorized' | 'forbidden' | 'timeout' | 'network' | 'unknown'
  message: string
  statusCode?: number
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function getBaseUrl(): string {
  // Requirements 7.4, 7.5 — read from env, fallback to localhost
  return import.meta.env.VITE_API_BASE_URL ?? 'http://localhost:8080'
}

function isAuthServiceError(value: unknown): value is AuthServiceError {
  return (
    typeof value === 'object' &&
    value !== null &&
    'type' in value &&
    'message' in value
  )
}

// ---------------------------------------------------------------------------
// loginRequest
// ---------------------------------------------------------------------------

/**
 * Sends a POST /api/auth/login request with the given credentials.
 *
 * - Uses native `fetch` so the call appears in the Network tab (Req 2.2).
 * - Applies a 10-second timeout via AbortController (Req 2.5).
 * - Serialises the body as JSON and sets Content-Type (Req 7.1, 7.6).
 *
 * @throws {AuthServiceError} on any non-200 response or network/timeout error.
 */
export async function loginRequest(
  credentials: LoginCredentials
): Promise<LoginResponse> {
  const baseUrl = getBaseUrl()
  const url = `${baseUrl}/api/auth/login`

  // Timeout — Requirements 2.5
  const controller = new AbortController()
  const timeoutId = setTimeout(() => controller.abort(), 10_000)

  try {
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json', // Requirement 7.1
      },
      body: JSON.stringify(credentials), // Requirement 7.6
      signal: controller.signal,
    })

    clearTimeout(timeoutId)

    // HTTP 401 — Requirement 2.4
    if (response.status === 401) {
      let backendMessage: string | undefined
      try {
        const body = await response.json()
        backendMessage = typeof body?.message === 'string' ? body.message : undefined
      } catch {
        // ignore parse errors
      }
      const error: AuthServiceError = {
        type: 'unauthorized',
        message: backendMessage ?? 'Credenciales incorrectas',
        statusCode: 401,
      }
      throw error
    }

    // HTTP 403 — Requirement 7.3
    if (response.status === 403) {
      const error: AuthServiceError = {
        type: 'forbidden',
        message: 'Acceso denegado',
        statusCode: 403,
      }
      throw error
    }

    // Other non-2xx responses
    if (!response.ok) {
      const error: AuthServiceError = {
        type: 'unknown',
        message: 'Error inesperado. Intente nuevamente.',
        statusCode: response.status,
      }
      throw error
    }

    // HTTP 200 — Requirement 2.3, 7.6
    const data: LoginResponse = await response.json()
    return data
  } catch (err: unknown) {
    clearTimeout(timeoutId)

    // Re-throw errors we already constructed
    if (isAuthServiceError(err)) {
      throw err
    }

    // AbortError → timeout — Requirement 2.5
    if (err instanceof DOMException && err.name === 'AbortError') {
      const error: AuthServiceError = {
        type: 'timeout',
        message: 'El servidor no responde. Intente nuevamente.',
      }
      throw error
    }

    // TypeError → no network — Requirement 2.6
    if (err instanceof TypeError) {
      const error: AuthServiceError = {
        type: 'network',
        message: 'Sin conexión. Verifique su red.',
      }
      throw error
    }

    // Fallback
    const error: AuthServiceError = {
      type: 'unknown',
      message: 'Error inesperado. Intente nuevamente.',
    }
    throw error
  }
}

// ---------------------------------------------------------------------------
// authenticatedFetch
// ---------------------------------------------------------------------------

/**
 * Wraps native `fetch` to inject the `Authorization: Bearer` header.
 *
 * If the response is HTTP 401 (token expired or revoked), the auth store
 * is notified so the user is redirected to the LoginScreen (Req 8.3).
 *
 * The authStore import is done lazily inside the function body to avoid
 * circular dependency issues (authStore → authService → authStore).
 *
 * Requirements: 7.2, 8.3
 */
export async function authenticatedFetch(
  url: string,
  options?: RequestInit,
  jwt?: string
): Promise<Response> {
  const headers = new Headers(options?.headers)

  // Requirement 7.2 — inject Authorization header when jwt is provided
  if (jwt !== undefined) {
    headers.set('Authorization', `Bearer ${jwt}`)
  }

  const response = await fetch(url, {
    ...options,
    headers,
  })

  // Requirement 8.3 — force logout on 401 from a protected endpoint
  if (response.status === 401) {
    // Lazy import to prevent circular dependency
    const { useAuthStore } = await import('./authStore')
    useAuthStore.getState().logout()
  }

  return response
}
