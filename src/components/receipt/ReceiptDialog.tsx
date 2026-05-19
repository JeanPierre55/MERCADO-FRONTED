import { Dialog } from 'primereact/dialog'
import { Button } from 'primereact/button'
import { Transaction } from '../../types'
import { format } from 'date-fns'
import { es } from 'date-fns/locale'
import { formatCOP } from '../../lib/money'

interface ReceiptDialogProps {
  visible: boolean
  transaction: Transaction | null
  onClose: () => void
}

export default function ReceiptDialog({ visible, transaction, onClose }: ReceiptDialogProps) {
  if (!transaction) return null

  const handlePrint = () => {
    window.print()
  }

  const handleNewSale = () => {
    onClose()
  }

  const header = (
    <div className="flex align-items-center gap-4">
      <div 
        className="flex align-items-center justify-content-center"
        style={{
          width: '48px',
          height: '48px',
          borderRadius: '50%',
          backgroundColor: 'rgba(45, 106, 79, 0.1)'
        }}
      >
        <i className="pi pi-check text-xl" style={{ color: 'var(--pos-success)' }}></i>
      </div>
      <div>
        <h2 
          className="font-display m-0 mb-1"
          style={{ 
            fontSize: '1.5rem', 
            fontWeight: '600',
            color: 'var(--pos-text-primary)' 
          }}
        >
          Venta Completada
        </h2>
        <p className="m-0 text-sm" style={{ color: 'var(--pos-text-muted)' }}>
          Recibo #{transaction.receiptNumber}
        </p>
      </div>
    </div>
  )

  return (
    <Dialog
      visible={visible}
      onHide={onClose}
      header={header}
      style={{ width: '420px' }}
      modal
      closable={false}
      contentStyle={{ 
        backgroundColor: 'var(--pos-bg-secondary)',
        padding: '0'
      }}
      headerStyle={{
        backgroundColor: 'var(--pos-bg-secondary)',
        borderBottom: '1px solid var(--pos-border)',
        padding: '1.5rem 2rem'
      }}
    >
      {/* Receipt Content */}
      <div 
        className="p-5"
        style={{ backgroundColor: '#faf9f7', color: 'var(--pos-text-primary)' }}
      >
        {/* Store Header */}
        <div className="text-center mb-5">
          <h3 
            className="font-display m-0 mb-2"
            style={{ fontSize: '1.5rem', fontWeight: '600', letterSpacing: '-0.01em' }}
          >
            MERCATO
          </h3>
          <p className="m-0 text-sm" style={{ color: 'var(--pos-text-muted)' }}>
            Av. Principal #123, Ciudad
          </p>
          <p className="m-0 text-sm" style={{ color: 'var(--pos-text-muted)' }}>
            Tel: (555) 123-4567
          </p>
        </div>

        <div style={{ height: '1px', backgroundColor: 'var(--pos-border)', marginBottom: '1.25rem' }} />

        {/* Transaction Info */}
        <div className="flex justify-content-between text-sm mb-2">
          <span style={{ color: 'var(--pos-text-muted)' }}>Fecha</span>
          <span className="font-medium">{format(transaction.timestamp, "dd/MM/yyyy HH:mm", { locale: es })}</span>
        </div>
        <div className="flex justify-content-between text-sm mb-2">
          <span style={{ color: 'var(--pos-text-muted)' }}>Recibo</span>
          <span className="font-medium">{transaction.receiptNumber}</span>
        </div>
        <div className="flex justify-content-between text-sm mb-4">
          <span style={{ color: 'var(--pos-text-muted)' }}>Cajero</span>
          <span className="font-medium">{transaction.cashier}</span>
        </div>

        <div style={{ height: '1px', backgroundColor: 'var(--pos-border)', marginBottom: '1.25rem' }} />

        {/* Items */}
        <div className="mb-4">
          {transaction.items.map((item, index) => (
            <div key={index} className="flex justify-content-between py-3" style={{ borderBottom: '1px solid var(--pos-border)' }}>
              <div className="flex-1">
                <p className="m-0 font-medium text-sm">{item.product.name}</p>
                <p className="m-0 text-xs mt-1" style={{ color: 'var(--pos-text-muted)' }}>
                  {item.quantity} x {formatCOP(item.product.price)}
                </p>
              </div>
              <span className="font-medium text-sm">{formatCOP(item.subtotal)}</span>
            </div>
          ))}
        </div>

        {/* Totals */}
        <div className="flex justify-content-between text-sm mb-2">
          <span style={{ color: 'var(--pos-text-muted)' }}>Subtotal</span>
          <span>{formatCOP(transaction.subtotal)}</span>
        </div>
        <div className="flex justify-content-between text-sm mb-2">
          <span style={{ color: 'var(--pos-text-muted)' }}>IVA</span>
          <span>{formatCOP(transaction.taxTotal)}</span>
        </div>
        {transaction.discountTotal > 0 && (
          <div className="flex justify-content-between text-sm mb-2" style={{ color: 'var(--pos-success)' }}>
            <span>Descuento</span>
            <span>-{formatCOP(transaction.discountTotal)}</span>
          </div>
        )}
        
        <div 
          className="flex justify-content-between align-items-center mt-4 pt-4"
          style={{ borderTop: '2px solid var(--pos-text-primary)' }}
        >
          <span className="font-medium">TOTAL</span>
          <span 
            className="font-display font-semibold"
            style={{ fontSize: '1.5rem', letterSpacing: '-0.02em' }}
          >
            {formatCOP(transaction.total)}
          </span>
        </div>

        <div style={{ height: '1px', backgroundColor: 'var(--pos-border)', margin: '1.25rem 0' }} />

        {/* Payment Info */}
        <div className="text-sm mb-4">
          <div className="flex justify-content-between mb-2">
            <span style={{ color: 'var(--pos-text-muted)' }}>Metodo de pago</span>
            <span className="font-medium capitalize">{transaction.paymentMethod}</span>
          </div>
          {transaction.paymentDetails.method === 'efectivo' && (
            <>
              <div className="flex justify-content-between mb-2">
                <span style={{ color: 'var(--pos-text-muted)' }}>Efectivo recibido</span>
                <span>{formatCOP(transaction.paymentDetails.amountPaid)}</span>
              </div>
              <div className="flex justify-content-between font-medium">
                <span style={{ color: 'var(--pos-text-muted)' }}>Cambio</span>
                <span style={{ color: 'var(--pos-success)' }}>
                  {formatCOP(transaction.paymentDetails.change || 0)}
                </span>
              </div>
            </>
          )}
          {transaction.paymentDetails.method === 'tarjeta' && (
            <div className="flex justify-content-between">
              <span style={{ color: 'var(--pos-text-muted)' }}>Tarjeta</span>
              <span>**** {transaction.paymentDetails.cardLastFour}</span>
            </div>
          )}
          {transaction.paymentDetails.method === 'mixto' && (
            <>
              <div className="flex justify-content-between mb-2">
                <span style={{ color: 'var(--pos-text-muted)' }}>Efectivo</span>
                <span>{formatCOP(transaction.paymentDetails.cashAmount || 0)}</span>
              </div>
              <div className="flex justify-content-between mb-2">
                <span style={{ color: 'var(--pos-text-muted)' }}>Tarjeta</span>
                <span>{formatCOP(transaction.paymentDetails.cardAmount || 0)}</span>
              </div>
              <div className="flex justify-content-between">
                <span style={{ color: 'var(--pos-text-muted)' }}>Tarjeta registrada</span>
                <span>**** {transaction.paymentDetails.cardLastFour}</span>
              </div>
            </>
          )}
        </div>

        {/* Footer */}
        <div 
          className="text-center pt-4"
          style={{ borderTop: '1px solid var(--pos-border)' }}
        >
          <p className="m-0 font-medium">Gracias por su compra</p>
          <p className="m-0 text-xs mt-2" style={{ color: 'var(--pos-text-muted)' }}>
            Conserve este recibo para cualquier devolucion
          </p>
        </div>
      </div>

      {/* Actions */}
      <div className="flex gap-3 p-5" style={{ backgroundColor: 'var(--pos-bg-secondary)' }}>
        <Button
          label="Imprimir"
          icon="pi pi-print"
          className="p-button-outlined flex-1"
          style={{
            height: '52px',
            borderRadius: '12px',
            borderColor: 'var(--pos-border)',
            color: 'var(--pos-text-primary)',
            fontWeight: '500'
          }}
          onClick={handlePrint}
        />
        
        <Button
          label="Nueva Venta"
          icon="pi pi-plus"
          className="flex-1"
          style={{
            height: '52px',
            borderRadius: '12px',
            backgroundColor: 'var(--pos-text-primary)',
            color: 'var(--pos-bg-secondary)',
            border: 'none',
            fontWeight: '500'
          }}
          onClick={handleNewSale}
        />
      </div>
    </Dialog>
  )
}
