import { Button } from 'primereact/button'
import { usePOSStore } from '../../store/posStore'
import CartItem from './CartItem'
import CartSummary from './CartSummary'
import DiscountInput from './DiscountInput'

export default function ShoppingCart() {
  const { 
    cart, 
    clearCart, 
    getCartCount,
    openCheckout 
  } = usePOSStore()

  const isEmpty = cart.length === 0

  return (
    <div 
      className="flex flex-column h-full"
      style={{
        backgroundColor: 'var(--pos-bg-secondary)',
        borderLeft: '1px solid var(--pos-border)',
        overflow: 'hidden'
      }}
    >
      {/* Header */}
      <div 
        className="flex align-items-center justify-content-between px-5 py-4"
        style={{ borderBottom: '1px solid var(--pos-border)' }}
      >
        <div>
          <h2 
            className="font-display m-0 mb-1"
            style={{ 
              fontSize: '1.5rem', 
              fontWeight: '600',
              color: 'var(--pos-text-primary)',
              letterSpacing: '-0.01em'
            }}
          >
            Orden Actual
          </h2>
          <p 
            className="m-0"
            style={{ color: 'var(--pos-text-muted)', fontSize: '0.875rem' }}
          >
            {getCartCount()} {getCartCount() === 1 ? 'articulo' : 'articulos'}
          </p>
        </div>

        {!isEmpty && (
          <button
            onClick={clearCart}
            className="flex align-items-center gap-2 px-3 py-2 border-none cursor-pointer"
            style={{ 
              backgroundColor: 'transparent',
              color: 'var(--pos-danger)',
              fontSize: '0.875rem',
              fontWeight: '500'
            }}
          >
            <i className="pi pi-trash text-xs"></i>
            Vaciar
          </button>
        )}
      </div>

      {/* Cart Items */}
      <div 
        className="flex-1 overflow-auto px-5 py-4" 
        style={{ minHeight: 0 }}
      >
        {isEmpty ? (
          <div 
            className="flex flex-column align-items-center justify-content-center h-full"
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
              <i 
                className="pi pi-shopping-bag text-3xl" 
                style={{ color: 'var(--pos-text-muted)' }}
              ></i>
            </div>
            <p 
              className="font-display text-lg font-medium m-0 mb-2"
              style={{ color: 'var(--pos-text-primary)' }}
            >
              Carrito vacio
            </p>
            <p 
              className="text-sm m-0 text-center"
              style={{ color: 'var(--pos-text-muted)', maxWidth: '200px' }}
            >
              Selecciona productos del catalogo para comenzar
            </p>
          </div>
        ) : (
          <div className="flex flex-column gap-3">
            {cart.map((item, index) => (
              <div 
                key={item.product.id}
                className="animate-slide-up"
                style={{ animationDelay: `${index * 0.05}s`, animationFillMode: 'both' }}
              >
                <CartItem item={item} />
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Footer */}
      {!isEmpty && (
        <div 
          className="flex flex-column px-5 py-5"
          style={{ 
            borderTop: '1px solid var(--pos-border)',
            backgroundColor: 'var(--pos-bg-primary)'
          }}
        >
          <DiscountInput />
          
          <div 
            className="my-4"
            style={{ height: '1px', backgroundColor: 'var(--pos-border)' }} 
          />
          
          <CartSummary />
          
          <Button
            label="Procesar Pago"
            className="w-full mt-5"
            style={{
              height: '56px',
              fontSize: '1rem',
              fontWeight: 600,
              borderRadius: '12px',
              backgroundColor: 'var(--pos-text-primary)',
              color: 'var(--pos-bg-secondary)',
              border: 'none',
              letterSpacing: '0.02em'
            }}
            onClick={openCheckout}
          />

          <div 
            className="flex align-items-center justify-content-center gap-4 mt-4"
          >
            <span 
              className="flex align-items-center gap-2 text-xs"
              style={{ color: 'var(--pos-text-muted)' }}
            >
              <i className="pi pi-lock"></i>
              Pago seguro
            </span>
            <span 
              className="flex align-items-center gap-2 text-xs"
              style={{ color: 'var(--pos-text-muted)' }}
            >
              <i className="pi pi-shield"></i>
              SSL encriptado
            </span>
          </div>
        </div>
      )}
    </div>
  )
}
