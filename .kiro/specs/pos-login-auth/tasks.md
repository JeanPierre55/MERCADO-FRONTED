# Plan de Implementación: POS Login & Auth

## Overview

Implementación incremental del sistema de autenticación basado en roles para MERCATO POS. Se pate de los módulos de datos y utilidades (sin dependencias), luego el store y servicio de auth, después la UI de login y el componente raíz, y finalmente la integración con los módulos existentes (Header, posStore, CheckoutDialog) y los loggers de trazabilidad.

Lenguaje: **TypeScript / React** (Vitest + @testing-library/react + fast-check para property tests).

---

## Tasks

- [x] 1. Instalar dependencia de property-based testing e inicializar tipos de auth
  - Ejecutar `pnpm add -D fast-check` para agregar fast-check al proyecto
  - Agregar los tipos `UserRole`, `AuthUser` y `AuthSession` a `src/types/index.ts`
  - _Requirements: 3.1, 3.2, 7.6_

- [ ] 2. Implementar utilidades JWT y módulo Auth_Service
  - [x] 2.1 Crear `src/auth/jwtUtils.ts`
    - Implementar `decodeJwtPayload(token: string): Record<string, unknown> | null` — decodifica el payload Base64 sin verificar firma
    - Implementar `isJwtExpired(token: string): boolean` — lee el campo `exp` del payload y compara con `Date.now()`
    - _Requirements: 3.7, 8.3_

  - [ ]* 2.2 Escribir tests unitarios para `jwtUtils`
    - Caso: JWT con `exp` en el futuro → `isJwtExpired` retorna `false`
    - Caso: JWT con `exp` en el pasado → `isJwtExpired` retorna `true`
    - Caso: token malformado → `decodeJwtPayload` retorna `null` sin lanzar excepción
    - _Requirements: 3.7_

  - [x] 2.3 Crear `src/auth/authService.ts`
    - Implementar `loginRequest(credentials: LoginCredentials): Promise<LoginResponse>` usando `fetch` nativo con `AbortController` (timeout 10 s)
    - Leer URL base desde `import.meta.env.VITE_API_BASE_URL` con fallback a `http://localhost:8080`
    - Incluir header `Content-Type: application/json` en todas las peticiones
    - Mapear HTTP 401 → `AuthServiceError { type: 'unauthorized' }`, 403 → `forbidden`, timeout → `timeout`, `TypeError` → `network`, otros → `unknown`
    - Implementar `authenticatedFetch(url, options?, jwt?)` que agrega `Authorization: Bearer {jwt}`
    - _Requirements: 2.1, 2.2, 2.3, 2.4, 2.5, 2.6, 7.1, 7.2, 7.4, 7.5, 7.6_

  - [ ]* 2.4 Escribir tests unitarios para `authService`
    - Mock de `fetch` para cada escenario: 200, 401 con mensaje, 401 sin mensaje, 403, timeout, error de red, 500
    - Verificar que `VITE_API_BASE_URL` se usa cuando está definida y que el fallback es `http://localhost:8080`
    - Verificar que HTTP 403 lanza `AuthServiceError { type: 'forbidden' }`
    - _Requirements: 2.3, 2.4, 2.5, 2.6, 7.4, 7.5_

  - [ ]* 2.5 Escribir property test — Property 3: Extracción correcta de JWT y Role desde HTTP 200
    - **Property 3: JWT and Role extraction from HTTP 200**
    - **Validates: Requirements 2.3**
    - Para cualquier `{ token, role, user }` generado por fast-check, mockear `fetch` con HTTP 200 y verificar que `loginRequest` retorna exactamente esos valores sin modificación
    - _Requirements: 2.3_

  - [ ]* 2.6 Escribir property test — Property 11: Header Content-Type en peticiones de auth
    - **Property 11: Content-Type header in auth requests**
    - **Validates: Requirements 7.1**
    - Para cualquier credencial `{ username, password }`, verificar que la petición generada incluye `Content-Type: application/json`
    - _Requirements: 7.1_

  - [ ]* 2.7 Escribir property test — Property 12: Header Authorization en peticiones protegidas
    - **Property 12: Authorization header in protected requests**
    - **Validates: Requirements 7.2**
    - Para cualquier JWT y URL, verificar que `authenticatedFetch` incluye `Authorization: Bearer {jwt}` con el valor exacto
    - _Requirements: 7.2_

  - [ ]* 2.8 Escribir property test — Property 13: Serialización JSON round-trip de credenciales
    - **Property 13: JSON serialization round-trip**
    - **Validates: Requirements 7.6**
    - Para cualquier `{ username, password }`, verificar que `JSON.parse(JSON.stringify(credentials))` produce un objeto equivalente al original
    - _Requirements: 7.6_

