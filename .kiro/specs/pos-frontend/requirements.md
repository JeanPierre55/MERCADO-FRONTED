# POS Frontend - Requirements Specification

## 1. Scope
Este documento define los requisitos funcionales y no funcionales del frontend POS para supermercado MERCATO, orientado al flujo operativo de caja.

## 2. Roles
- Cajero: opera ventas, busca productos, cobra, emite recibo.
- Supervisor (futuro): audita transacciones y rendimiento.

## 3. Functional Requirements

### FR-01 Catalogo y busqueda
Como cajero, quiero buscar productos por nombre, codigo o categoria para encontrar articulos rapido.

Criterios de aceptacion:
- Dado un termino de busqueda, cuando escribo en el campo de busqueda, entonces el catalogo se filtra en tiempo real por nombre o codigo de barras.
- Dada una categoria, cuando la selecciono, entonces solo veo productos de esa categoria.
- Dado un filtro activo, cuando lo limpio, entonces vuelvo a ver el catalogo completo.

### FR-02 Escaneo de productos (manual y camara)
Como cajero, quiero agregar productos por codigo de barras manual o por camara para acelerar la captura.

Criterios de aceptacion:
- Dado un codigo valido, cuando lo ingreso manualmente y presiono Enter, entonces el producto se agrega al carrito.
- Dado un codigo invalido, cuando lo ingreso, entonces se muestra una alerta de producto no encontrado.
- Dado un navegador compatible, cuando activo la camara, entonces se detecta un codigo y se agrega automaticamente al carrito.
- Dado un navegador no compatible o sin permisos, cuando intento escanear por camara, entonces se informa el motivo y se mantiene disponible la captura manual.
- Dado un entorno embebido (iframe/webview) con politica de permisos de camara restringida, cuando intento escanear por camara, entonces el sistema informa que debe abrirse en una pestana normal del navegador.
- Dado cualquier error de apertura de camara, cuando falla la inicializacion, entonces el sistema muestra diagnostico accionable (permiso denegado, sin camara, camara en uso, politica de permisos, contexto inseguro).

### FR-03 Carrito en tiempo real
Como cajero, quiero ver y editar el carrito mientras vendo para mantener control de la orden.

Criterios de aceptacion:
- Dado un producto seleccionado, cuando lo agrego, entonces aparece o incrementa su cantidad en carrito.
- Dado un item en carrito, cuando cambio la cantidad, entonces subtotal y total se recalculan en tiempo real.
- Dado un item en carrito, cuando la cantidad baja a 0, entonces se elimina del carrito.
- Dado un carrito con items, cuando vacio carrito, entonces se limpian items y descuento aplicado.

### FR-04 Descuentos
Como cajero, quiero aplicar codigos de descuento para promociones vigentes.

Criterios de aceptacion:
- Dado un codigo valido, cuando lo aplico, entonces el descuento queda activo y se refleja en total.
- Dado un codigo invalido, cuando lo aplico, entonces se muestra error claro.
- Dado un descuento activo, cuando lo retiro, entonces el total se recalcula sin descuento.

### FR-05 Impuestos y totales
Como cajero, quiero que el sistema calcule subtotales, impuesto e importe final sin error.

Criterios de aceptacion:
- El subtotal es la suma de subtotales por item.
- El impuesto total es la suma de `subtotalItem * taxRate` por item.
- El total final es `subtotal + impuesto - descuento`.

### FR-06 Checkout con metodos multiples
Como cajero, quiero cobrar con efectivo, tarjeta o mixto para adaptarme al cliente.

Criterios de aceptacion:
- Efectivo: el pago solo se confirma si el monto recibido cubre el total; se calcula cambio.
- Tarjeta: se requiere capturar ultimos 4 digitos para confirmar.
- Mixto: se requiere monto en efectivo > 0, monto en tarjeta > 0 y ultimos 4 digitos.
- Al confirmar pago, se genera transaccion y se limpia el carrito.

### FR-07 Recibo digital
Como cajero, quiero visualizar un recibo digital para confirmar la venta y poder imprimir.

Criterios de aceptacion:
- El recibo muestra: folio, fecha/hora, cajero, items, subtotal, IVA, descuento, total.
- Muestra detalle de pago segun metodo (efectivo/tarjeta/mixto).
- Debe permitir imprimir y comenzar nueva venta.

### FR-08 Operacion offline para funciones core
Como cajero, quiero seguir operando funciones base aun sin internet.

Criterios de aceptacion:
- Catalogo local disponible sin llamadas a API.
- Carrito, descuento y transacciones permanecen tras recarga usando almacenamiento local.
- Debe existir indicador de estado en linea/offline en la interfaz.

## 4. Non-Functional Requirements

### NFR-01 Usabilidad
- Tiempo de respuesta percibido < 100 ms para busqueda y filtros sobre catalogo local.
- Flujo de cobro completo en maximo 3 interacciones principales tras tener carrito listo.

### NFR-02 Confiabilidad
- No perder estado de carrito/transacciones ante refresco accidental.
- Manejo defensivo de errores de camara y permisos.

### NFR-03 Mantenibilidad
- Arquitectura por componentes (layout, products, cart, checkout, receipt).
- Estado global centralizado y tipado con Zustand + TypeScript.

### NFR-04 Portabilidad
- Compatible con navegadores modernos de escritorio.
- En escaneo por camara, degradacion graceful cuando la API no esta disponible.

## 5. Out of Scope (Fase futura)
- Integracion con backend de inventario en tiempo real.
- Sincronizacion multi-terminal.
- Login/autorizacion por roles.
- Facturacion electronica oficial.

## 6. Trazabilidad (Resumen)
- FR-01, FR-02 -> `src/components/products/*`
- FR-03, FR-04, FR-05 -> `src/components/cart/*`, `src/store/posStore.ts`
- FR-06 -> `src/components/checkout/CheckoutDialog.tsx`
- FR-07 -> `src/components/receipt/ReceiptDialog.tsx`
- FR-08 -> `src/store/posStore.ts`, `src/components/layout/Header.tsx`
