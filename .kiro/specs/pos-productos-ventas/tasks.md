# Plan de Implementación: POS Productos & Ventas

## Descripción general

Implementar el módulo de consulta de productos y registro de ventas para el sistema POS MERCATO. El módulo introduce dos servicios HTTP (`productosService`, `ventasService`), un módulo de configuración centralizado (`config.ts`), dos componentes React (`ProductosList`, `VentaForm`), y modifica `App.tsx` para integrarlos. Todos los servicios se autentican con el JWT del `Auth_Store` existente.

## Tareas

- [x] 1. Crear módulo de configuración centralizado
  - Crear `src/config.ts` que lea `VITE_API_BASE_URL` de `import.meta.env`
  - Exportar `API_BASE_URL` con fallback a `http://localhost:3000`
  - Crear `.env.example` con `VITE_API_BASE_URL=https://bvqj72xsqk.execute-api.us-east-1.amazonaws.com/prod`
  - _Requirements: 6.1, 6.2, 6.5_

- [x] 2. Implementar servicios HTTP
  - [x] 2.1 Crear `src/services/productosService.ts`
    - Definir interfaz `Producto` con campos `id`, `nombre`, `precio`
    - Implementar `getProductos()` con `fetch` + `async/await` + `try/catch`
    - Incluir header `Authorization: Bearer {jwt}` leyendo de `useAuthStore.getState()`
    - Construir URL concatenando `API_BASE_URL` + `/productos`
    - Lanzar `Error('Sin conexión. Verifique su red.')` en `TypeError` de red
    - _Requirements: 1.1, 1.2, 1.3, 1.4, 1.7, 6.3_

  - [ ]* 2.2 Escribir test de propiedad para `productosService` — Header Authorization
    - **Property 2: Header Authorization en servicios**
    - **Validates: Requirements 1.3**

  - [ ]* 2.3 Escribir test de propiedad para `productosService` — Construcción de URL
    - **Property 3: Construcción correcta de URL**
    - **Validates: Requirements 6.3**

  - [ ]* 2.4 Escribir test de propiedad para `productosService` — HTTP 200 sin modificación
    - **Property 4: HTTP 200 retorna arreglo sin modificación**
    - **Validates: Requirements 1.4**

  - [x] 2.5 Crear `src/services/ventasService.ts`
    - Definir interfaces `ProductoSeleccionado`, `VentaRequest`, `VentaResponse`
    - Implementar `registrarVenta(venta: VentaRequest)` con `fetch` + `async/await` + `try/catch`
    - Incluir headers `Authorization: Bearer {jwt}` y `Content-Type: application/json`
    - Construir URL concatenando `API_BASE_URL` + `/ventas`
    - Lanzar `Error('Sin conexión. Verifique su red.')` en `TypeError` de red
    - _Requirements: 3.1, 3.2, 3.3, 3.4, 5.2, 6.4_

  - [ ]* 2.6 Escribir test de propiedad para `ventasService` — Serialización del body
    - **Property 6: Serialización correcta del body de venta**
    - **Validates: Requirements 3.1**

- [x] 3. Checkpoint — Verificar servicios
  - Asegurarse de que los servicios compilan sin errores TypeScript, preguntar al usuario si hay dudas.

- [x] 4. Implementar componente `ProductosList`
  - [x] 4.1 Crear `src/components/ProductosList.tsx`
    - Usar `useState` para `productos`, `loading`, `error`
    - Usar `useEffect` para disparar `getProductos()` al montar
    - Renderizar `<ul>` / `<li>` con nombre, precio formateado y botón de selección
    - Mostrar spinner/indicador de carga mientras `loading === true`
    - Mostrar mensaje de error cuando `error !== null`
    - Mostrar "No hay productos disponibles." cuando el arreglo esté vacío
    - Aplicar estilos con variables CSS y Flexbox
    - Recibir prop `onProductoSeleccionado: (producto: Producto) => void`
    - _Requirements: 1.5, 1.6, 1.7, 2.1, 2.2, 2.3, 2.4, 2.5, 2.6, 2.7, 8.1, 8.2_

  - [ ]* 4.2 Escribir test de propiedad para `ProductosList` — Renderizado completo
    - **Property 1: Renderizado completo de productos**
    - **Validates: Requirements 2.1, 2.2, 2.3, 2.4**

  - [ ]* 4.3 Escribir test de propiedad para `ProductosList` — HTTP error muestra error
    - **Property 5: HTTP error en GET muestra mensaje de error**
    - **Validates: Requirements 1.6**

  - [ ]* 4.4 Escribir tests unitarios para `ProductosList`
    - Test: muestra indicador de carga mientras fetch no resuelve
    - Test: muestra "No hay productos disponibles." con arreglo vacío
    - Test: muestra "Sin conexión. Verifique su red." con TypeError
    - Test: usa elementos `<ul>`, `<li>`, `<button>` (HTML5 semántico)
    - _Requirements: 1.5, 1.7, 2.5, 2.7_

