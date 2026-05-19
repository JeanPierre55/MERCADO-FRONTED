export const COLOMBIA_GENERAL_VAT_RATE = 0.19

const copFormatter = new Intl.NumberFormat('es-CO', {
  style: 'currency',
  currency: 'COP',
  maximumFractionDigits: 0,
})

export function formatCOP(value: number): string {
  return copFormatter.format(value)
}

export function formatTaxRate(rate: number): string {
  return `${Math.round(rate * 100)}%`
}
