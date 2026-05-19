import { RefObject } from 'react'
import { Toast } from 'primereact/toast'
import { Product } from '../../types'
import ProductCard from './ProductCard'

interface ProductGridProps {
  products: Product[]
  toast: RefObject<Toast | null>
}

export default function ProductGrid({ products, toast }: ProductGridProps) {
  if (products.length === 0) {
    return (
      <div 
        className="flex flex-column align-items-center justify-content-center h-full py-8"
        style={{ color: 'var(--pos-text-secondary)' }}
      >
        <div 
          className="flex align-items-center justify-content-center mb-4"
          style={{
            width: '80px',
            height: '80px',
            borderRadius: '50%',
            backgroundColor: 'var(--pos-bg-tertiary)'
          }}
        >
          <i className="pi pi-search text-3xl" style={{ color: 'var(--pos-text-muted)' }}></i>
        </div>
        <p 
          className="font-display text-xl font-medium m-0 mb-2"
          style={{ color: 'var(--pos-text-primary)' }}
        >
          Sin resultados
        </p>
        <p 
          className="text-sm m-0"
          style={{ color: 'var(--pos-text-muted)' }}
        >
          Intenta con otra busqueda o categoria
        </p>
      </div>
    )
  }

  return (
    <div 
      className="grid"
      style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))',
        gap: '1rem'
      }}
    >
      {products.map((product, index) => (
        <div 
          key={product.id}
          className="animate-slide-up"
          style={{ animationDelay: `${Math.min(index * 0.03, 0.3)}s`, animationFillMode: 'both' }}
        >
          <ProductCard 
            product={product} 
            toast={toast}
          />
        </div>
      ))}
    </div>
  )
}
