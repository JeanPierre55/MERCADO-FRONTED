import { PaymentMethod } from '../types/index'

/**
 * Logs when checkout process is started.
 * Format: [POS][CHECKOUT] Inicio de pago | Total: {total} | Método: {método} | Cajero: {usuario} | Timestamp: {ISO8601}
 *
 * @param total - The total amount for the checkout
 * @param method - The payment method being used
 * @param username - The username of the authenticated user
 */
export function logCheckoutStarted(
  total: number,
  method: PaymentMethod,
  username: string
): void {
  try {
    const displayUsername = username && username.trim() ? username : 'Desconocido'
    const timestamp = new Date().toISOString()
    const message = `[POS][CHECKOUT] Inicio de pago | Total: ${total} | Método: ${method} | Cajero: ${displayUsername} | Timestamp: ${timestamp}`
    console.log(message)
  } catch (error) {
    console.error('Error logging checkout started:', error)
  }
}

/**
 * Logs when checkout process is completed successfully.
 * Format: [POS][CHECKOUT] Pago completado | Folio: {receiptNumber} | Total: {total} | Método: {método} | Cajero: {usuario} | Timestamp: {ISO8601}
 *
 * @param receiptNumber - The receipt/folio number for the transaction
 * @param total - The total amount for the checkout
 * @param method - The payment method used
 * @param username - The username of the authenticated user
 */
export function logCheckoutCompleted(
  receiptNumber: string,
  total: number,
  method: PaymentMethod,
  username: string
): void {
  try {
    const displayUsername = username && username.trim() ? username : 'Desconocido'
    const timestamp = new Date().toISOString()
    const message = `[POS][CHECKOUT] Pago completado | Folio: ${receiptNumber} | Total: ${total} | Método: ${method} | Cajero: ${displayUsername} | Timestamp: ${timestamp}`
    console.log(message)
  } catch (error) {
    console.error('Error logging checkout completed:', error)
  }
}

/**
 * Logs when a validation error occurs during checkout.
 * Format: [POS][CHECKOUT] Error de validación: {descripción} | Cajero: {usuario} | Timestamp: {ISO8601}
 *
 * @param description - Description of the validation error
 * @param username - The username of the authenticated user
 */
export function logCheckoutValidationError(
  description: string,
  username: string
): void {
  try {
    const displayUsername = username && username.trim() ? username : 'Desconocido'
    const timestamp = new Date().toISOString()
    const message = `[POS][CHECKOUT] Error de validación: ${description} | Cajero: ${displayUsername} | Timestamp: ${timestamp}`
    console.warn(message)
  } catch (error) {
    console.error('Error logging checkout validation error:', error)
  }
}