- [x] 3. Checkpoint — Verificar módulos de auth base
  - Asegurarse de que todos los tests pasan. Consultar al usuario si surgen dudas.

- [ ] 4. Implementar Auth_Store (Zustand)
  - [x] 4.1 Crear `src/auth/authStore.ts`
    - Definir el store con `session: AuthSession | null`, `isAuthenticated: boolean`, `isInitialized: boolean`
    - Implementar `initialize()`: leer `sessionStorage.getItem('mercato-auth')`, parsear JSON, llamar `isJwtExpired` y restaurar o limpiar sesión según resultado
    - Implementar `login(session: AuthSession)`: guardar en estado y en `sessionStorage` con clave `'mercato-auth'`
    - Implementar `logout()`: limpiar estado y `sessionStorage.removeItem('mercato-auth')`
    - Exponer `session.role` para que los componentes puedan leer el rol activo
    - **No usar `localStorage`** — solo `sessionStorage`
    - _Requirements: 3.1, 3.2, 3.3, 3.4, 4.2, 8.1_

  - [ ]* 4.2 Escribir tests unitarios para `authStore`
    - `initialize()` con JWT válido en sessionStorage → restaura sesión, `isAuthenticated = true`
    - `initialize()` con JWT expirado → limpia sesión, `isAuthenticated = false`
    - `initialize()` sin datos en sessionStorage → `isAuthenticated = false`
    - `login()` → estado y sessionStorage contienen exactamente los valores recibidos
    - `logout()` → estado y sessionStorage quedan vacíos
    - Verificar que `localStorage` no contiene datos de auth en ningún caso
    - _Requirements: 3.1, 3.2, 3.3, 3.7, 4.2, 8.1_

  - [ ]* 4.3 Escribir property test — Property 5: Almacenamiento completo de sesión tras auth exitosa
    - **Property 5: Complete session storage after successful auth**
    - **Validates: Requirements 3.1, 3.2**
    - Para cualquier `AuthSession` generada por fast-check, llamar `login(session)` y verificar que el store y `sessionStorage` contienen exactamente esos valores
    - _Requirements: 3.1, 3.2_

  - [ ]* 4.4 Escribir property test — Property 6: Limpieza completa de sesión tras logout
    - **Property 6: Complete session cleanup after logout**
    - **Validates: Requirements 4.2**
    - Para cualquier sesión activa, llamar `logout()` y verificar que `session`, `isAuthenticated` y `sessionStorage['mercato-auth']` son `null`/`undefined`
    - _Requirements: 4.2_

