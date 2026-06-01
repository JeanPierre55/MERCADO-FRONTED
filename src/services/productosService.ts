/**
 * Servicio HTTP para consultar productos desde la API Gateway.
 * Usa fetch nativo con async/await y try/catch.
 * Incluye el JWT del Auth_Store en el header Authorization.
 *
 * Requirements: 1.1, 1.2, 1.3, 1.4, 1.7, 6.3
 */

import { API_BASE_URL } from '../config'
import { useAuthStore } from '../auth/authStore'

export interface Producto {
  id: string
  nombre: string
  precio: number
}

/**
 * Consulta el catálogo de productos desde la API Gateway.
 * @returns Arreglo de productos disponibles
 * @throws Error con mensaje descriptivo en caso de fallo HTTP o de red
 */
export async function getProductos(): Promise<Producto[]> {
  const jwt = useAuthStore.getState().session?.jwt ?? ''
  const url = `${API_BASE_URL}/productos`

  try {
    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${jwt}`,
      },
    })

    if (!response.ok) {
      throw new Error(`Error al cargar productos. Código: ${response.status}`)
    }

    const data: Producto[] = await response.json()
    return data
  } catch (error) {
    if (error instanceof TypeError) {
      // Error de red: sin conectividad, DNS, CORS
      throw new Error('Sin conexión. Verifique su red.')
    }
    throw error
  }
}
