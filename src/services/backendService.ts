/**
 * Servicio HTTP para los endpoints del backend Spring Boot.
 *
 * Cubre:
 *  - GET  /api/products/search  → buscar productos en Spring Boot
 *  - POST /api/sales            → registrar ventas en Spring Boot
 *  - GET  /api/sales            → historial de ventas en Spring Boot
 *
 * Todos los endpoints incluyen el JWT del Auth_Store en Authorization.
 * Usa fetch nativo con async/await y try/catch.
 */

import { BACKEND_URL } from '../config'
import { useAuthStore } from '../auth/authStore'

// ── Tipos ─────────────────────────────────────────────────────────────────────

export interface ProductoBackend {
  id: string | number
  name?: string
  nombre?: string
  price?: number
  precio?: number
  barcode?: string
  category?: string
  stock?: number
}

export interface SaleItemBackend {
  productId: string | number
  quantity: number
  price?: number
}

export interface SaleRequestBackend {
  items: SaleItemBackend[]
  total?: number
  paymentMethod?: string
  cashier?: string
}

export interface SaleResponseBackend {
  id?: string | number
  message?: string
  receiptNumber?: string
  total?: number
  timestamp?: string
}

// ── Helper interno ────────────────────────────────────────────────────────────

function getAuthHeaders(): HeadersInit {
  const jwt = useAuthStore.getState().session?.jwt ?? ''
  return {
    'Content-Type': 'application/json',
    ...(jwt ? { 'Authorization': `Bearer ${jwt}` } : {}),
  }
}

async function handleResponse<T>(response: Response): Promise<T> {
  if (!response.ok) {
    let message = `Error del servidor (${response.status})`
    try {
      const body = await response.json()
      if (body?.message) message = body.message
    } catch { /* ignorar */ }
    throw new Error(message)
  }
  return response.json() as Promise<T>
}

// ── Productos (Spring Boot) ───────────────────────────────────────────────────

/**
 * Busca productos en el backend Spring Boot.
 * GET /api/products/search?q={query}
 */
export async function searchProductos(query: string = ''): Promise<ProductoBackend[]> {
  const url = `${BACKEND_URL}/api/products/search${query ? `?q=${encodeURIComponent(query)}` : ''}`
  try {
    const response = await fetch(url, {
      method: 'GET',
      headers: getAuthHeaders(),
    })
    return handleResponse<ProductoBackend[]>(response)
  } catch (error) {
    if (error instanceof TypeError) {
      throw new Error('Sin conexión con el servidor. Verifique que Spring Boot esté corriendo.')
    }
    throw error
  }
}

/**
 * Obtiene todos los productos del backend Spring Boot.
 * GET /api/products
 */
export async function getAllProductosBackend(): Promise<ProductoBackend[]> {
  const url = `${BACKEND_URL}/api/products`
  try {
    const response = await fetch(url, {
      method: 'GET',
      headers: getAuthHeaders(),
    })
    return handleResponse<ProductoBackend[]>(response)
  } catch (error) {
    if (error instanceof TypeError) {
      throw new Error('Sin conexión con el servidor. Verifique que Spring Boot esté corriendo.')
    }
    throw error
  }
}

// ── Ventas (Spring Boot) ──────────────────────────────────────────────────────

/**
 * Registra una venta en el backend Spring Boot.
 * POST /api/sales
 */
export async function registrarVentaBackend(
  sale: SaleRequestBackend
): Promise<SaleResponseBackend> {
  const url = `${BACKEND_URL}/api/sales`
  try {
    const response = await fetch(url, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify(sale),
    })
    return handleResponse<SaleResponseBackend>(response)
  } catch (error) {
    if (error instanceof TypeError) {
      throw new Error('Sin conexión con el servidor. Verifique que Spring Boot esté corriendo.')
    }
    throw error
  }
}

/**
 * Obtiene el historial de ventas del backend Spring Boot.
 * GET /api/sales
 */
export async function getVentasBackend(): Promise<SaleResponseBackend[]> {
  const url = `${BACKEND_URL}/api/sales`
  try {
    const response = await fetch(url, {
      method: 'GET',
      headers: getAuthHeaders(),
    })
    return handleResponse<SaleResponseBackend[]>(response)
  } catch (error) {
    if (error instanceof TypeError) {
      throw new Error('Sin conexión con el servidor. Verifique que Spring Boot esté corriendo.')
    }
    throw error
  }
}