- [ ] 5. Implementar LoginScreen
  - [x] 5.1 Crear `src/components/auth/LoginScreen.tsx`
    - Renderizar campo de username, campo de password y botón de acceso usando variables CSS del sistema (`--pos-bg-primary`, `--pos-accent`, etc.) y componentes PrimeReact
    - Deshabilitar el botón de acceso cuando username o password estén vacíos o sean solo espacios en blanco
    - Al enviar: llamar `loginRequest`, mostrar spinner y deshabilitar botón mientras la petición está pendiente
    - En éxito (HTTP 200): llamar `useAuthStore().login(session)` con los datos recibidos
    - En error 401: mostrar mensaje del backend o "Credenciales incorrectas"; limpiar campo password
    - En error 403: mostrar "Acceso denegado"
    - En timeout: mostrar "El servidor no responde. Intente nuevamente."
    - En error de red: mostrar "Sin conexión. Verifique su red."
    - **No almacenar la contraseña en ningún estado tras completar el login**
    - _Requirements: 1.1, 1.2, 1.6, 2.1, 2.4, 2.5, 2.6, 2.7, 8.2, 8.4_

  - [ ]* 5.2 Escribir tests unitarios para `LoginScreen`
    - Renderiza los tres elementos requeridos (username, password, botón)
    - Botón deshabilitado con campos vacíos
    - Muestra error 401 con mensaje del backend
    - Muestra error de timeout
    - Muestra error de red
    - Muestra spinner y botón deshabilitado durante petición en curso
    - JWT no aparece en ningún elemento del DOM
    - La contraseña no persiste en el store tras login exitoso
    - _Requirements: 1.2, 1.6, 2.4, 2.5, 2.6, 2.7, 8.2, 8.4_

  - [ ]* 5.3 Escribir property test — Property 2: Botón deshabilitado con campos vacíos
    - **Property 2: Submit button disabled with empty fields**
    - **Validates: Requirements 1.6**
    - Para cualquier combinación donde al menos un campo sea vacío o solo espacios en blanco, verificar que el botón de acceso tiene `disabled`
    - _Requirements: 1.6_

  - [ ]* 5.4 Escribir property test — Property 4: Estado de carga durante petición en curso
    - **Property 4: Loading state during pending request**
    - **Validates: Requirements 2.7**
    - Para cualquier credencial válida (no vacías), mockear `fetch` con una promesa que nunca resuelve, verificar que el indicador de carga es visible y el botón está deshabilitado
    - _Requirements: 2.7_

- [ ] 6. Implementar AppRoot y actualizar main.tsx
  - [x] 6.1 Crear `src/AppRoot.tsx`
    - Llamar `useAuthStore().initialize()` en `useEffect` al montar
    - Mientras `isInitialized === false`: mostrar pantalla de carga/splash mínima
    - Cuando `isInitialized === true` y `isAuthenticated === false`: renderizar `<LoginScreen />`
    - Cuando `isInitialized === true` y `isAuthenticated === true`: renderizar `<App />`
    - _Requirements: 1.3, 1.4, 1.5, 3.7_

  - [x] 6.2 Modificar `src/main.tsx`
    - Importar `AppRoot` en lugar de `App`
    - Renderizar `<AppRoot />` dentro del `PrimeReactProvider` existente
    - _Requirements: 1.3, 1.4_

  - [ ]* 6.3 Escribir tests unitarios para `AppRoot`
    - Sin sesión → renderiza `LoginScreen`
    - Con sesión válida → renderiza la interfaz POS (`App`)
    - Durante inicialización → renderiza pantalla de carga (no LoginScreen ni App)
    - _Requirements: 1.3, 1.4, 1.5_

  - [ ]* 6.4 Escribir property test — Property 1: Rutas protegidas requieren sesión activa
    - **Property 1: Protected routes require active session**
    - **Validates: Requirements 1.5**
    - Para cualquier estado sin sesión activa, verificar que `AppRoot` renderiza `LoginScreen` y no el contenido protegido del POS
    - _Requirements: 1.5_

- [x] 7. Checkpoint — Verificar flujo de autenticación completo
  - Asegurarse de que todos los tests pasan. Consultar al usuario si surgen dudas.

- [ ] 8. Actualizar Header con logout y badge de admin
  - [x] 8.1 Modificar `src/components/layout/Header.tsx`
    - Leer `session` y `logout` del `useAuthStore`
    - Reemplazar el nombre hardcodeado "Maria G." por `session?.user.displayName`
    - Mostrar badge visual de "ADMIN" cuando `session?.role === 'ADMIN'` (Requirement 3.6)
    - Agregar botón/control de cierre de sesión visible mientras haya sesión activa
    - Al activar logout: si el carrito tiene ítems, mostrar `Dialog` de confirmación de PrimeReact; si el usuario confirma, llamar `logout()` y `clearCart()`; si cancela, no hacer nada
    - Si el carrito está vacío, llamar `logout()` directamente sin diálogo
    - _Requirements: 3.5, 3.6, 4.1, 4.2, 4.3, 4.4_

  - [ ]* 8.2 Escribir tests unitarios para `Header` modificado
    - Muestra `displayName` del usuario autenticado
    - Muestra badge ADMIN cuando `role === 'ADMIN'`
    - No muestra badge ADMIN cuando `role === 'CASHIER'`
    - Logout con carrito vacío no muestra diálogo de confirmación
    - Logout con carrito no vacío muestra diálogo de confirmación
    - _Requirements: 3.5, 3.6, 4.1, 4.4_

