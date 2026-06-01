# Design Document — POS Productos & Ventas

## Overview

Este documento describe el diseño técnico para extender el sistema POS MERCATO con la capacidad de consultar productos desde una API REST alojada en AWS API Gateway y registrar ventas a través de la misma API.

El módulo introduce dos componentes React (`ProductosList` y `VentaForm`), dos servicios HTTP (`productosService` y `ventasService`), y un módulo de configuración centralizado (`config.ts`). Todos los servicios se integran con el `Auth_Store` existente (spec `pos-login-auth`) para incluir el JWT en cada petición.

### Principios de diseño

- **Separación de responsabilidades**: Los servicios HTTP son módulos de funciones puras independientes de los componentes React.
- **Configuración centralizada**: La URL base de la API se lee una sola vez en `config.ts` y se importa desde los servicios.
- **Integración con Auth_Store**: Los servicios leen el JWT directamente de `useAuthStore.getState().session?.jwt` sin recibir el token como parámetro.
- **Sin dependencias nuevas de UI**: Los componentes usan HTML5 semántico y CSS con Flexbox, sin librerías de UI adicionales para este módulo.

### Justificación de React

React es la elección adecuada para este módulo por cuatro razones concretas:

1. **Reutilización de componentes**: `ProductosList` puede instanciarse en cualquier vista del POS sin duplicar lógica. El componente encapsula la consulta a la API, el estado de carga y el renderizado del catálogo; cualquier pantalla que necesite mostrar productos simplemente lo importa.

2. **Manejo eficiente de estado**: Los hooks `useState` y `useEffect` permiten gestionar los estados `loading`, `error`, `productos` y `selectedProducts` de forma declarativa. React re-renderiza únicamente los elementos del DOM que cambian, lo que es crítico en un POS donde el cajero interactúa con el catálogo continuamente.

3. **Integración sencilla con APIs REST**: El hook `useEffect` dispara la consulta `GET /productos` exactamente una vez al montar el componente. La función `async/await` dentro del efecto mantiene el código legible y el manejo de errores explícito con `try/catch`.

4. **Rapidez de desarrollo**: El ecosistema React (Vite, TypeScript, hooks) permite iterar rápidamente. La estructura de componentes funcionales sin clases reduce el boilerplate y facilita las pruebas unitarias con `@testing-library/react`.

---

## Architecture

### Diagrama cliente-servidor

```mermaid
graph TD
    subgraph "Cliente — React + Vite"
        A[App.tsx] --> B[ProductosList.tsx]
        A --> C[VentaForm.tsx]
        B --> D[productosService.ts]
        C --> E[ventasService.ts]
        D --> F[config.ts]
        E --> F
        D --> G[Auth_Store — Zustand]
        E --> G
    end

    subgraph "AWS Cloud"
        H[AWS API Gateway]
        I[Backend — Lambda / EC2]
        H --> I
    end

    D -- "GET /productos\nAuthorization: Bearer JWT" --> H
    E -- "POST /ventas\nAuthorization: Bearer JWT\nContent-Type: application/json" --> H
    H -- "200 OK\n[{id, nombre, precio}]" --> D
    H -- "200 OK\n{message}" --> E
```

### Flujo de navegación

```mermaid
flowchart TD
    Start([Usuario autenticado]) --> POS[Pantalla POS principal]
    POS --> Mount[ProductosList se monta]
    Mount --> Fetch[GET /productos]
    Fetch --> Loading[Muestra indicador de carga]
    Loading --> Response{Respuesta API}
    Response -- "HTTP 200" --> Render[Renderiza lista de productos]
    Response -- "HTTP error" --> ErrorMsg[Muestra mensaje de error]
    Response -- "Error de red" --> NetError[Muestra 'Sin conexión...']
    Render --> Select[Cajero selecciona productos]
    Select --> VentaForm[VentaForm actualiza selectedProducts]
    VentaForm --> Confirm{Cajero confirma venta}
    Confirm -- "Lista vacía" --> Disabled[Botón disabled — no acción]
    Confirm -- "Lista con productos" --> PostVenta[POST /ventas]
    PostVenta --> PostLoading[Botón disabled durante petición]
    PostLoading --> PostResponse{Respuesta API}
    PostResponse -- "HTTP 200" --> Success[Muestra mensaje de éxito\nLimpia selectedProducts]
    PostResponse -- "HTTP error" --> PostError[Muestra mensaje de error\nMantiene selectedProducts]
    PostResponse -- "Error de red" --> PostNetError[Muestra 'Sin conexión...'\nMantiene selectedProducts]
    Success --> Render
```

