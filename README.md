# MERCATO POS — Sistema de Punto de Venta

Sistema de punto de venta web desarrollado con React + Vite, integrado con una API REST desplegada en AWS API Gateway. Desarrollado siguiendo el enfoque **Spec-Driven Development (SDD)**.

---

## Descripción del Proyecto

MERCATO POS es una aplicación frontend que permite a cajeros y administradores gestionar ventas en tiempo real. El sistema consulta el catálogo de productos desde una API REST en AWS y registra las ventas en el backend serverless (Lambda + DynamoDB).

### Funcionalidades principales

- **Autenticación basada en roles** (Cajero / Administrador) con JWT
- **Catálogo de productos** cargado desde AWS API Gateway (`GET /productos`)
- **Registro de ventas** enviado a AWS API Gateway (`POST /ventas`)
- **Carrito de compras** con descuentos, impuestos y múltiples métodos de pago
- **Recibos digitales** generados al completar una venta
- **Mensajes de éxito y error** en todas las operaciones de API

---

## Arquitectura Cliente-Servidor

```
┌─────────────────────────────────────────────────────────────┐
│                    CLIENTE (React + Vite)                    │
│                                                             │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────────┐  │
│  │ ProductosList│  │  VentaForm   │  │  ProductCatalog  │  │
│  └──────┬───────┘  └──────┬───────┘  └──────────────────┘  │
│         │                 │                                  │
│  ┌──────▼───────┐  ┌──────▼───────┐                        │
│  │productosServ.│  │ ventasService│  ← fetch + JWT          │
│  └──────┬───────┘  └──────┬───────┘                        │
│         │                 │                                  │
│         └────────┬────────┘                                 │
│                  │ VITE_API_BASE_URL                        │
└──────────────────┼──────────────────────────────────────────┘
                   │ HTTPS
┌──────────────────▼──────────────────────────────────────────┐
│              AWS API Gateway (REST)                          │
│  GET  /productos  →  Lambda ProductosFunction               │
│  POST /ventas     →  Lambda VentasFunction                  │
└──────────────────┬──────────────────────────────────────────┘
                   │
┌──────────────────▼──────────────────────────────────────────┐
│              AWS DynamoDB                                    │
│  Tabla: pos-serverless-aws-productos                        │
│  Tabla: pos-serverless-aws-ventas                           │
└─────────────────────────────────────────────────────────────┘
```

---

## Justificación del Framework: React

Se eligió **React** por cuatro razones concretas:

1. **Reutilización de componentes**: `ProductosList` y `VentaForm` son componentes independientes que encapsulan su propia lógica. Pueden instanciarse en cualquier vista del POS sin duplicar código.

2. **Manejo eficiente de estado**: Los hooks `useState` y `useEffect` permiten gestionar los estados `loading`, `error`, `productos` y `selectedProducts` de forma declarativa. React re-renderiza únicamente los elementos del DOM que cambian, lo que es crítico en un POS con interacción continua.

3. **Integración sencilla con APIs REST**: El hook `useEffect` dispara la consulta `GET /productos` exactamente una vez al montar el componente. La función `async/await` dentro del efecto mantiene el código legible y el manejo de errores explícito con `try/catch`.

4. **Rapidez de desarrollo**: El ecosistema React (Vite, TypeScript, hooks) permite iterar rápidamente. La estructura de componentes funcionales sin clases reduce el boilerplate y facilita las pruebas unitarias.

---

## Instalación

### Prerrequisitos

- Node.js 18+
- npm o pnpm

### Pasos

```bash
# 1. Clonar el repositorio
git clone <url-del-repositorio>
cd pos-supermarket

# 2. Instalar dependencias
npm install

# 3. Configurar variables de entorno
cp .env.example .env.local
# Editar .env.local con tu URL de API Gateway

# 4. Iniciar el servidor de desarrollo
npm run dev
```

La aplicación estará disponible en `http://localhost:5173`.

---

## Configuración de Variables de Entorno

Crea un archivo `.env.local` en la raíz del proyecto:

```env
# URL base del API Gateway desplegado en AWS
VITE_API_BASE_URL=https://bvqj72xsqk.execute-api.us-east-1.amazonaws.com/prod
```

### Endpoints disponibles

| Método | Endpoint | Descripción |
|--------|----------|-------------|
| `GET`  | `/productos` | Obtiene el catálogo de productos |
| `POST` | `/ventas`    | Registra una nueva venta |

### Contrato de API

**GET /productos** — Respuesta:
```json
[
  { "id": "1", "nombre": "Laptop", "precio": 2500 },
  { "id": "2", "nombre": "Mouse", "precio": 50 }
]
```

