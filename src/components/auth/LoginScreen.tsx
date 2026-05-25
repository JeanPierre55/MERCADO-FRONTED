/**
 * LoginScreen — Pantalla de acceso del sistema POS MERCATO.
 *
 * Usa exclusivamente las variables CSS del sistema (global.css) y
 * componentes PrimeReact ya instalados. No almacena la contraseña
 * en ningún store ni sessionStorage tras completar el proceso.
 *
 * Requirements: 1.1, 1.2, 1.6, 2.1, 2.4, 2.5, 2.6, 2.7, 8.2, 8.4
 */

import { useState } from 'react'
import { InputText } from 'primereact/inputtext'
import { Button } from 'primereact/button'
import { loginRequest, AuthServiceError } from '../../auth/authService'
import { useAuthStore } from '../../auth/authStore'

export default function LoginScreen() {
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [showPassword, setShowPassword] = useState(false)

  // Requirement 1.6 — botón deshabilitado con campos vacíos o solo espacios
  const isSubmitDisabled =
    username.trim() === '' || password.trim() === '' || isLoading

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    // Limpiar error previo
    setError(null)
    setIsLoading(true)

    try {
      // Requirement 2.1 — llamada HTTP real al backend
      const response = await loginRequest({ username, password })

      // Requirement 3.1 — almacenar sesión en Auth_Store (sessionStorage)
      // Requirement 8.4 — la contraseña NO se almacena; el componente se desmontará
      useAuthStore.getState().login({
        jwt: response.token,
        role: response.role,
        user: response.user,
      })
    } catch (err: unknown) {
      const authError = err as AuthServiceError

      // Requirement 2.4 — mostrar mensaje del backend o fallback
      setError(authError.message ?? 'Error inesperado. Intente nuevamente.')

      // Requirement 8.4 — limpiar contraseña tras error 401
      if (authError.type === 'unauthorized') {
        setPassword('')
      }
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div
      className="flex align-items-center justify-content-center"
      style={{
        minHeight: '100vh',
        width: '100%',
        backgroundColor: 'var(--pos-bg-primary)',
      }}
    >
      {/* Card centrada */}
      <div
        className="animate-scale-in"
        style={{
          width: '100%',
          maxWidth: '400px',
          backgroundColor: 'var(--pos-bg-secondary)',
          borderRadius: '16px',
          border: '1px solid var(--pos-border)',
          boxShadow:
            '0 20px 40px -10px rgba(0, 0, 0, 0.10), 0 4px 16px -4px rgba(0, 0, 0, 0.06)',
          padding: '2.5rem 2rem',
          margin: '1rem',
        }}
      >
        {/* Logo y marca — igual que el Header */}
        <div className="flex flex-column align-items-center mb-5">
          <div className="flex align-items-center gap-3 mb-2">
            <h1
              className="font-display m-0"
              style={{
                fontSize: '2.25rem',
                fontWeight: '600',
                color: 'var(--pos-text-primary)',
                letterSpacing: '-0.02em',
              }}
            >
              MERCATO
            </h1>
            <span
              className="pos-tag"
              style={{
                backgroundColor: 'var(--pos-bg-tertiary)',
                color: 'var(--pos-text-secondary)',
                fontSize: '0.65rem',
                textTransform: 'uppercase',
                letterSpacing: '0.1em',
              }}
            >
              POS
            </span>
          </div>
          <p
            className="m-0"
            style={{
              color: 'var(--pos-text-muted)',
              fontSize: '0.875rem',
              letterSpacing: '0.02em',
            }}
          >
            Sistema de Punto de Venta
          </p>
        </div>

        {/* Separador */}
        <div
          style={{
            height: '1px',
            backgroundColor: 'var(--pos-border)',
            marginBottom: '2rem',
          }}
        />

        {/* Formulario */}
        <form onSubmit={handleSubmit} noValidate>
          {/* Campo de usuario */}
          <div className="flex flex-column gap-2 mb-4">
            <label
              htmlFor="login-username"
              style={{
                fontSize: '0.8125rem',
                fontWeight: '500',
                color: 'var(--pos-text-secondary)',
                letterSpacing: '0.02em',
              }}
            >
              Usuario
            </label>
            <div className="p-inputgroup">
              <span
                className="p-inputgroup-addon"
                style={{
                  backgroundColor: 'var(--pos-bg-tertiary)',
                  border: '1.5px solid var(--pos-border)',
                  borderRight: 'none',
                  borderRadius: '10px 0 0 10px',
                  padding: '0 0.875rem',
                  display: 'flex',
                  alignItems: 'center',
                }}
              >
                <i
                  className="pi pi-user"
                  style={{ color: 'var(--pos-text-secondary)', fontSize: '0.9rem' }}
                />
              </span>
              <InputText
                id="login-username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="Nombre de usuario"
                autoComplete="username"
                autoFocus
                disabled={isLoading}
                style={{
                  borderRadius: '0 10px 10px 0',
                  borderLeft: 'none',
                  flex: 1,
                }}
              />
            </div>
          </div>

          {/* Campo de contraseña */}
          <div className="flex flex-column gap-2 mb-4">
            <label
              htmlFor="login-password"
              style={{
                fontSize: '0.8125rem',
                fontWeight: '500',
                color: 'var(--pos-text-secondary)',
                letterSpacing: '0.02em',
              }}
            >
              Contraseña
            </label>
            <div className="p-inputgroup">
              <span
                className="p-inputgroup-addon"
                style={{
                  backgroundColor: 'var(--pos-bg-tertiary)',
                  border: '1.5px solid var(--pos-border)',
                  borderRight: 'none',
                  borderRadius: '10px 0 0 10px',
                  padding: '0 0.875rem',
                  display: 'flex',
                  alignItems: 'center',
                }}
              >
                <i
                  className="pi pi-lock"
                  style={{ color: 'var(--pos-text-secondary)', fontSize: '0.9rem' }}
                />
              </span>
              <InputText
                id="login-password"
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Contraseña"
                autoComplete="current-password"
                disabled={isLoading}
                style={{
                  borderRadius: '0',
                  borderLeft: 'none',
                  borderRight: 'none',
                  flex: 1,
                }}
              />
              {/* Toggle de visibilidad */}
              <button
                type="button"
                onClick={() => setShowPassword((prev) => !prev)}
                disabled={isLoading}
                aria-label={showPassword ? 'Ocultar contraseña' : 'Mostrar contraseña'}
                style={{
                  backgroundColor: 'var(--pos-bg-tertiary)',
                  border: '1.5px solid var(--pos-border)',
                  borderLeft: 'none',
                  borderRadius: '0 10px 10px 0',
                  padding: '0 0.875rem',
                  cursor: isLoading ? 'not-allowed' : 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  transition: 'background-color 0.15s ease',
                  outline: 'none',
                }}
                onMouseEnter={(e) => {
                  if (!isLoading)
                    (e.currentTarget as HTMLButtonElement).style.backgroundColor =
                      'var(--pos-border)'
                }}
                onMouseLeave={(e) => {
                  ;(e.currentTarget as HTMLButtonElement).style.backgroundColor =
                    'var(--pos-bg-tertiary)'
                }}
              >
                <i
                  className={showPassword ? 'pi pi-eye-slash' : 'pi pi-eye'}
                  style={{ color: 'var(--pos-text-secondary)', fontSize: '0.9rem' }}
                />
              </button>
            </div>
          </div>

          {/* Mensaje de error — Requirement 2.4, 2.5, 2.6 */}
          {error !== null && (
            <div
              role="alert"
              className="flex align-items-center gap-2 mb-4"
              style={{
                backgroundColor: 'rgba(155, 34, 38, 0.08)',
                border: '1px solid rgba(155, 34, 38, 0.2)',
                borderRadius: '10px',
                padding: '0.75rem 1rem',
              }}
            >
              <i
                className="pi pi-exclamation-circle"
                style={{ color: 'var(--pos-danger)', fontSize: '0.9rem', flexShrink: 0 }}
              />
              <span
                style={{
                  color: 'var(--pos-danger)',
                  fontSize: '0.875rem',
                  lineHeight: '1.4',
                }}
              >
                {error}
              </span>
            </div>
          )}

          {/* Botón de acceso — Requirement 1.6, 2.7 */}
          <Button
            type="submit"
            label={isLoading ? 'Verificando...' : 'Acceder'}
            icon={isLoading ? 'pi pi-spin pi-spinner' : 'pi pi-sign-in'}
            iconPos="left"
            disabled={isSubmitDisabled}
            className="w-full"
            style={{
              backgroundColor: 'var(--pos-accent)',
              borderColor: 'var(--pos-accent)',
              color: '#ffffff',
              fontWeight: '500',
              padding: '0.875rem 1.5rem',
              fontSize: '0.9375rem',
              letterSpacing: '0.025em',
              borderRadius: '10px',
              transition: 'background-color 0.2s ease, border-color 0.2s ease',
            }}
            onMouseEnter={(e) => {
              if (!isSubmitDisabled) {
                const btn = e.currentTarget as HTMLButtonElement
                btn.style.backgroundColor = 'var(--pos-accent-hover)'
                btn.style.borderColor = 'var(--pos-accent-hover)'
              }
            }}
            onMouseLeave={(e) => {
              const btn = e.currentTarget as HTMLButtonElement
              btn.style.backgroundColor = 'var(--pos-accent)'
              btn.style.borderColor = 'var(--pos-accent)'
            }}
          />
        </form>

        {/* Footer de la card */}
        <p
          className="text-center m-0 mt-4"
          style={{
            color: 'var(--pos-text-muted)',
            fontSize: '0.75rem',
          }}
        >
          © {new Date().getFullYear()} MERCATO — Acceso restringido
        </p>
      </div>
    </div>
  )
}
