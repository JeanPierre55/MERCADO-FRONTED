# Requirements Document — POS Login & Auth

## Introduction

Esta funcionalidad agrega autenticación basada en roles al sistema POS MERCATO. Actualmente el sistema opera sin login; se requiere una pantalla de acceso que distinga entre el rol **Administrador** y el rol **Cajero**, consuma una API REST del backend Java, registre las llamadas HTTP en el Network tab del navegador, y emita trazas de consola en las operaciones clave del flujo de venta (agregar al carrito y procesar pago).

El sistema mantiene la paleta de colores y el sistema de diseño existente (`--pos-accent`, `--pos-bg-primary`, etc.).

---

## Glossary

- **Auth_Service**: Módulo frontend responsable de realizar las llamadas HTTP de autenticación contra la API REST del backend Java.
- **Auth_Store**: Store de estado global (Zustand) que gestiona la sesión activa, el token JWT y el rol del usuario.
- **Login_Screen**: Pantalla de acceso que se muestra antes de que el usuario pueda operar el POS.
- **POS_App**: La aplicación React/TypeScript/Vite del punto de venta MERCATO.
- **Backend_API**: Servicio REST Java que expone los endpoints de autenticación y otros recursos del sistema.
- **JWT**: JSON Web Token emitido por el Backend_API tras una autenticación exitosa.
- **Role**: Valor que identifica el nivel de acceso del usuario; puede ser `ADMIN` o `CASHIER`.
- **Protected_Route**: Ruta o vista de la POS_App que solo es accesible con una sesión activa.
- **Cart_Logger**: Módulo de trazabilidad que registra en `console` los eventos del carrito.
- **Checkout_Logger**: Módulo de trazabilidad que registra en `console` los eventos de pago.
- **Session**: Estado activo de autenticación que incluye el JWT, el rol y los datos del usuario.

---

## Requirements

### Requirement 1: Pantalla de Login

**User Story:** Como cajero o administrador, quiero ver una pantalla de login al abrir el POS, para que solo usuarios autorizados puedan operar el sistema.

#### Acceptance Criteria

1. THE Login_Screen SHALL renderizarse usando la paleta de colores CSS del sistema POS (`--pos-bg-primary`, `--pos-accent`, `--pos-border`, `--pos-text-primary`, etc.).
2. THE Login_Screen SHALL presentar un campo de nombre de usuario, un campo de contraseña y un botón de acceso.
3. WHEN el POS_App se inicializa sin una sesión activa, THE Login_Screen SHALL mostrarse en lugar de la interfaz principal del POS.
4. WHEN el POS_App se inicializa con una sesión activa válida, THE POS_App SHALL mostrar directamente la interfaz principal sin pasar por el Login_Screen.
5. WHILE el Login_Screen está visible, THE POS_App SHALL impedir el acceso a cualquier Protected_Route.
6. IF el campo de nombre de usuario o el campo de contraseña están vacíos al intentar acceder, THEN THE Login_Screen SHALL deshabilitar el botón de acceso.

---

### Requirement 2: Autenticación contra la API REST

**User Story:** Como operador del sistema, quiero que el login realice una llamada HTTP real al Backend_API, para que las credenciales sean validadas de forma centralizada y la llamada sea visible en el Network tab del navegador.

#### Acceptance Criteria

1. WHEN el usuario envía el formulario de login con credenciales, THE Auth_Service SHALL realizar una petición `POST` al endpoint `/api/auth/login` del Backend_API con las credenciales en el cuerpo de la solicitud en formato JSON.
2. THE Auth_Service SHALL usar `fetch` nativo del navegador (o `axios`) para que la llamada HTTP sea registrada en el Network tab del navegador.
3. WHEN el Backend_API responde con código HTTP 200, THE Auth_Service SHALL extraer el JWT y el Role del cuerpo de la respuesta.
4. WHEN el Backend_API responde con código HTTP 401, THEN THE Login_Screen SHALL mostrar el mensaje de error devuelto por el Backend_API o, en su ausencia, el mensaje "Credenciales incorrectas".
5. IF el Backend_API no responde en 10 segundos, THEN THE Auth_Service SHALL cancelar la petición y THE Login_Screen SHALL mostrar el mensaje "El servidor no responde. Intente nuevamente.".
6. IF ocurre un error de red (sin conectividad), THEN THE Auth_Service SHALL capturar la excepción y THE Login_Screen SHALL mostrar el mensaje "Sin conexión. Verifique su red.".
7. WHILE la petición de login está en curso, THE Login_Screen SHALL mostrar un indicador de carga y deshabilitar el botón de acceso para evitar envíos duplicados.

---

### Requirement 3: Gestión de Sesión y Roles

**User Story:** Como sistema, quiero almacenar y gestionar la sesión del usuario autenticado, para que el rol determine las funcionalidades disponibles y la sesión persista durante el uso normal.

#### Acceptance Criteria

1. WHEN la autenticación es exitosa, THE Auth_Store SHALL almacenar el JWT, el Role y los datos del usuario en el estado de la aplicación.
2. THE Auth_Store SHALL persistir la sesión en `sessionStorage` para que sobreviva recargas de página dentro de la misma pestaña del navegador.
3. WHEN el usuario cierra la pestaña del navegador, THE Auth_Store SHALL eliminar la sesión almacenada en `sessionStorage`.
4. THE Auth_Store SHALL exponer el Role activo para que los componentes de la POS_App puedan adaptar su comportamiento.
5. WHEN el usuario con Role `CASHIER` está autenticado, THE POS_App SHALL mostrar la interfaz de venta completa (catálogo, carrito, checkout).
6. WHEN el usuario con Role `ADMIN` está autenticado, THE POS_App SHALL mostrar la interfaz de venta completa más un indicador visual que identifique el acceso de administrador.
7. WHEN el JWT almacenado ha expirado al inicializar la POS_App, THE Auth_Store SHALL eliminar la sesión y THE Login_Screen SHALL mostrarse.

