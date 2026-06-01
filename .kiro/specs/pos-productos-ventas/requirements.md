# Requirements Document — POS Productos & Ventas

## Introduction

Esta funcionalidad extiende el sistema POS MERCATO con la capacidad de consultar productos desde una API REST alojada en AWS API Gateway y registrar ventas a través de la misma API. El sistema ya cuenta con autenticación basada en roles (spec `pos-login-auth`); este módulo se integra con el `Auth_Store` existente para incluir el JWT en cada llamada HTTP.

La evaluación académica requiere una arquitectura cliente-servidor donde el frontend React consulta `GET /productos` para mostrar el catálogo y envía `POST /ventas` para registrar una venta. La URL base de la API se configura mediante la variable de entorno `VITE_API_BASE_URL`.

---

## Glossary

- **Productos_Service**: Módulo frontend responsable de realizar la llamada `GET /productos` a la API Gateway y retornar la lista de productos disponibles.
- **Ventas_Service**: Módulo frontend responsable de realizar la llamada `POST /ventas` a la API Gateway y retornar la confirmación de la venta registrada.
- **ProductosList**: Componente React que muestra el listado de productos obtenidos de la API, con nombre, precio y botón de selección por cada producto.
- **VentaForm**: Componente React que gestiona la selección de productos, la cantidad y el envío de la venta al backend.
- **Auth_Store**: Store Zustand existente (spec `pos-login-auth`) que expone la sesión activa, incluyendo el JWT para peticiones autenticadas.
- **API_Gateway**: Servicio AWS API Gateway que expone los endpoints `GET /productos` y `POST /ventas`.
- **Producto**: Entidad con campos `id` (string), `nombre` (string) y `precio` (number) retornada por la API.
- **Venta**: Entidad que representa una transacción registrada; contiene una lista de productos con sus cantidades.
- **Config**: Módulo `src/config.ts` que centraliza la lectura de variables de entorno, incluyendo `VITE_API_BASE_URL`.
- **JWT**: JSON Web Token almacenado en el `Auth_Store` que se incluye en el header `Authorization` de cada petición a la API.

---

## Requirements

### Requirement 1: Consulta de Productos desde la API

**User Story:** Como cajero, quiero que el sistema consulte automáticamente el catálogo de productos desde la API Gateway al cargar la pantalla de ventas, para que siempre vea los productos actualizados sin intervención manual.

#### Acceptance Criteria

1. WHEN el componente `ProductosList` se monta, THE `Productos_Service` SHALL realizar una petición `GET` al endpoint `/productos` de la `API_Gateway`.
2. THE `Productos_Service` SHALL usar `fetch` nativo del navegador con `async/await` para que la llamada sea visible en el Network tab del navegador.
3. THE `Productos_Service` SHALL incluir el header `Authorization: Bearer {jwt}` en la petición, leyendo el JWT del `Auth_Store`.
4. WHEN la `API_Gateway` responde con código HTTP 200, THE `Productos_Service` SHALL retornar un arreglo de objetos `Producto` con los campos `id`, `nombre` y `precio`.
5. WHILE la petición `GET /productos` está en curso, THE `ProductosList` SHALL mostrar un indicador de carga visible al usuario.
6. IF la `API_Gateway` responde con un código HTTP distinto de 200, THEN THE `ProductosList` SHALL mostrar un mensaje de error descriptivo al usuario.
7. IF ocurre un error de red durante la consulta de productos, THEN THE `ProductosList` SHALL mostrar el mensaje "Sin conexión. Verifique su red." al usuario.

---

### Requirement 2: Visualización del Listado de Productos

**User Story:** Como cajero, quiero ver el listado de productos con nombre, precio y un botón de selección por cada uno, para poder elegir rápidamente los productos que el cliente desea comprar.

#### Acceptance Criteria

1. THE `ProductosList` SHALL renderizar un elemento de lista por cada `Producto` retornado por la `API_Gateway`.
2. THE `ProductosList` SHALL mostrar el campo `nombre` del `Producto` en cada elemento de la lista.
3. THE `ProductosList` SHALL mostrar el campo `precio` del `Producto` formateado como valor monetario en cada elemento de la lista.
4. THE `ProductosList` SHALL mostrar un botón de selección en cada elemento de la lista que permita al usuario agregar el `Producto` a la venta en curso.
5. THE `ProductosList` SHALL usar HTML5 semántico (`<ul>`, `<li>`, `<button>`) para estructurar el listado.
6. THE `ProductosList` SHALL aplicar estilos con CSS moderno usando Flexbox para la disposición de los elementos.
7. WHEN la `API_Gateway` retorna un arreglo vacío, THE `ProductosList` SHALL mostrar el mensaje "No hay productos disponibles." al usuario.

---

### Requirement 3: Registro de Ventas en la API

**User Story:** Como cajero, quiero registrar la venta de los productos seleccionados enviando los datos al backend, para que la transacción quede almacenada en el sistema central.

#### Acceptance Criteria

1. WHEN el usuario confirma la venta en el `VentaForm`, THE `Ventas_Service` SHALL realizar una petición `POST` al endpoint `/ventas` de la `API_Gateway` con el cuerpo `{ "productos": [{ "id": string, "cantidad": number }] }` en formato JSON.
2. THE `Ventas_Service` SHALL incluir el header `Content-Type: application/json` en la petición `POST /ventas`.
3. THE `Ventas_Service` SHALL incluir el header `Authorization: Bearer {jwt}` en la petición, leyendo el JWT del `Auth_Store`.
4. THE `Ventas_Service` SHALL usar `fetch` nativo del navegador con `async/await` para que la llamada sea visible en el Network tab del navegador.
5. WHILE la petición `POST /ventas` está en curso, THE `VentaForm` SHALL deshabilitar el botón de confirmación para evitar envíos duplicados.
6. IF la lista de productos seleccionados está vacía al intentar confirmar la venta, THEN THE `VentaForm` SHALL deshabilitar el botón de confirmación.

