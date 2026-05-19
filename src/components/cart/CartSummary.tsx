import { usePOSStore } from '../../store/posStore'
import { formatCOP, formatTaxRate } from '../../lib/money'

export default function CartSummary() {
  const { 
    getSubtotal, 
    getTaxTotal, 
    getDiscountTotal, 
    getTotal,
    appliedDiscount,
    cart,
  } = usePOSStore()

  const subtotal = getSubtotal()
  const taxTotal = getTaxTotal()
  const discountTotal = getDiscountTotal()
  const total = getTotal()
  const taxRates = Array.from(new Set(cart.map((item) => item.product.taxRate)))
    .filter((rate) => rate > 0)
    .sort((a, b) => a - b)
  const taxRateLabel = taxRates.length > 0
    ? `IVA (${taxRates.map(formatTaxRate).join(' / ')})`
    : 'IVA (0%)'

  return (
    <div className="flex flex-column gap-3">
      <div className="flex justify-content-between">
        <span 
          className="text-sm"
          style={{ color: 'var(--pos-text-muted)' }}
        >
          Subtotal
        </span>
        <span 
          className="text-sm"
          style={{ color: 'var(--pos-text-primary)' }}
        >
          {formatCOP(subtotal)}
        </span>
      </div>
      
      <div className="flex justify-content-between">
        <span 
          className="text-sm"
          style={{ color: 'var(--pos-text-muted)' }}
        >
          {taxRateLabel}
        </span>
        <span 
          className="text-sm"
          style={{ color: 'var(--pos-text-primary)' }}
        >
          {formatCOP(taxTotal)}
        </span>
      </div>

      {appliedDiscount && discountTotal > 0 && (
        <div className="flex justify-content-between">
          <span 
            className="text-sm flex align-items-center gap-1"
            style={{ color: 'var(--pos-success)' }}
          >
            <i className="pi pi-tag text-xs"></i>
            {appliedDiscount.name}
          </span>
          <span 
            className="text-sm"
            style={{ color: 'var(--pos-success)' }}
          >
            -{formatCOP(discountTotal)}
          </span>
        </div>
      )}
      
      <div 
        className="flex justify-content-between align-items-center pt-4 mt-1"
        style={{ borderTop: '1px solid var(--pos-border)' }}
      >
        <span 
          className="font-medium"
          style={{ 
            color: 'var(--pos-text-primary)',
            fontSize: '1rem'
          }}
        >
          Total a pagar
        </span>
        <span 
          className="font-display font-semibold"
          style={{ 
            color: 'var(--pos-text-primary)',
            fontSize: '1.75rem',
            letterSpacing: '-0.02em'
          }}
        >
          {formatCOP(total)}
        </span>
      </div>
    </div>
  )
}