---

## Components and Interfaces

### Estructura de archivos requerida

```
src/
├── components/
│   ├── ProductosList.tsx       # Catálogo de productos desde API
│   └── VentaForm.tsx           # Gestión y envío de ventas
├── services/
│   ├── productosService.ts     # GET /productos
│   └── ventasService.ts        # POST /ventas
├── config.ts                   # Variables de entorno centralizadas
├── App.tsx                     # Componente raíz (existente, se modifica)
└── main.tsx                    # Punto de entrada (existente, sin cambios)
```

### `config.ts` — Módulo de configuración

```typescript
// src/config.ts

/**
 * URL base de la API Gateway.
 * Se lee de la variable de entorno VITE_API_BASE_URL.
 * Si no está definida, usa http://localhost:3000 como fallback.
 */
export const API_BASE_URL: string =
  import.meta.env.VITE_API_BASE_URL ?? 'http://localhost:3000'
```

### `productosService.ts` — Interface

```typescript
// src/services/productosService.ts

export interface Producto {
  id: string
  nombre: string
  precio: number
}

/**
 * Consulta el catálogo de productos desde la API Gateway.
 * Incluye el JWT del Auth_Store en el header Authorization.
 * @throws Error con mensaje descriptivo en caso de fallo HTTP o de red
 */
export async function getProductos(): Promise<Producto[]>
```

### `ventasService.ts` — Interface

```typescript
// src/services/ventasService.ts

export interface ProductoSeleccionado {
  id: string
  cantidad: number
}

export interface VentaRequest {
  productos: ProductoSeleccionado[]
}

export interface VentaResponse {
  message: string
}

/**
 * Registra una venta en la API Gateway.
 * Incluye el JWT del Auth_Store en el header Authorization.
 * @throws Error con mensaje descriptivo en caso de fallo HTTP o de red
 */
export async function registrarVenta(venta: VentaRequest): Promise<VentaResponse>
```

### `ProductosList.tsx` — Props y estado

```typescript
// src/components/ProductosList.tsx

interface ProductosListProps {
  onProductoSeleccionado: (producto: Producto) => void
}

// Estado interno (useState)
interface ProductosListState {
  productos: Producto[]       // Lista obtenida de la API
  loading: boolean            // true mientras GET /productos está en curso
  error: string | null        // Mensaje de error si la petición falla
}
```

### `VentaForm.tsx` — Props y estado

```typescript
// src/components/VentaForm.tsx

// Sin props externas — gestiona su propio estado de selección

// Estado interno (useState)
interface VentaFormState {
  selectedProducts: ProductoSeleccionado[]  // Productos seleccionados con cantidad
  submitting: boolean                        // true mientras POST /ventas está en curso
  successMessage: string | null             // Mensaje de éxito de la API
  errorMessage: string | null               // Mensaje de error
}
```

### Diseño de componentes — Responsabilidades

| Componente / Módulo | Responsabilidad |
|---|---|
| `config.ts` | Leer `VITE_API_BASE_URL` y exportar `API_BASE_URL` |
| `productosService.ts` | Ejecutar `GET /productos`, incluir JWT, retornar `Producto[]` |
| `ventasService.ts` | Ejecutar `POST /ventas`, incluir JWT y Content-Type, retornar `VentaResponse` |
| `ProductosList.tsx` | Montar → disparar `getProductos()` → renderizar lista con estados loading/error/empty |
| `VentaForm.tsx` | Gestionar `selectedProducts`, deshabilitar botón, llamar `registrarVenta()`, mostrar resultado |