- [ ] 9. Implementar loggers de trazabilidad
  - [x] 9.1 Crear `src/loggers/cartLogger.ts`
    - Implementar `logProductAdded(product, quantity, subtotal, username)` — emite `console.log` con formato `[POS][CART] Producto agregado: {nombre} (id: {id}) | Cantidad: {cantidad} | Subtotal: {subtotal} | Usuario: {username}`
    - Implementar `logQuantityUpdated(product, newQuantity, newSubtotal, username)` — emite `console.log` con formato `[POS][CART] Cantidad actualizada: {nombre} (id: {id}) | Nueva cantidad: {cantidad} | Nuevo subtotal: {subtotal} | Usuario: {username}`
    - Envolver en `try/catch`; en caso de error interno usar `console.error` sin relanzar
    - Si `username` es vacío o undefined, usar `'Desconocido'`
    - _Requirements: 5.1, 5.2, 5.3, 5.4_

  - [ ]* 9.2 Escribir tests unitarios para `cartLogger`
    - `logProductAdded` emite exactamente un `console.log` con todos los campos requeridos
    - `logQuantityUpdated` emite exactamente un `console.log` con todos los campos requeridos
    - _Requirements: 5.1, 5.2, 5.3_

  - [ ]* 9.3 Escribir property test — Property 7: Formato de log al agregar producto
    - **Property 7: Cart add log format**
    - **Validates: Requirements 5.1, 5.3**
    - Para cualquier producto, cantidad válida y username, verificar que `logProductAdded` emite exactamente un `console.log` cuyo mensaje contiene nombre, id, cantidad, subtotal y username con el prefijo `[POS][CART] Producto agregado`
    - _Requirements: 5.1, 5.3_

  - [ ]* 9.4 Escribir property test — Property 8: Formato de log al actualizar cantidad
    - **Property 8: Cart update log format**
    - **Validates: Requirements 5.2, 5.3**
    - Para cualquier producto, nueva cantidad y username, verificar que `logQuantityUpdated` emite exactamente un `console.log` con el prefijo `[POS][CART] Cantidad actualizada` y todos los campos requeridos
    - _Requirements: 5.2, 5.3_

  - [x] 9.5 Crear `src/loggers/checkoutLogger.ts`
    - Implementar `logCheckoutStarted(total, method, username)` — emite `console.log` con formato `[POS][CHECKOUT] Inicio de pago | Total: {total} | Método: {método} | Cajero: {usuario} | Timestamp: {ISO8601}`
    - Implementar `logCheckoutCompleted(receiptNumber, total, method, username)` — emite `console.log` con formato `[POS][CHECKOUT] Pago completado | Folio: {receiptNumber} | Total: {total} | Método: {método} | Cajero: {usuario} | Timestamp: {ISO8601}`
    - Implementar `logCheckoutValidationError(description, username)` — emite `console.warn` con formato `[POS][CHECKOUT] Error de validación: {descripción} | Cajero: {usuario} | Timestamp: {ISO8601}`
    - Timestamp generado con `new Date().toISOString()`
    - Envolver en `try/catch`; en caso de error interno usar `console.error` sin relanzar
    - _Requirements: 6.1, 6.2, 6.3, 6.4, 6.5_

  - [ ]* 9.6 Escribir tests unitarios para `checkoutLogger`
    - `logCheckoutStarted` emite `console.log` con todos los campos y timestamp ISO 8601 válido
    - `logCheckoutCompleted` emite `console.log` con folio, total, método, usuario y timestamp
    - `logCheckoutValidationError` emite `console.warn` (no `console.log`)
    - _Requirements: 6.1, 6.2, 6.3, 6.4, 6.5_

  - [ ]* 9.7 Escribir property test — Property 9: Formato de log al iniciar checkout
    - **Property 9: Checkout start log format**
    - **Validates: Requirements 6.1, 6.4, 6.5**
    - Para cualquier total, método de pago válido y username, verificar que `logCheckoutStarted` emite exactamente un `console.log` con el prefijo `[POS][CHECKOUT] Inicio de pago` y un timestamp ISO 8601 válido
    - _Requirements: 6.1, 6.4, 6.5_

  - [ ]* 9.8 Escribir property test — Property 10: Formato de log al completar pago
    - **Property 10: Checkout complete log format**
    - **Validates: Requirements 6.2, 6.4, 6.5**
    - Para cualquier folio, total, método y username, verificar que `logCheckoutCompleted` emite exactamente un `console.log` con el prefijo `[POS][CHECKOUT] Pago completado` y un timestamp ISO 8601 válido
    - _Requirements: 6.2, 6.4, 6.5_

