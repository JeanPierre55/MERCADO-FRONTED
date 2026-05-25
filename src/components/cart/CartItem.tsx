import { InputNumber } from 'primereact/inputnumber'
import { CartItem as CartItemType } from '../../types'
import { usePOSStore } from '../../store/posStore'
import { useState } from 'react'
import { formatCOP } from '../../lib/money'

interface CartItemProps {
  item: CartItemType
}

export default function CartItem({ item }: CartItemProps) {
  const { updateQuantity, removeFromCart } = usePOSStore()
  const [imgError, setImgError] = useState(false)
  const { product, quantity, subtotal } = item

  return (
    <div 
      className="flex align-items-center gap-4 p-4"
      style={{
        backgroundColor: 'var(--pos-bg-secondary)',
        borderRadius: '14px',
        border: '1px solid var(--pos-border)'
      }}
    >
      {/* Product Image */}
      <div 
        className="flex align-items-center justify-content-center flex-shrink-0"
        style={{
          width: '64px',
          height: '64px',
          borderRadius: '12px',
          backgroundColor: 'var(--pos-bg-tertiary)',
          overflow: 'hidden'
        }}
      >
        {!imgError ? (
          <img 
            src={product.image} 
            alt={product.name}
            className="w-full h-full"
            style={{ objectFit: 'cover' }}
            onError={() => setImgError(true)}
          />
        ) : (
          <i 
            className="pi pi-image text-xl" 
            style={{ color: 'var(--pos-text-muted)' }}
          ></i>
        )}
      </div>

      {/* Product Info */}
      <div className="flex-1 min-w-0">
        <h4 
          className="m-0 font-medium mb-1"
          style={{ 
            color: 'var(--pos-text-primary)',
            fontSize: '0.95rem',
            whiteSpace: 'nowrap',
            overflow: 'hidden',
            textOverflow: 'ellipsis'
          }}
        >
          {product.name}
        </h4>
        <p 
          className="m-0 text-sm" 
          style={{ color: 'var(--pos-text-muted)' }}
        >
          {formatCOP(product.price)} / {product.unit}
        </p>
      </div>

      {/* Quantity Controls */}
      <div 
        className="flex align-items-center"
        style={{
          backgroundColor: 'var(--pos-bg-tertiary)',
          borderRadius: '100px',
          padding: '4px'
        }}
      >
        <button
          className="flex align-items-center justify-content-center border-none cursor-pointer"
          style={{
            width: '28px',
            height: '28px',
            borderRadius: '50%',
            backgroundColor: 'var(--pos-bg-secondary)',
            color: 'var(--pos-text-primary)'
          }}
          onClick={() => updateQuantity(product.id, quantity - 1)}
        >
          <i className="pi pi-minus text-xs"></i>
        </button>
        
        <InputNumber
          value={quantity}
          onValueChange={(e) => updateQuantity(product.id, e.value || 1)}
          min={1}
          max={product.stock}
          inputStyle={{
            width: '40px',
            textAlign: 'center',
            backgroundColor: 'transparent',
            border: 'none',
            color: 'var(--pos-text-primary)',
            fontWeight: '600',
            fontSize: '0.9rem',
            padding: 0
          }}
        />
        
        <button
          className="flex align-items-center justify-content-center border-none cursor-pointer"
          style={{
            width: '28px',
            height: '28px',
            borderRadius: '50%',
            backgroundColor: 'var(--pos-bg-secondary)',
            color: 'var(--pos-text-primary)',
            opacity: quantity >= product.stock ? 0.5 : 1
          }}
          onClick={() => updateQuantity(product.id, quantity + 1)}
          disabled={quantity >= product.stock}
        >
          <i className="pi pi-plus text-xs"></i>
        </button>
      </div>

      {/* Subtotal and Remove */}
      <div className="flex flex-column align-items-end gap-1" style={{ minWidth: '80px' }}>
        <span 
          className="font-semibold"
          style={{ 
            color: 'var(--pos-text-primary)',
            fontSize: '1rem'
          }}
        >
          {formatCOP(subtotal)}
        </span>
        
        <button
          className="flex align-items-center gap-1 border-none cursor-pointer p-0 bg-transparent"
          style={{
            color: 'var(--pos-text-muted)',
            fontSize: '0.75rem'
          }}
          onClick={() => removeFromCart(product.id)}
        >
          <i className="pi pi-trash text-xs"></i>
          Eliminar
        </button>
      </div>
    </div>
  )
}
