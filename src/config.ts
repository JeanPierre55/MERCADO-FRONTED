/**
 * Módulo de configuración centralizado.
 *
 * Dos URLs base separadas:
 *  - BACKEND_URL  → Spring Boot en localhost:8080 (login, productos locales, ventas locales)
 *  - AWS_API_URL  → AWS API Gateway (GET /productos, POST /ventas serverless)
 *
 * Requirements: 6.1, 6.2, 6.5
 */

/** URL base del backend Spring Boot — login y endpoints principales */
export const BACKEND_URL: string =
  (import.meta.env.VITE_BACKEND_URL as string) ?? 'http://localhost:8080'

/** URL base de AWS API Gateway — productos y ventas serverless */
export const API_BASE_URL: string =
  (import.meta.env.VITE_API_BASE_URL as string) ?? 'http://localhost:3000'