---

### Requirement 4: Mensajes de Éxito al Registrar una Venta

**User Story:** Como cajero, quiero ver un mensaje de confirmación cuando la venta se registre correctamente, para tener certeza de que la transacción fue procesada por el sistema.

#### Acceptance Criteria

1. WHEN la `API_Gateway` responde con código HTTP 200 al `POST /ventas`, THE `VentaForm` SHALL mostrar el mensaje de éxito retornado por la `API_Gateway` en el campo `message` de la respuesta.
2. WHEN el mensaje de éxito es mostrado, THE `VentaForm` SHALL limpiar la lista de productos seleccionados para permitir iniciar una nueva venta.
3. THE `VentaForm` SHALL mostrar el mensaje de éxito de forma visible y diferenciada visualmente del resto de la interfaz (por ejemplo, con color verde o ícono de confirmación).
4. WHEN el mensaje de éxito es mostrado, THE `VentaForm` SHALL mantener el listado de productos disponibles visible para que el cajero pueda iniciar una nueva venta inmediatamente.

---

### Requirement 5: Mensajes de Error al Fallar la API

**User Story:** Como cajero, quiero ver un mensaje de error claro cuando la API falle o retorne una respuesta inválida, para saber que la venta no fue registrada y poder tomar acción.

#### Acceptance Criteria

1. IF la `API_Gateway` responde con un código HTTP distinto de 200 al `POST /ventas`, THEN THE `VentaForm` SHALL mostrar un mensaje de error descriptivo al usuario.
2. IF ocurre un error de red durante el `POST /ventas`, THEN THE `VentaForm` SHALL mostrar el mensaje "Sin conexión. Verifique su red." al usuario.
3. IF la respuesta de la `API_Gateway` al `POST /ventas` no contiene el campo `message`, THEN THE `VentaForm` SHALL mostrar el mensaje "Error al registrar la venta. Intente nuevamente." al usuario.
4. THE `VentaForm` SHALL mostrar los mensajes de error de forma visible y diferenciada visualmente del resto de la interfaz (por ejemplo, con color rojo o ícono de advertencia).
5. WHEN un mensaje de error es mostrado, THE `VentaForm` SHALL mantener los productos seleccionados en la lista para que el cajero pueda reintentar la venta sin perder la selección.

---

### Requirement 6: Configuración de la URL Base mediante Variable de Entorno

**User Story:** Como desarrollador, quiero configurar la URL base de la API Gateway mediante una variable de entorno, para poder apuntar a distintos entornos (desarrollo, staging, producción) sin modificar el código fuente.

#### Acceptance Criteria

1. THE `Config` SHALL leer la URL base de la API desde la variable de entorno `VITE_API_BASE_URL`.
2. WHERE la variable de entorno `VITE_API_BASE_URL` no esté definida, THE `Config` SHALL usar `http://localhost:3000` como URL base por defecto.
3. THE `Productos_Service` SHALL construir la URL de la petición concatenando la URL base del `Config` con la ruta `/productos`.
4. THE `Ventas_Service` SHALL construir la URL de la petición concatenando la URL base del `Config` con la ruta `/ventas`.
5. THE `Config` SHALL exportar la URL base como una constante accesible por todos los módulos de servicios.

---

### Requirement 7: Estructura de Archivos del Proyecto

**User Story:** Como evaluador académico, quiero que el proyecto siga la estructura de archivos especificada, para verificar que los módulos están correctamente organizados y separados por responsabilidad.

#### Acceptance Criteria

1. THE `POS_App` SHALL contener el archivo `src/services/productosService.ts` con la lógica de la petición `GET /productos`.
2. THE `POS_App` SHALL contener el archivo `src/services/ventasService.ts` con la lógica de la petición `POST /ventas`.
3. THE `POS_App` SHALL contener el archivo `src/components/ProductosList.tsx` con el componente de visualización del catálogo.
4. THE `POS_App` SHALL contener el archivo `src/components/VentaForm.tsx` con el componente de gestión y envío de ventas.
5. THE `POS_App` SHALL contener el archivo `src/config.ts` con la configuración de variables de entorno.
6. THE `Productos_Service` SHALL implementarse como un módulo de funciones puras sin class components.
7. THE `Ventas_Service` SHALL implementarse como un módulo de funciones puras sin class components.

---

### Requirement 8: Implementación con React Hooks

**User Story:** Como evaluador académico, quiero que los componentes usen exclusivamente React Hooks para el manejo de estado y efectos secundarios, para verificar el dominio de los patrones modernos de React.

#### Acceptance Criteria

1. THE `ProductosList` SHALL usar el hook `useState` para gestionar el estado de la lista de productos, el estado de carga y el estado de error.
2. THE `ProductosList` SHALL usar el hook `useEffect` para disparar la consulta `GET /productos` al montarse el componente.
3. THE `VentaForm` SHALL usar el hook `useState` para gestionar el estado de los productos seleccionados, el estado de envío, el mensaje de éxito y el mensaje de error.
4. THE `POS_App` SHALL no contener class components en ninguno de los archivos del módulo de productos y ventas.
5. THE `Productos_Service` y el `Ventas_Service` SHALL implementar sus funciones usando `async/await` con bloques `try/catch` para el manejo de errores.
