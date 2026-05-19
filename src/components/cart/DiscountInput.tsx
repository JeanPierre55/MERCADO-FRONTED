import { useState } from 'react'
import { InputText } from 'primereact/inputtext'
import { usePOSStore } from '../../store/posStore'
import { Discount } from '../../types'

const availableDiscounts: Discount[] = [
  { id: '1', name: '10% Descuento', type: 'percentage', value: 10, code: 'DESCUENTO10' },
  { id: '2', name: '20% Descuento', type: 'percentage', value: 20, code: 'SUPER20' },
  { id: '3', name: '$5.000 Descuento', type: 'fixed', value: 5000, code: 'AHORRA5' },
]

export default function DiscountInput() {
  const [code, setCode] = useState('')
  const [error, setError] = useState('')
  const { appliedDiscount, applyDiscount, removeDiscount } = usePOSStore()

  const handleApplyDiscount = () => {
    const discount = availableDiscounts.find(
      d => d.code?.toLowerCase() === code.toLowerCase()
    )

    if (discount) {
      applyDiscount(discount)
      setCode('')
      setError('')
    } else {
      setError('Codigo de descuento invalido')
    }
  }

  if (appliedDiscount) {
    return (
      <div 
        className="flex align-items-center justify-content-between p-4"
        style={{
          backgroundColor: 'rgba(45, 106, 79, 0.08)',
          borderRadius: '12px',
          border: '1px solid rgba(45, 106, 79, 0.2)'
        }}
      >
        <div className="flex align-items-center gap-3">
          <div 
            className="flex align-items-center justify-content-center"
            style={{
              width: '36px',
              height: '36px',
              borderRadius: '50%',
              backgroundColor: 'rgba(45, 106, 79, 0.15)'
            }}
          >
            <i className="pi pi-check" style={{ color: 'var(--pos-success)' }}></i>
          </div>
          <div>
            <p 
              className="m-0 font-medium"
              style={{ color: 'var(--pos-text-primary)', fontSize: '0.9rem' }}
            >
              {appliedDiscount.name}
            </p>
            <p 
              className="m-0 text-xs"
              style={{ color: 'var(--pos-text-muted)' }}
            >
              Codigo: {appliedDiscount.code}
            </p>
          </div>
        </div>
        <button
          className="flex align-items-center justify-content-center border-none cursor-pointer"
          style={{
            width: '32px',
            height: '32px',
            borderRadius: '50%',
            backgroundColor: 'var(--pos-bg-secondary)',
            color: 'var(--pos-text-muted)'
          }}
          onClick={removeDiscount}
        >
          <i className="pi pi-times text-sm"></i>
        </button>
      </div>
    )
  }

  return (
    <div>
      <div 
        className="flex gap-2 p-1"
        style={{
          backgroundColor: 'var(--pos-bg-secondary)',
          borderRadius: '10px',
          border: '1.5px solid var(--pos-border)'
        }}
      >
        <InputText
          value={code}
          onChange={(e) => {
            setCode(e.target.value)
            setError('')
          }}
          placeholder="Codigo de descuento"
          className="flex-1 border-none"
          style={{
            backgroundColor: 'transparent',
            fontSize: '0.9rem'
          }}
          onKeyDown={(e) => {
            if (e.key === 'Enter') {
              handleApplyDiscount()
            }
          }}
        />
        <button
          className="flex align-items-center gap-2 px-4 border-none cursor-pointer"
          style={{
            borderRadius: '8px',
            backgroundColor: code.trim() ? 'var(--pos-text-primary)' : 'var(--pos-bg-tertiary)',
            color: code.trim() ? 'var(--pos-bg-secondary)' : 'var(--pos-text-muted)',
            fontWeight: '500',
            fontSize: '0.875rem',
            transition: 'all 0.2s ease'
          }}
          onClick={handleApplyDiscount}
          disabled={!code.trim()}
        >
          Aplicar
        </button>
      </div>
      {error && (
        <p 
          className="m-0 mt-2 text-xs flex align-items-center gap-1"
          style={{ color: 'var(--pos-danger)' }}
        >
          <i className="pi pi-exclamation-circle"></i>
          {error}
        </p>
      )}
      <p 
        className="m-0 mt-2 text-xs"
        style={{ color: 'var(--pos-text-muted)' }}
      >
        Prueba: DESCUENTO10, SUPER20, AHORRA5
      </p>
    </div>
  )
}
