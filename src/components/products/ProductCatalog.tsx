import { useState, useMemo, RefObject } from 'react'
import { InputText } from 'primereact/inputtext'
import { Toast } from 'primereact/toast'
import { products, categories } from '../../data/products'
import { ProductCategory } from '../../types'
import CategoryFilter from './CategoryFilter'
import ProductGrid from './ProductGrid'
import BarcodeScanner from './BarcodeScanner'
import { usePOSStore } from '../../store/posStore'

interface ProductCatalogProps {
  toast: RefObject<Toast | null>
  searchInputRef?: RefObject<HTMLInputElement>
}

export default function ProductCatalog({ toast, searchInputRef }: ProductCatalogProps) {
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedCategory, setSelectedCategory] = useState<ProductCategory | 'all'>('all')
  const [barcodeInput, setBarcodeInput] = useState('')
  const { addToCart } = usePOSStore()

  const filteredProducts = useMemo(() => {
    return products.filter(product => {
      const matchesSearch = 
        product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        product.barcode.includes(searchTerm)
      
      const matchesCategory = 
        selectedCategory === 'all' || product.category === selectedCategory
      
      return matchesSearch && matchesCategory
    })
  }, [searchTerm, selectedCategory])

  const handleBarcodeSubmit = (barcode: string) => {
    const product = products.find(p => p.barcode === barcode)
    if (product) {
      addToCart(product)
      toast.current?.show({
        severity: 'success',
        summary: 'Producto agregado',
        detail: `${product.name} agregado al carrito`,
        life: 2000,
      })
      setBarcodeInput('')
    } else {
      toast.current?.show({
        severity: 'warn',
        summary: 'Producto no encontrado',
        detail: `No se encontro producto con codigo: ${barcode}`,
        life: 3000,
      })
    }
  }

  const handleCameraError = (message: string) => {
    toast.current?.show({
      severity: 'warn',
      summary: 'Escaner no disponible',
      detail: message,
      life: 3500,
    })
  }

  return (
    <div className="flex flex-column h-full gap-4 p-4">
      {/* Header del catalogo */}
      <div className="flex align-items-end justify-content-between">
        <div>
          <h2 
            className="font-display m-0 mb-1"
            style={{ 
              fontSize: '1.75rem', 
              fontWeight: '600',
              color: 'var(--pos-text-primary)',
              letterSpacing: '-0.01em'
            }}
          >
            Catalogo
          </h2>
          <p 
            className="m-0"
            style={{ color: 'var(--pos-text-muted)', fontSize: '0.875rem' }}
          >
            Selecciona los productos para agregar al carrito
          </p>
        </div>
        <span 
          className="pos-tag"
          style={{
            backgroundColor: 'var(--pos-bg-tertiary)',
            color: 'var(--pos-text-secondary)'
          }}
        >
          {filteredProducts.length} productos
        </span>
      </div>

      {/* Search and Barcode Section */}
      <div className="flex gap-3">
        <div className="flex-1 relative">
          <i 
            className="pi pi-search absolute"
            style={{ 
              left: '1rem', 
              top: '50%', 
              transform: 'translateY(-50%)',
              color: 'var(--pos-text-muted)' 
            }} 
          />
          <InputText
            ref={searchInputRef}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Buscar productos..."
            className="w-full"
            style={{ 
              paddingLeft: '2.75rem',
              height: '52px',
              fontSize: '0.95rem'
            }}
          />
        </div>

        <BarcodeScanner 
          value={barcodeInput}
          onChange={setBarcodeInput}
          onSubmit={handleBarcodeSubmit}
          onCameraError={handleCameraError}
        />
      </div>

      {/* Categories */}
      <CategoryFilter 
        categories={categories}
        selectedCategory={selectedCategory}
        onSelectCategory={setSelectedCategory}
      />

      {/* Products Grid */}
      <div 
        className="flex-1 overflow-auto"
        style={{ 
          marginRight: '-0.5rem',
          paddingRight: '0.5rem'
        }}
      >
        <ProductGrid 
          products={filteredProducts}
          toast={toast}
        />
      </div>

      {/* Footer con info */}
      {selectedCategory !== 'all' && (
        <div 
          className="flex align-items-center justify-content-between px-4 py-3 animate-slide-up"
          style={{
            backgroundColor: 'var(--pos-bg-secondary)',
            borderRadius: '12px',
            border: '1px solid var(--pos-border)'
          }}
        >
          <span style={{ color: 'var(--pos-text-secondary)', fontSize: '0.875rem' }}>
            Filtrando por categoria
          </span>
          <button
            onClick={() => setSelectedCategory('all')}
            className="flex align-items-center gap-2 px-3 py-2 border-none cursor-pointer"
            style={{ 
              backgroundColor: 'transparent',
              color: 'var(--pos-accent)',
              fontSize: '0.875rem',
              fontWeight: '500'
            }}
          >
            <i className="pi pi-times text-xs"></i>
            Limpiar filtro
          </button>
        </div>
      )}
    </div>
  )
}
