import { RefObject, useState } from 'react'
import { Toast } from 'primereact/toast'
import { Product } from '../../types'
import { usePOSStore } from '../../store/posStore'
import { formatCOP } from '../../lib/money'

interface ProductCardProps {
  product: Product
  toast: RefObject<Toast | null>
}

export default function ProductCard({ product, toast }: ProductCardProps) {
  const { addToCart } = usePOSStore()
  const [isAdding, setIsAdding] = useState(false)
  const [imgError, setImgError] = useState(false)

  const handleAddToCart = () => {
    setIsAdding(true)
    addToCart(product)
    
    toast.current?.show({
      severity: 'success',
      summary: 'Agregado',
      detail: `${product.name} agregado al carrito`,
      life: 1500,
    })

    setTimeout(() => setIsAdding(false), 300)
  }

  const isLowStock = product.stock < 20
  const isCriticalStock = product.stock < 10

  return (
    <div 
      className={`pos-card flex flex-column cursor-pointer ${isAdding ? 'animate-scale-in' : ''}`}
      style={{
        overflow: 'hidden',
        transform: isAdding ? 'scale(0.97)' : 'scale(1)',
      }}
      onClick={handleAddToCart}
    >
      {/* Image Section */}
      <div 
        className="relative flex align-items-center justify-content-center"
        style={{ 
          height: '160px',
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
          <div 
            className="flex flex-column align-items-center justify-content-center"
            style={{ color: 'var(--pos-text-muted)' }}
          >
            <i className="pi pi-image text-3xl mb-2" style={{ opacity: 0.4 }}></i>
            <span className="text-xs">Sin imagen</span>
          </div>
        )}
        
        {/* Stock Badge */}
        {isLowStock && (
          <span 
            className={`pos-tag absolute ${isCriticalStock ? 'pos-tag-danger' : 'pos-tag-warning'}`}
            style={{ top: '12px', right: '12px' }}
          >
            {product.stock} uds
          </span>
        )}

        {/* Quick add button overlay */}
        <div 
          className="absolute flex align-items-center justify-content-center transition-all transition-duration-200"
          style={{
            bottom: '12px',
            right: '12px',
            width: '40px',
            height: '40px',
            borderRadius: '50%',
            backgroundColor: 'var(--pos-text-primary)',
            color: 'var(--pos-bg-secondary)',
            opacity: 0.9,
            boxShadow: '0 4px 12px rgba(0,0,0,0.15)'
          }}
        >
          <i className="pi pi-plus"></i>
        </div>
      </div>

      {/* Info Section */}
      <div className="flex flex-column p-4 gap-3">
        <div>
          <h3 
            className="m-0 mb-1 font-medium"
            style={{ 
              color: 'var(--pos-text-primary)',
              fontSize: '0.95rem',
              lineHeight: '1.4',
              display: '-webkit-box',
              WebkitLineClamp: 2,
              WebkitBoxOrient: 'vertical',
              overflow: 'hidden',
              minHeight: '2.8em'
            }}
          >
            {product.name}
          </h3>
          <span 
            className="text-xs"
            style={{ color: 'var(--pos-text-muted)' }}
          >
            {product.barcode}
          </span>
        </div>

        <div className="flex align-items-baseline justify-content-between mt-auto">
          <div className="flex align-items-baseline gap-1">
            <span 
              className="font-semibold"
              style={{ 
                color: 'var(--pos-text-primary)',
                fontSize: '1.25rem',
                letterSpacing: '-0.02em'
              }}
            >
              {formatCOP(product.price)}
            </span>
            <span 
              className="text-xs"
              style={{ color: 'var(--pos-text-muted)' }}
            >
              / {product.unit}
            </span>
          </div>

          <span 
            className="pos-tag pos-tag-success"
            style={{ fontSize: '0.7rem' }}
          >
            Disponible
          </span>
        </div>
      </div>
    </div>
  )
}