- [ ] 10. Integrar loggers en posStore y CheckoutDialog
  - [x] 10.1 Modificar `src/store/posStore.ts`
    - En `addToCart`: después de actualizar el estado, llamar `logProductAdded` o `logQuantityUpdated` según si el producto ya existía en el carrito, pasando `useAuthStore.getState().session?.user.displayName ?? 'Desconocido'` como username
    - En `processPayment`: reemplazar `cashier: 'Cajero 1'` por `cashier: useAuthStore.getState().session?.user.displayName ?? 'Desconocido'`
    - _Requirements: 3.1, 5.1, 5.2, 5.3, 5.4_

  - [x] 10.2 Modificar `src/components/checkout/CheckoutDialog.tsx`
    - Al abrir el diálogo (cuando `isCheckoutOpen` cambia a `true`): llamar `logCheckoutStarted(total, paymentMethod, username)`
    - En `handlePayment`, tras llamar `processPayment`: llamar `logCheckoutCompleted(transaction.receiptNumber, total, paymentMethod, username)`
    - En `isValidPayment() === false` al intentar confirmar: llamar `logCheckoutValidationError(descripción, username)`
    - Leer username desde `useAuthStore().session?.user.displayName ?? 'Desconocido'`
    - _Requirements: 6.1, 6.2, 6.3, 6.4, 6.5_

- [ ] 11. Verificar seguridad de sesión
  - [x] 11.1 Auditar que el JWT no aparece en el DOM
    - Revisar `LoginScreen`, `Header` y `AppRoot` para confirmar que ningún elemento renderiza el valor del JWT
    - _Requirements: 8.2_

  - [ ] 11.2 Verificar manejo de JWT expirado durante sesión activa
    - En `authService.ts`, en `authenticatedFetch`: si la respuesta es HTTP 401, llamar `useAuthStore.getState().logout()` para forzar retorno al LoginScreen
    - _Requirements: 8.3_

- [x] 12. Checkpoint final — Asegurarse de que todos los tests pasan
  - Ejecutar `pnpm test` y verificar que todos los tests (unitarios y de propiedades) pasan sin errores.
  - Asegurarse de que no hay errores de TypeScript (`pnpm build`).
  - Consultar al usuario si surgen dudas.

---

## Notes

- Las tareas marcadas con `*` son opcionales y pueden omitirse para un MVP más rápido
- Cada tarea referencia los requerimientos específicos para trazabilidad
- Los property tests usan fast-check con mínimo 100 iteraciones por propiedad
- Los loggers nunca deben lanzar excepciones — siempre capturar con `try/catch`
- El JWT se almacena **únicamente** en `sessionStorage`, nunca en `localStorage`
- La contraseña no debe persistir en ningún estado tras completar el login
- `Auth_Service` es un módulo de funciones puras (no clase) para facilitar el mocking en tests
