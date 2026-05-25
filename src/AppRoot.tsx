/**
 * AppRoot — Componente raíz con guardia de autenticación.
 *
 * Orquesta el ciclo de vida de la sesión:
 *   1. Al montar, llama initialize() para restaurar la sesión desde sessionStorage.
 *   2. Mientras isInitialized === false, muestra una pantalla de carga mínima.
 *   3. Cuando isInitialized === true y isAuthenticated === false, renderiza <LoginScreen />.
 *   4. Cuando isInitialized === true y isAuthenticated === true, renderiza <App />.
 *
 * Requirements: 1.3, 1.4, 1.5, 3.7
 */

import { useEffect } from 'react'
import { useAuthStore } from './auth/authStore'
import LoginScreen from './components/auth/LoginScreen'
import App from './App'

export default function AppRoot() {
  const initialize = useAuthStore((s) => s.initialize)
  const isInitialized = useAuthStore((s) => s.isInitialized)
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated)

  // Requirement 1.3 — restaurar sesión al montar la aplicación
  useEffect(() => {
    initialize()
  }, [initialize])

  // Requirement 1.5 — pantalla de carga mientras se verifica la sesión
  if (!isInitialized) {
    return (
      <div
        className="flex flex-column align-items-center justify-content-center"
        style={{
          height: '100vh',
          width: '100%',
          backgroundColor: 'var(--pos-bg-primary)',
        }}
      >
        <h1
          className="font-display m-0 mb-4"
          style={{
            fontSize: '2.5rem',
            fontWeight: '600',
            color: 'var(--pos-text-primary)',
            letterSpacing: '-0.02em',
          }}
        >
          MERCATO
        </h1>
        <i
          className="pi pi-spin pi-spinner"
          style={{
            fontSize: '1.5rem',
            color: 'var(--pos-text-muted)',
          }}
        />
      </div>
    )
  }

  // Requirement 1.4 — redirigir a login si no hay sesión activa
  if (!isAuthenticated) {
    return <LoginScreen />
  }

  // Requirement 1.3 — mostrar la aplicación principal con sesión válida
  return <App />
}
