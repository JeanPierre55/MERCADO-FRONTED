import { Toast } from 'primereact/toast'
import { useRef } from 'react'
import Header from './components/layout/Header'
import ProductCatalog from './components/products/ProductCatalog'
import ShoppingCart from './components/cart/ShoppingCart'
import CheckoutDialog from './components/checkout/CheckoutDialog'
import ReceiptDialog from './components/receipt/ReceiptDialog'
import { usePOSStore } from './store/posStore'

function App() {
  const toast = useRef<Toast>(null)
  const { currentReceipt, setCurrentReceipt } = usePOSStore()

  return (
    <div className="flex flex-column h-full" style={{ backgroundColor: 'var(--pos-bg-primary)' }}>
      <Toast ref={toast} position="top-right" />
      
      <Header />
      
      <main className="flex flex-1 overflow-hidden">
        {/* Catalogo de productos - lado izquierdo */}
        <section 
          className="flex-1 overflow-hidden"
          style={{ backgroundColor: 'var(--pos-bg-primary)' }}
        >
          <ProductCatalog toast={toast} />
        </section>
        
        {/* Carrito - lado derecho */}
        <aside 
          style={{ 
            width: '400px', 
            minWidth: '360px',
            backgroundColor: 'var(--pos-bg-secondary)'
          }}
        >
          <ShoppingCart />
        </aside>
      </main>
      
      <CheckoutDialog />
      
      <ReceiptDialog 
        visible={currentReceipt !== null}
        transaction={currentReceipt}
        onClose={() => setCurrentReceipt(null)}
      />
    </div>
  )
}

export default App