---

## Data Models

### Tipos del módulo

```typescript
// Producto retornado por GET /productos
export interface Producto {
  id: string
  nombre: string
  precio: number
}

// Ítem en el body de POST /ventas
export interface ProductoSeleccionado {
  id: string
  cantidad: number
}

// Body completo de POST /ventas
export interface VentaRequest {
  productos: ProductoSeleccionado[]
}

// Respuesta de POST /ventas
export interface VentaResponse {
  message: string
}
```

### Contrato de API

**`GET /productos`**

Request:
```
GET {VITE_API_BASE_URL}/productos
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

Response 200 OK:
```json
[
  { "id": "1", "nombre": "Laptop", "precio": 2500 },
  { "id": "2", "nombre": "Mouse", "precio": 50 }
]
```

Response 4xx / 5xx:
```json
{ "message": "Descripción del error" }
```

---

**`POST /ventas`**

Request:
```
POST {VITE_API_BASE_URL}/ventas
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
Content-Type: application/json

{
  "productos": [
    { "id": "1", "cantidad": 1 },
    { "id": "2", "cantidad": 3 }
  ]
}
```

Response 200 OK:
```json
{ "message": "Venta registrada correctamente" }
```

Response 4xx / 5xx:
```json
{ "message": "Descripción del error" }
```

### Integración con Auth_Store

Los servicios leen el JWT directamente del store sin recibirlo como parámetro:

```typescript
import { useAuthStore } from '../auth/authStore'

const jwt = useAuthStore.getState().session?.jwt ?? ''
// Header: `Authorization: Bearer ${jwt}`
```

### Variable de entorno

| Variable | Descripción | Valor por defecto |
|---|---|---|
| `VITE_API_BASE_URL` | URL base de AWS API Gateway | `http://localhost:3000` |

Ejemplo en `.env.local`:
```
VITE_API_BASE_URL=https://abc123.execute-api.us-east-1.amazonaws.com/prod
```

---

## Correctness Properties

*Una propiedad es una característica o comportamiento que debe mantenerse verdadero en todas las ejecuciones válidas del sistema — esencialmente, una declaración formal sobre lo que el sistema debe hacer. Las propiedades sirven como puente entre las especificaciones legibles por humanos y las garantías de corrección verificables por máquina.*

### Property 1: Renderizado completo de productos

*Para cualquier* arreglo de N productos retornado por la API (con cualquier combinación de `id`, `nombre` y `precio`), el componente `ProductosList` debe renderizar exactamente N elementos de lista, cada uno mostrando el `nombre` del producto, el `precio` formateado y un botón de selección.

**Validates: Requirements 2.1, 2.2, 2.3, 2.4**

---

### Property 2: Header Authorization en servicios

*Para cualquier* valor de JWT almacenado en el `Auth_Store`, tanto `productosService` como `ventasService` deben incluir el header `Authorization: Bearer {jwt}` con el valor exacto del token en cada petición HTTP que realicen.

**Validates: Requirements 1.3, 3.3**

---

### Property 3: Construcción correcta de URL

*Para cualquier* valor de `VITE_API_BASE_URL`, la URL construida por `productosService` debe ser exactamente `baseUrl + "/productos"` y la URL construida por `ventasService` debe ser exactamente `baseUrl + "/ventas"`.

**Validates: Requirements 6.3, 6.4**

---

### Property 4: HTTP 200 retorna arreglo de productos sin modificación

*Para cualquier* arreglo de productos válido retornado por la API con código HTTP 200, la función `getProductos()` debe retornar exactamente ese arreglo sin modificar ningún campo.

**Validates: Requirements 1.4**

---

### Property 5: HTTP error en GET /productos muestra mensaje de error

*Para cualquier* código HTTP de error (400–599) retornado por la API al consultar productos, el componente `ProductosList` debe mostrar un mensaje de error visible al usuario.

**Validates: Requirements 1.6**

---

### Property 6: Serialización correcta del body de venta

