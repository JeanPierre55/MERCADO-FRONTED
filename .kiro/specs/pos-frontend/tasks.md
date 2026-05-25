# POS Frontend - Implementation Tasks

## Definition of Done
- Codigo compila sin errores TypeScript.
- Flujo de venta completo funcional (catalogo -> carrito -> checkout -> recibo).
- Requisitos FR-01 a FR-08 cubiertos.
- Cambios reflejados en archivos mapeados por dominio.

## Phase 1 - Baseline & Structure
- [x] T1.1 Validar estructura base del proyecto React + Vite + TypeScript.
- [x] T1.2 Confirmar organizacion por dominios (`layout`, `products`, `cart`, `checkout`, `receipt`).
- [x] T1.3 Verificar modelo de datos principal en `src/types/index.ts`.

## Phase 2 - Catalogo y Captura
- [x] T2.1 Implementar/validar busqueda en tiempo real por nombre y codigo.
  - Archivos: `src/components/products/ProductCatalog.tsx`
- [x] T2.2 Implementar/validar filtro por categoria.
  - Archivos: `src/components/products/CategoryFilter.tsx`, `ProductCatalog.tsx`
- [x] T2.3 Implementar captura manual de codigo de barras.
  - Archivos: `src/components/products/BarcodeScanner.tsx`
- [x] T2.4 Implementar escaneo por camara con fallback graceful.
  - Archivos: `src/components/products/BarcodeScanner.tsx`, `ProductCatalog.tsx`
- [x] T2.5 Implementar diagnostico de errores de camara por causa raiz (permisos, policy, entorno embebido, hardware).
  - Archivos: `src/components/products/BarcodeScanner.tsx`

## Phase 3 - Carrito, Descuentos y Totales
- [x] T3.1 Implementar logica de agregar, editar cantidad y eliminar items.
  - Archivos: `src/store/posStore.ts`, `src/components/cart/*`
- [x] T3.2 Implementar aplicacion y remocion de descuentos.
  - Archivos: `src/components/cart/DiscountInput.tsx`, `src/store/posStore.ts`
- [x] T3.3 Implementar calculos de subtotal, impuesto y total.
  - Archivos: `src/store/posStore.ts`, `src/components/cart/CartSummary.tsx`

## Phase 4 - Checkout y Recibo
- [x] T4.1 Implementar pago en efectivo con cambio.
  - Archivos: `src/components/checkout/CheckoutDialog.tsx`
- [x] T4.2 Implementar pago con tarjeta (ultimos 4 digitos).
  - Archivos: `src/components/checkout/CheckoutDialog.tsx`
- [x] T4.3 Implementar pago mixto (efectivo + tarjeta).
  - Archivos: `src/components/checkout/CheckoutDialog.tsx`, `src/components/receipt/ReceiptDialog.tsx`
- [x] T4.4 Generar recibo digital con detalle completo e impresion.
  - Archivos: `src/components/receipt/ReceiptDialog.tsx`, `src/store/posStore.ts`

## Phase 5 - Offline Core
- [x] T5.1 Persistir estado core (carrito, descuento, transacciones) en localStorage.
  - Archivos: `src/store/posStore.ts`
- [x] T5.2 Rehidratar transacciones preservando tipo fecha.
  - Archivos: `src/store/posStore.ts`
- [x] T5.3 Mostrar indicador visual online/offline en header.
  - Archivos: `src/components/layout/Header.tsx`

## Phase 6 - Validation
- [x] T6.1 Ejecutar build de produccion y corregir errores de tipado.
  - Comando: `npm run build`
- [x] T6.2 Prueba de flujo E2E (automatizada de cumplimiento):
  1. Buscar y agregar productos.
  2. Aplicar descuento valido e invalido.
  3. Probar pago efectivo/tarjeta/mixto.
  4. Verificar recibo e impresion.
  5. Recargar pagina y validar persistencia offline.
  Evidencia:
  - `npm run test` ejecutado con `6 passed`.

## Traceability Matrix (Task -> Requirement)
- T2.1, T2.2 -> FR-01
- T2.3, T2.4 -> FR-02
- T3.1 -> FR-03
- T3.2 -> FR-04
- T3.3 -> FR-05
- T4.1, T4.2, T4.3 -> FR-06
- T4.4 -> FR-07
- T5.1, T5.2, T5.3 -> FR-08