- [x] 5. Implementar componente `VentaForm`
  - [x] 5.1 Crear `src/components/VentaForm.tsx`
    - Usar `useState` para `selectedProducts`, `submitting`, `successMessage`, `errorMessage`
    - Recibir lista de productos disponibles como prop desde `ProductosList`
    - Permitir agregar/quitar productos con cantidad
    - Deshabilitar botón de confirmar cuando `selectedProducts` esté vacío o `submitting === true`
    - Llamar `registrarVenta()` al confirmar, con `try/catch`
    - En éxito: mostrar `message` de la API, limpiar `selectedProducts`
    - En error HTTP: mostrar mensaje descriptivo, mantener `selectedProducts`
    - En error de red: mostrar "Sin conexión. Verifique su red.", mantener `selectedProducts`
    - Mostrar mensajes de éxito en verde y errores en rojo
    - _Requirements: 3.1, 3.5, 3.6, 4.1, 4.2, 4.3, 4.4, 5.1, 5.2, 5.3, 5.4, 5.5, 8.3, 8.4_

  - [ ]* 5.2 Escribir test de propiedad para `VentaForm` — Lista vacía deshabilita botón
    - **Property 7: Lista vacía deshabilita el botón de confirmar venta**
    - **Validates: Requirements 3.6**

  - [ ]* 5.3 Escribir test de propiedad para `VentaForm` — Venta exitosa muestra mensaje y limpia
    - **Property 8: Venta exitosa muestra mensaje y limpia la selección**
    - **Validates: Requirements 4.1, 4.2**

  - [ ]* 5.4 Escribir test de propiedad para `VentaForm` — Error mantiene selección intacta
    - **Property 9: Error en POST mantiene la selección intacta**
    - **Validates: Requirements 5.5**

  - [ ]* 5.5 Escribir tests unitarios para `VentaForm`
    - Test: botón disabled durante envío (`submitting = true`)
    - Test: muestra "Sin conexión. Verifique su red." con TypeError en POST
    - Test: muestra fallback cuando respuesta no tiene campo `message`
    - Test: mantiene listado de productos visible tras venta exitosa
    - _Requirements: 3.5, 5.2, 5.3, 4.4_

- [x] 6. Checkpoint — Verificar componentes
  - Asegurarse de que los componentes compilan sin errores TypeScript, preguntar al usuario si hay dudas.

- [x] 7. Integrar módulo en `App.tsx`
  - [x] 7.1 Modificar `src/App.tsx` para integrar `ProductosList` y `VentaForm`
    - Importar `ProductosList` y `VentaForm`
    - Gestionar estado compartido `selectedProducts` en `App.tsx` o mediante props
    - Mantener la funcionalidad existente (ProductCatalog, ShoppingCart, CheckoutDialog, ReceiptDialog)
    - Añadir sección de API de productos y ventas sin romper el layout existente
    - _Requirements: 7.3, 7.4_

- [ ] 8. Crear documentación del proyecto
  - [x] 8.1 Crear `README.md` con documentación completa
    - Descripción del proyecto POS MERCATO
    - Arquitectura cliente-servidor con diagrama
    - Justificación del framework React
    - Instrucciones de instalación: `npm install` y `npm run dev`
    - Configuración de variables de entorno con URL real de AWS
    - Explicación del proceso SDD (Spec-Driven Development)
    - Estructura del proyecto
    - _Requirements: 7.1, 7.2, 7.3, 7.4, 7.5_

- [x] 9. Checkpoint final — Verificar integración completa
  - Asegurarse de que todos los archivos compilan, los tests pasan y la aplicación funciona correctamente. Preguntar al usuario si hay dudas.

## Notas

- Las tareas marcadas con `*` son opcionales y pueden omitirse para un MVP más rápido
- Cada tarea referencia requisitos específicos para trazabilidad
- Los servicios leen el JWT directamente de `useAuthStore.getState().session?.jwt`
- Los componentes usan HTML5 semántico y CSS con variables CSS existentes del proyecto
- No se agregan dependencias nuevas de UI; se usa PrimeReact ya instalado
- Los tests de propiedades usan `fast-check` ya instalado como devDependency