**POST /ventas** — Body:
```json
{
  "productos": [
    { "id": "1", "cantidad": 1 }
  ]
}
```

**POST /ventas** — Respuesta exitosa:
```json
{
  "message": "Venta registrada correctamente"
}
```

---

## Estructura del Proyecto

```
pos-supermarket/
│
├── .kiro/
│   └── specs/
│       ├── pos-login-auth/          # Spec de autenticación
│       │   ├── requirements.md
│       │   ├── design.md
│       │   └── tasks.md
│       └── pos-productos-ventas/    # Spec de productos y ventas
│           ├── requirements.md
│           ├── design.md
│           └── tasks.md
│
├── src/
│   ├── auth/
│   │   ├── authService.ts           # Llamadas HTTP de autenticación
│   │   ├── authStore.ts             # Store Zustand de sesión
│   │   └── jwtUtils.ts              # Utilidades JWT
│   │
│   ├── components/
│   │   ├── auth/
│   │   │   └── LoginScreen.tsx      # Pantalla de login
│   │   ├── cart/
│   │   │   └── ShoppingCart.tsx     # Carrito de compras
│   │   ├── checkout/
│   │   │   └── CheckoutDialog.tsx   # Diálogo de pago
│   │   ├── layout/
│   │   │   └── Header.tsx           # Encabezado con logout
│   │   ├── products/
│   │   │   └── ProductCatalog.tsx   # Catálogo local
│   │   ├── receipt/
│   │   │   └── ReceiptDialog.tsx    # Recibo digital
│   │   ├── ProductosList.tsx        # ← Catálogo desde API Gateway
│   │   └── VentaForm.tsx            # ← Formulario de venta API
│   │
│   ├── services/
│   │   ├── productosService.ts      # ← GET /productos
│   │   └── ventasService.ts         # ← POST /ventas
│   │
│   ├── config.ts                    # ← Variables de entorno
│   ├── App.tsx                      # Componente raíz
│   ├── AppRoot.tsx                  # Guardia de autenticación
│   └── main.tsx                     # Punto de entrada
│
├── .env.example                     # Plantilla de variables de entorno
├── package.json
└── README.md
```

---

## Proceso SDD (Spec-Driven Development)

Este proyecto sigue el enfoque **Spec-Driven Development**, que consiste en:

### 1. Requirements (Requisitos)
Se documentan los objetivos, actores, historias de usuario y criterios de aceptación **antes** de escribir código. Cada requisito tiene criterios verificables en formato EARS (Easy Approach to Requirements Syntax).

### 2. Design (Diseño)
Se define la arquitectura, los componentes, las interfaces de datos y el manejo de errores. Se incluyen diagramas de flujo y contratos de API.

### 3. Tasks (Tareas)
Se genera un plan de implementación numerado y trazable a los requisitos. Cada tarea referencia los requisitos que satisface.

### 4. Implementation (Implementación)
Se implementa siguiendo el plan de tareas, verificando que cada tarea cumple los criterios de aceptación definidos en los requisitos.

### Beneficios del SDD

- **Trazabilidad**: Cada línea de código se puede rastrear hasta un requisito específico
- **Calidad**: Los criterios de aceptación guían las pruebas
- **Comunicación**: Los documentos sirven como contrato entre desarrolladores y evaluadores
- **Mantenibilidad**: El diseño documentado facilita futuras modificaciones

---

## Scripts Disponibles

```bash
npm run dev      # Servidor de desarrollo (http://localhost:5173)
npm run build    # Build de producción
npm run preview  # Vista previa del build
npm run test     # Ejecutar tests (Vitest)
```

---

## Tecnologías Utilizadas

| Tecnología | Versión | Uso |
|------------|---------|-----|
| React | 18.3 | Framework UI |
| TypeScript | 5.6 | Tipado estático |
| Vite | 6.0 | Build tool |
| Zustand | 5.0 | Estado global |
| PrimeReact | 10.8 | Componentes UI |
| Vitest | 4.1 | Testing |
| AWS API Gateway | — | Backend REST |
| AWS Lambda | — | Funciones serverless |
| AWS DynamoDB | — | Base de datos |

---

## Credenciales de Prueba

Para acceder al sistema, usa las credenciales configuradas en el backend Java:

| Usuario | Contraseña | Rol |
|---------|-----------|-----|
| `admin` | `admin123` | ADMIN |
| `cajero` | `cajero123` | CASHIER |

> **Nota:** Las credenciales exactas dependen de la configuración del backend. Consulta con el administrador del sistema.
