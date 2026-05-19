# POS Frontend - Design Specification

## 1. Architectural Overview
Aplicacion SPA construida con React + TypeScript + Vite para un terminal POS de supermercado.

Patrones:
- UI por dominios (`layout`, `products`, `cart`, `checkout`, `receipt`).
- Estado global en store unico con Zustand.
- Modelo de datos tipado en `src/types/index.ts`.
- Persistencia local para operacion offline core.

## 2. Technology Stack
- Framework: React 18
- Build: Vite 6
- Language: TypeScript strict
- UI: PrimeReact + PrimeFlex + CSS custom properties
- State management: Zustand
- Utility: date-fns, uuid

## 3. Module Design

### 3.1 App Shell
Archivo: `src/App.tsx`

Responsabilidades:
- Componer layout principal (header + catalogo + carrito).
- Montar dialogs de checkout y recibo.
- Mantener toasts para feedback de operaciones.

### 3.2 Product Domain
Archivos:
- `src/components/products/ProductCatalog.tsx`
- `src/components/products/ProductGrid.tsx`
- `src/components/products/ProductCard.tsx`
- `src/components/products/CategoryFilter.tsx`
- `src/components/products/BarcodeScanner.tsx`
- `src/data/products.ts`

Responsabilidades:
- Filtrado local por texto y categoria.
- Alta al carrito por click en tarjeta de producto.
- Captura de codigo manual y escaneo por camara (`getUserMedia` + ZXing browser).
- Diagnostico de precondiciones de escaneo (secure context, permisos, permissions policy/iframe).
- Fallback funcional cuando la camara no esta disponible.

### 3.3 Cart Domain
Archivos:
- `src/components/cart/ShoppingCart.tsx`
- `src/components/cart/CartItem.tsx`
- `src/components/cart/DiscountInput.tsx`
- `src/components/cart/CartSummary.tsx`

Responsabilidades:
- Render del carrito actual.
- Edicion de cantidades y eliminacion de items.
- Aplicacion/remocion de descuento.
- Visualizacion de subtotal, impuesto, descuento y total.

### 3.4 Checkout Domain
Archivo: `src/components/checkout/CheckoutDialog.tsx`

Responsabilidades:
- Captura de pago por efectivo, tarjeta o mixto.
- Validacion por metodo antes de confirmar.
- Llamada a `processPayment` en el store.

### 3.5 Receipt Domain
Archivo: `src/components/receipt/ReceiptDialog.tsx`

Responsabilidades:
- Mostrar comprobante post-cobro.
- Presentar desglose de items y pagos.
- Acciones: imprimir o iniciar nueva venta.

### 3.6 Global Store
Archivo: `src/store/posStore.ts`

Estado:
- `cart`, `appliedDiscount`, `transactions`, `isCheckoutOpen`, `currentReceipt`.

Acciones:
- `addToCart`, `removeFromCart`, `updateQuantity`, `clearCart`.
- `applyDiscount`, `removeDiscount`.
- `openCheckout`, `closeCheckout`, `processPayment`.

Selectores/computados:
- `getSubtotal`, `getTaxTotal`, `getDiscountTotal`, `getTotal`, `getCartCount`.

Persistencia:
- Middleware `persist` + `localStorage`.
- Persistencia parcial de `cart`, `appliedDiscount`, `transactions`.
- Rehidratacion de fechas de transacciones (`timestamp`).

### 3.7 Connectivity UX
Archivo: `src/components/layout/Header.tsx`

Responsabilidades:
- Indicador visual online/offline.
- Mantener operacion local aunque haya desconexion.

## 4. Data Model
Tipos en `src/types/index.ts`:
- `Product`
- `CartItem`
- `Discount`
- `Transaction`
- `PaymentMethod`: `efectivo | tarjeta | mixto`
- `PaymentDetails`

Reglas de negocio:
- Subtotal item = `quantity * product.price`
- Impuesto item = `subtotal * product.taxRate`
- Total = `subtotal + impuestos - descuento`
- Metodo mixto requiere `cashAmount` y `cardAmount` positivos.

## 5. Data Flow
1. Usuario busca o escanea producto.
2. UI despacha `addToCart`.
3. Store recalcula derivados por selectores.
4. Carrito y resumen se actualizan en tiempo real.
5. Checkout valida metodo y ejecuta `processPayment`.
6. Store crea `Transaction`, limpia carrito y abre recibo.
7. Recibo presenta venta y permite imprimir.

## 6. Error Handling
- Escaneo no compatible -> mensaje de fallback.
- Sin permisos de camara -> mensaje de error y continuidad manual.
- Camara bloqueada por Permissions Policy/iframe -> mensaje de apertura en pestana externa.
- Camara ocupada por otra aplicacion -> mensaje especifico.
- Codigo de descuento invalido -> mensaje inline.
- Inputs de pago invalidos -> boton confirmar deshabilitado.

## 7. Quality Attributes Mapping
- Rendimiento: filtrado local + UI reactiva.
- Resiliencia: persistencia local y degradacion graceful de camara.
- Mantenibilidad: separacion por dominios + tipado estricto.
- Escalabilidad: modular para conectar API de inventario en siguientes fases.