*Para cualquier* lista de productos seleccionados (con cualquier combinación de `id` y `cantidad`), el body enviado por `ventasService` en el `POST /ventas` debe ser un JSON válido con el formato exacto `{ "productos": [{ "id": string, "cantidad": number }] }`.

**Validates: Requirements 3.1**

---

### Property 7: Lista vacía deshabilita el botón de confirmar venta

*Para cualquier* estado del `VentaForm` donde la lista de productos seleccionados esté vacía, el botón de confirmar venta debe estar en estado `disabled`.

**Validates: Requirements 3.6**

---

### Property 8: Venta exitosa muestra mensaje y limpia la selección

*Para cualquier* lista de productos seleccionados y cualquier mensaje de éxito retornado por la API (HTTP 200), después de una venta exitosa el `VentaForm` debe mostrar el mensaje recibido y la lista de productos seleccionados debe quedar vacía.

**Validates: Requirements 4.1, 4.2**

---

### Property 9: Error en POST /ventas mantiene la selección intacta

*Para cualquier* lista de productos seleccionados y cualquier error de API o de red durante el `POST /ventas`, la lista de productos seleccionados debe permanecer exactamente igual después del error.

**Validates: Requirements 5.5**

---

### Property 10: Config retorna el valor de VITE_API_BASE_URL

*Para cualquier* valor asignado a la variable de entorno `VITE_API_BASE_URL`, el módulo `config.ts` debe exportar exactamente ese valor como `API_BASE_URL`.

**Validates: Requirements 6.1**

---

## Error Handling

### Tabla de escenarios de error

| Escenario | Operación | Código HTTP | Mensaje al usuario | Comportamiento del sistema |
|---|---|---|---|---|
| Credenciales JWT expiradas | GET /productos | 401 | "Error al cargar productos. Intente nuevamente." | Muestra mensaje de error en ProductosList |
| Recurso no encontrado | GET /productos | 404 | "Error al cargar productos. Intente nuevamente." | Muestra mensaje de error en ProductosList |
| Error interno del servidor | GET /productos | 500 | "Error al cargar productos. Intente nuevamente." | Muestra mensaje de error en ProductosList |
| Sin conectividad | GET /productos | — (TypeError) | "Sin conexión. Verifique su red." | Captura TypeError de fetch, muestra mensaje específico |
| Lista vacía al confirmar | POST /ventas | — | — | Botón disabled, no se realiza petición |
| Error de validación | POST /ventas | 400 | Mensaje del backend o "Error al registrar la venta. Intente nuevamente." | Muestra error, mantiene selectedProducts |
| Error interno del servidor | POST /ventas | 500 | "Error al registrar la venta. Intente nuevamente." | Muestra error, mantiene selectedProducts |
| Sin conectividad | POST /ventas | — (TypeError) | "Sin conexión. Verifique su red." | Captura TypeError de fetch, mantiene selectedProducts |
| Respuesta sin campo `message` | POST /ventas | 200 | "Error al registrar la venta. Intente nuevamente." | Fallback cuando la respuesta no tiene el campo esperado |
| Catálogo vacío | GET /productos | 200 (arreglo []) | "No hay productos disponibles." | Muestra mensaje informativo, no es un error |

### Estrategia de manejo de errores en servicios

```typescript
// Patrón aplicado en productosService y ventasService
try {
  const response = await fetch(url, options)
  if (!response.ok) {
    throw new Error(`HTTP ${response.status}`)
  }
  return await response.json()
} catch (error) {
  if (error instanceof TypeError) {
    // Error de red (sin conectividad, DNS, CORS)
    throw new Error('Sin conexión. Verifique su red.')
  }
  throw error  // Re-lanza errores HTTP para que el componente los maneje
}
```

### Manejo de errores en componentes

Los componentes capturan los errores de los servicios y los almacenan en el estado `error` / `errorMessage`. El estado de error se limpia al iniciar una nueva petición. Los errores no se propagan al componente padre.

---

## Testing Strategy

### Herramientas

El proyecto ya tiene configurado **Vitest** + **@testing-library/react** + **@testing-library/user-event** + **jsdom**. Se usarán estas herramientas sin agregar dependencias nuevas.

