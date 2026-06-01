/**
 * Servicio HTTP para registrar ventas en la API Gateway.
 * Usa fetch nativo con async/await y try/catch.
 * Incluye el JWT del Auth_Store en el header Authorization.
 *
 * Requirements: 3.1, 3.2, 3.3, 3.4, 5.2, 6.4
 */

import { API_BASE_URL } from '../config'
import { useAuthStore } from '../auth/authStore'

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
 * @param venta - Objeto con la lista de productos y cantidades
 * @returns Respuesta de la API con mensaje de confirmación
 * @throws Error con mensaje descriptivo en caso de fallo HTTP o de red
 */
export async function registrarVenta(venta: VentaRequest): Promise<VentaResponse> {
  const jwt = useAuthStore.getState().session?.jwt ?? ''
  const url = `${API_BASE_URL}/ventas`

  try {
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${jwt}`,
      },
      body: JSON.stringify(venta),
    })

    if (!response.ok) {
      let errorMessage = 'Error al registrar la venta. Intente nuevamente.'
      try {
        const errorData = await response.json()
        if (errorData?.message) {
          errorMessage = errorData.message
        }
      } catch {
        // Si no se puede parsear el error, usar mensaje genérico
      }
      throw new Error(errorMessage)
    }

    const data: VentaResponse = await response.json()

    // Validar que la respuesta tiene el campo message
    if (!data?.message) {
      throw new Error('Error al registrar la venta. Intente nuevamente.')
    }

    return data
  } catch (error) {
    if (error instanceof TypeError) {
      // Error de red: sin conectividad, DNS, CORS
      throw new Error('Sin conexión. Verifique su red.')
    }
    throw error
  }
}