---

### Requirement 4: Cierre de Sesión

**User Story:** Como cajero o administrador, quiero poder cerrar sesión desde la interfaz principal, para que otro usuario pueda autenticarse en el mismo terminal.

#### Acceptance Criteria

1. THE POS_App SHALL mostrar un control de cierre de sesión visible en el Header mientras haya una sesión activa.
2. WHEN el usuario activa el cierre de sesión, THE Auth_Store SHALL eliminar el JWT, el Role y los datos del usuario del estado y del `sessionStorage`.
3. WHEN la sesión es eliminada, THE POS_App SHALL redirigir al Login_Screen sin recargar la página.
4. WHEN el usuario cierra sesión con items en el carrito, THE POS_App SHALL mostrar un diálogo de confirmación antes de proceder con el cierre de sesión.

---

### Requirement 5: Registro en Consola — Agregar Producto al Carrito

**User Story:** Como desarrollador o supervisor técnico, quiero que cada adición de producto al carrito genere una traza en la consola del navegador, para facilitar la depuración y el monitoreo del flujo de venta.

#### Acceptance Criteria

1. WHEN un producto es agregado al carrito, THE Cart_Logger SHALL emitir un mensaje en `console.log` con el formato: `[POS][CART] Producto agregado: {nombre} (id: {id}) | Cantidad: {cantidad} | Subtotal: {subtotal}`.
2. WHEN un producto ya existente en el carrito incrementa su cantidad, THE Cart_Logger SHALL emitir un mensaje en `console.log` con el formato: `[POS][CART] Cantidad actualizada: {nombre} (id: {id}) | Nueva cantidad: {cantidad} | Nuevo subtotal: {subtotal}`.
3. THE Cart_Logger SHALL incluir en cada mensaje el nombre de usuario autenticado activo en la sesión.
4. THE Cart_Logger SHALL emitir los mensajes de consola de forma síncrona con la operación de adición al carrito, sin retraso observable.

---

### Requirement 6: Registro en Consola — Proceso de Pago (Checkout)

**User Story:** Como desarrollador o supervisor técnico, quiero que el proceso de pago genere trazas en la consola del navegador, para auditar el flujo de checkout y detectar anomalías.

#### Acceptance Criteria

1. WHEN el usuario inicia el proceso de checkout, THE Checkout_Logger SHALL emitir un mensaje en `console.log` con el formato: `[POS][CHECKOUT] Inicio de pago | Total: {total} | Método: {método} | Cajero: {usuario}`.
2. WHEN el pago es procesado exitosamente, THE Checkout_Logger SHALL emitir un mensaje en `console.log` con el formato: `[POS][CHECKOUT] Pago completado | Folio: {receiptNumber} | Total: {total} | Método: {método}`.
3. IF el proceso de pago falla por error de validación, THEN THE Checkout_Logger SHALL emitir un mensaje en `console.warn` con el formato: `[POS][CHECKOUT] Error de validación: {descripción del error}`.
4. THE Checkout_Logger SHALL incluir en cada mensaje el timestamp ISO 8601 del momento del evento.
5. THE Checkout_Logger SHALL incluir en cada mensaje el nombre de usuario autenticado activo en la sesión.

---

### Requirement 7: Integración con Backend Java — Contrato de API

**User Story:** Como equipo de desarrollo, quiero que el frontend consuma la API REST del backend Java siguiendo un contrato definido, para garantizar la interoperabilidad entre ambas capas.

#### Acceptance Criteria

1. THE Auth_Service SHALL enviar las peticiones de autenticación con el header `Content-Type: application/json`.
2. THE Auth_Service SHALL incluir el JWT en el header `Authorization: Bearer {token}` en todas las peticiones a endpoints protegidos del Backend_API.
3. WHEN el Backend_API responde con código HTTP 403, THEN THE POS_App SHALL mostrar un mensaje de acceso denegado y redirigir al Login_Screen.
4. THE Auth_Service SHALL leer la URL base del Backend_API desde una variable de entorno (`VITE_API_BASE_URL`) para soportar distintos entornos (desarrollo, producción).
5. WHERE la variable de entorno `VITE_API_BASE_URL` no esté definida, THE Auth_Service SHALL usar `http://localhost:8080` como URL base por defecto.
6. THE Auth_Service SHALL serializar y deserializar los cuerpos de petición y respuesta en formato JSON.

---

### Requirement 8: Seguridad de la Sesión

**User Story:** Como administrador del sistema, quiero que la sesión sea manejada de forma segura en el frontend, para reducir el riesgo de acceso no autorizado.

#### Acceptance Criteria

1. THE Auth_Store SHALL almacenar el JWT únicamente en `sessionStorage`, no en `localStorage`, para limitar la exposición ante ataques XSS persistentes.
2. THE POS_App SHALL no mostrar el valor del JWT en ningún elemento visible de la interfaz de usuario.
3. WHEN el JWT expira durante una sesión activa y el usuario intenta realizar una operación protegida, THE Auth_Service SHALL detectar la respuesta HTTP 401 del Backend_API, eliminar la sesión y redirigir al Login_Screen.
4. THE Login_Screen SHALL no almacenar la contraseña del usuario en ningún estado de React, store de Zustand ni almacenamiento del navegador tras completar el proceso de autenticación.