Para property-based testing se usará **fast-check** (ya instalado como dependencia del spec `pos-login-auth`):

```bash
pnpm add -D fast-check
```

### Tests unitarios (example-based)

Cubren comportamientos específicos y casos de borde:

- `ProductosList` muestra indicador de carga mientras fetch no resuelve
- `ProductosList` muestra "No hay productos disponibles." con arreglo vacío
- `ProductosList` muestra "Sin conexión. Verifique su red." con TypeError de fetch
- `ProductosList` usa elementos `<ul>`, `<li>`, `<button>` (HTML5 semántico)
- `VentaForm` deshabilita el botón durante el envío (submitting = true)
- `VentaForm` muestra "Sin conexión. Verifique su red." con TypeError en POST
- `VentaForm` muestra fallback cuando la respuesta no tiene campo `message`
- `VentaForm` mantiene el listado de productos visible tras venta exitosa
- `ventasService` incluye header `Content-Type: application/json`
- `config.ts` usa `http://localhost:3000` cuando `VITE_API_BASE_URL` no está definida

### Tests de propiedades (property-based con fast-check)

Cada test de propiedad se ejecuta con mínimo 100 iteraciones. El tag de referencia sigue el formato: `Feature: pos-productos-ventas, Property {N}: {texto}`.

**Property 1 — Renderizado completo de productos**
```typescript
// Feature: pos-productos-ventas, Property 1: Complete product rendering
fc.assert(fc.property(
  fc.array(
    fc.record({
      id: fc.string({ minLength: 1 }),
      nombre: fc.string({ minLength: 1 }),
      precio: fc.float({ min: 0.01, max: 99999 }),
    }),
    { minLength: 1, maxLength: 50 }
  ),
  (productos) => {
    // Mockear fetch con HTTP 200 y el arreglo generado
    // Montar ProductosList
    // Verificar: número de <li> === productos.length
    // Verificar: cada nombre aparece en el DOM
    // Verificar: cada precio formateado aparece en el DOM
    // Verificar: número de botones de selección === productos.length
  }
), { numRuns: 100 })
```

**Property 2 — Header Authorization en servicios**
```typescript
// Feature: pos-productos-ventas, Property 2: Authorization header in services
fc.assert(fc.property(
  fc.string({ minLength: 10 }),  // JWT aleatorio
  (jwt) => {
    // Mockear useAuthStore.getState() para retornar { session: { jwt } }
    // Mockear fetch y capturar las opciones de la petición
    // Llamar getProductos() y registrarVenta({ productos: [] })
    // Verificar: headers.Authorization === `Bearer ${jwt}` en ambas llamadas
  }
), { numRuns: 100 })
```

**Property 3 — Construcción correcta de URL**
```typescript
// Feature: pos-productos-ventas, Property 3: Correct URL construction
fc.assert(fc.property(
  fc.webUrl(),  // URL base aleatoria
  (baseUrl) => {
    // Mockear import.meta.env.VITE_API_BASE_URL con baseUrl
    // Mockear fetch y capturar la URL de la petición
    // Llamar getProductos() → verificar URL === baseUrl + '/productos'
    // Llamar registrarVenta() → verificar URL === baseUrl + '/ventas'
  }
), { numRuns: 100 })
```

**Property 4 — HTTP 200 retorna arreglo sin modificación**
```typescript
// Feature: pos-productos-ventas, Property 4: HTTP 200 returns unmodified array
fc.assert(fc.property(
  fc.array(
    fc.record({
      id: fc.string({ minLength: 1 }),
      nombre: fc.string({ minLength: 1 }),
      precio: fc.float({ min: 0.01 }),
    })
  ),
  async (productos) => {
    // Mockear fetch con HTTP 200 y JSON.stringify(productos)
    // Llamar getProductos()
    // Verificar: resultado es deep-equal a productos
  }
), { numRuns: 100 })
```

