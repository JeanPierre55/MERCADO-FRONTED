import { Product } from '../types/index'

/**
 * Logs when a product is added to the cart.
 * Format: [POS][CART] Producto agregado: {nombre} (id: {id}) | Cantidad: {cantidad} | Subtotal: {subtotal} | Usuario: {username}
 *
 * @param product - The product being added
 * @param quantity - The quantity added
 * @param subtotal - The subtotal for this product
 * @param username - The username of the authenticated user
 */
export function logProductAdded(
  product: Product,
  quantity: number,
  subtotal: number,
  username: string
): void {
  try {
    const displayUsername = username && username.trim() ? username : 'Desconocido'
    const message = `[POS][CART] Producto agregado: ${product.name} (id: ${product.id}) | Cantidad: ${quantity} | Subtotal: ${subtotal} | Usuario: ${displayUsername}`
    console.log(message)
  } catch (error) {
    console.error('Error logging product added:', error)
  }
}

/**
 * Logs when the quantity of a product in the cart is updated.
 * Format: [POS][CART] Cantidad actualizada: {nombre} (id: {id}) | Nueva cantidad: {cantidad} | Nuevo subtotal: {subtotal} | Usuario: {username}
 *
 * @param product - The product being updated
 * @param newQuantity - The new quantity
 * @param newSubtotal - The new subtotal for this product
 * @param username - The username of the authenticated user
 */
export function logQuantityUpdated(
  product: Product,
  newQuantity: number,
  newSubtotal: number,
  username: string
): void {
  try {
    const displayUsername = username && username.trim() ? username : 'Desconocido'
    const message = `[POS][CART] Cantidad actualizada: ${product.name} (id: ${product.id}) | Nueva cantidad: ${newQuantity} | Nuevo subtotal: ${newSubtotal} | Usuario: ${displayUsername}`
    console.log(message)
  } catch (error) {
    console.error('Error logging quantity updated:', error)
  }
}