**Property 5 — HTTP error en GET muestra mensaje de error**
```typescript
// Feature: pos-productos-ventas, Property 5: HTTP error shows error message
fc.assert(fc.property(
  fc.integer({ min: 400, max: 599 }),  // Código de error aleatorio
  async (statusCode) => {
    // Mockear fetch con response.ok = false y status = statusCode
    // Montar ProductosList
    // Verificar: mensaje de error visible en el DOM
  }
), { numRuns: 100 })
```

**Property 6 — Serialización correcta del body de venta**
```typescript
// Feature: pos-productos-ventas, Property 6: Correct sale body serialization
fc.assert(fc.property(
  fc.array(
    fc.record({
      id: fc.string({ minLength: 1 }),
      cantidad: fc.integer({ min: 1, max: 999 }),
    }),
    { minLength: 1, maxLength: 20 }
  ),
  async (productosSeleccionados) => {
    // Mockear fetch y capturar el body de la petición
    // Llamar registrarVenta({ productos: productosSeleccionados })
    // Verificar: JSON.parse(body) deep-equal a { productos: productosSeleccionados }
  }
), { numRuns: 100 })
```

**Property 7 — Lista vacía deshabilita el botón**
```typescript
// Feature: pos-productos-ventas, Property 7: Empty list disables confirm button
fc.assert(fc.property(
  fc.constant([]),  // Lista vacía siempre
  (_emptyList) => {
    // Montar VentaForm con selectedProducts = []
    // Verificar: botón de confirmar tiene atributo disabled
  }
), { numRuns: 100 })
```

**Property 8 — Venta exitosa muestra mensaje y limpia selección**
```typescript
// Feature: pos-productos-ventas, Property 8: Successful sale shows message and clears selection
fc.assert(fc.property(
  fc.array(
    fc.record({
      id: fc.string({ minLength: 1 }),
      cantidad: fc.integer({ min: 1 }),
    }),
    { minLength: 1, maxLength: 10 }
  ),
  fc.string({ minLength: 1 }),  // Mensaje de éxito aleatorio
  async (productosSeleccionados, mensaje) => {
    // Mockear fetch con HTTP 200 y { message: mensaje }
    // Montar VentaForm, seleccionar productosSeleccionados, confirmar venta
    // Verificar: mensaje visible en el DOM
    // Verificar: selectedProducts === []
  }
), { numRuns: 100 })
```

**Property 9 — Error en POST mantiene la selección intacta**
```typescript
// Feature: pos-productos-ventas, Property 9: POST error preserves selection
fc.assert(fc.property(
  fc.array(
    fc.record({
      id: fc.string({ minLength: 1 }),
      cantidad: fc.integer({ min: 1 }),
    }),
    { minLength: 1, maxLength: 10 }
  ),
  fc.integer({ min: 400, max: 599 }),
  async (productosSeleccionados, statusCode) => {
    // Mockear fetch con response.ok = false y status = statusCode
    // Montar VentaForm, seleccionar productosSeleccionados, confirmar venta
    // Verificar: selectedProducts sigue siendo igual a productosSeleccionados
  }
), { numRuns: 100 })
```

**Property 10 — Config retorna el valor de VITE_API_BASE_URL**
```typescript
// Feature: pos-productos-ventas, Property 10: Config returns VITE_API_BASE_URL value
fc.assert(fc.property(
  fc.webUrl(),  // URL aleatoria
  (url) => {
    // Mockear import.meta.env.VITE_API_BASE_URL con url
    // Importar API_BASE_URL de config.ts
    // Verificar: API_BASE_URL === url
  }
), { numRuns: 100 })
```

### Cobertura objetivo

| Módulo | Unit tests | Property tests |
|---|---|---|
| `config.ts` | 1 (fallback) | 1 (P10) |
| `productosService.ts` | 2 (red, Content-Type) | 3 (P2, P3, P4) |
| `ventasService.ts` | 2 (Content-Type, red) | 3 (P2, P3, P6) |
| `ProductosList.tsx` | 3 (loading, vacío, red) | 2 (P1, P5) |
| `VentaForm.tsx` | 4 (submitting, red, fallback, productos visibles) | 3 (P7, P8, P9) |
