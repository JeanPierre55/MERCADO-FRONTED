import { useState, useEffect } from 'react'
import { Dialog } from 'primereact/dialog'
import { Button } from 'primereact/button'
import { InputNumber } from 'primereact/inputnumber'
import { usePOSStore } from '../../store/posStore'
import { PaymentMethod } from '../../types'
import { formatCOP } from '../../lib/money'
import { logCheckoutStarted, logCheckoutCompleted, logCheckoutValidationError } from '../../loggers/checkoutLogger'
import { useAuthStore } from '../../auth/authStore'

export default function CheckoutDialog() {
  const { 
    isCheckoutOpen, 
    closeCheckout, 
    getTotal, 
    processPayment,
    cart 
  } = usePOSStore()

  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('efectivo')
  const [cashAmount, setCashAmount] = useState<number>(0)
  const [cardLastFour, setCardLastFour] = useState('')
  const [isProcessing, setIsProcessing] = useState(false)

  // Log checkout started when dialog opens
  useEffect(() => {
    if (isCheckoutOpen) {
      const username = useAuthStore().session?.user.displayName ?? 'Desconocido'
      logCheckoutStarted(getTotal(), paymentMethod, username)
    }
  }, [isCheckoutOpen])

  const total = getTotal()
  const safeCashAmount = Math.max(0, cashAmount)
  const mixedCardAmount = Math.max(0, total - safeCashAmount)
  const change = safeCashAmount - total

  const getSuggestedMixedCashAmount = () => {
    const capped = Math.min(20000, total - 1)
    return Math.max(0, Math.round(capped))
  }

  const selectPaymentMethod = (method: PaymentMethod) => {
    setPaymentMethod(method)

    if (method === 'mixto') {
      setCashAmount((current) => {
        if (current > 0 && current < total) {
          return current
        }
        return getSuggestedMixedCashAmount()
      })
    }
  }

  const resetPaymentForm = () => {
    setCashAmount(0)
    setCardLastFour('')
    setPaymentMethod('efectivo')
    setIsProcessing(false)
  }

  const handleCloseDialog = () => {
    resetPaymentForm()
    closeCheckout()
  }

  const handlePayment = async () => {
    setIsProcessing(true)
    
    await new Promise(resolve => setTimeout(resolve, 1500))
    
    const transaction = processPayment(paymentMethod, {
      method: paymentMethod,
      amountPaid: paymentMethod === 'efectivo' ? safeCashAmount : total,
      change: paymentMethod === 'efectivo' ? Math.max(0, change) : undefined,
      cardLastFour: paymentMethod !== 'efectivo' ? cardLastFour : undefined,
      cashAmount: paymentMethod === 'mixto' ? safeCashAmount : undefined,
      cardAmount: paymentMethod === 'mixto' ? mixedCardAmount : undefined,
    })

    // Log checkout completed after processPayment returns
    const username = useAuthStore().session?.user.displayName ?? 'Desconocido'
    logCheckoutCompleted(transaction.receiptNumber, transaction.total, paymentMethod, username)

    resetPaymentForm()
  }

  const quickAmounts = [10000, 20000, 50000, 100000, 200000]

  const isValidPayment = () => {
    if (paymentMethod === 'efectivo') {
      return safeCashAmount >= total
    }
    if (paymentMethod === 'tarjeta') {
      return cardLastFour.length === 4
    }
    if (paymentMethod === 'mixto') {
      return cardLastFour.length === 4 && safeCashAmount > 0 && mixedCardAmount > 0 && safeCashAmount < total
    }
    return true
  }

  const handleValidationError = () => {
    const username = useAuthStore().session?.user.displayName ?? 'Desconocido'
    
    if (paymentMethod === 'efectivo') {
      if (safeCashAmount < total) {
        logCheckoutValidationError('Monto insuficiente en efectivo', username)
      }
    } else if (paymentMethod === 'tarjeta') {
      if (cardLastFour.length !== 4) {
        logCheckoutValidationError('Últimos 4 dígitos de tarjeta requeridos', username)
      }
    } else if (paymentMethod === 'mixto') {
      if (cardLastFour.length !== 4) {
        logCheckoutValidationError('Últimos 4 dígitos de tarjeta requeridos', username)
      } else if (safeCashAmount <= 0) {
        logCheckoutValidationError('Monto en efectivo requerido', username)
      } else if (safeCashAmount >= total) {
        logCheckoutValidationError('Monto en efectivo debe ser menor al total', username)
      }
    }
  }

  const header = (
    <div className="flex align-items-center gap-4">
      <div 
        className="flex align-items-center justify-content-center"
        style={{
          width: '48px',
          height: '48px',
          borderRadius: '50%',
          backgroundColor: 'var(--pos-bg-tertiary)'
        }}
      >
        <i className="pi pi-credit-card text-xl" style={{ color: 'var(--pos-text-primary)' }}></i>
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
          Procesar Pago
        </h2>
        <p className="m-0 text-sm" style={{ color: 'var(--pos-text-muted)' }}>
          {cart.length} {cart.length === 1 ? 'articulo' : 'articulos'} en la orden
        </p>
      </div>
    </div>
  )

  return (
    <Dialog
      visible={isCheckoutOpen}
      onHide={handleCloseDialog}
      header={header}
      style={{ width: '480px' }}
      modal
      contentStyle={{ 
        backgroundColor: 'var(--pos-bg-secondary)',
        padding: '2rem'
      }}
      headerStyle={{
        backgroundColor: 'var(--pos-bg-secondary)',
        borderBottom: '1px solid var(--pos-border)',
        padding: '1.5rem 2rem'
      }}
    >
      {/* Total Display */}
      <div 
        className="flex flex-column align-items-center p-5 mb-5"
        style={{
          backgroundColor: 'var(--pos-bg-primary)',
          borderRadius: '16px'
        }}
      >
        <span 
          className="text-xs mb-2"
          style={{ 
            color: 'var(--pos-text-muted)',
            textTransform: 'uppercase',
            letterSpacing: '0.1em'
          }}
        >
          Total a pagar
        </span>
        <span 
          className="font-display"
          style={{ 
            color: 'var(--pos-text-primary)',
            fontSize: '3rem',
            fontWeight: '600',
            letterSpacing: '-0.02em'
          }}
        >
          {formatCOP(total)}
        </span>
      </div>

      {/* Payment Method Selection */}
      <div className="mb-5">
        <p 
          className="text-xs mb-3"
          style={{ 
            color: 'var(--pos-text-muted)',
            textTransform: 'uppercase',
            letterSpacing: '0.1em'
          }}
        >
          Metodo de pago
        </p>
        <div className="flex gap-3">
          <button 
            className="flex-1 flex flex-column align-items-center p-4 cursor-pointer transition-all transition-duration-200 border-none"
            style={{
              backgroundColor: paymentMethod === 'efectivo' 
                ? 'var(--pos-text-primary)' 
                : 'var(--pos-bg-tertiary)',
              borderRadius: '14px'
            }}
            onClick={() => selectPaymentMethod('efectivo')}
          >
            <i 
              className="pi pi-wallet text-2xl mb-2"
              style={{ 
                color: paymentMethod === 'efectivo' 
                  ? 'var(--pos-bg-secondary)' 
                  : 'var(--pos-text-secondary)' 
              }}
            ></i>
            <span 
              className="font-medium"
              style={{ 
                color: paymentMethod === 'efectivo' 
                  ? 'var(--pos-bg-secondary)' 
                  : 'var(--pos-text-primary)',
                fontSize: '0.9rem'
              }}
            >
              Efectivo
            </span>
          </button>

          <button 
            className="flex-1 flex flex-column align-items-center p-4 cursor-pointer transition-all transition-duration-200 border-none"
            style={{
              backgroundColor: paymentMethod === 'tarjeta' 
                ? 'var(--pos-text-primary)' 
                : 'var(--pos-bg-tertiary)',
              borderRadius: '14px'
            }}
            onClick={() => selectPaymentMethod('tarjeta')}
          >
            <i 
              className="pi pi-credit-card text-2xl mb-2"
              style={{ 
                color: paymentMethod === 'tarjeta' 
                  ? 'var(--pos-bg-secondary)' 
                  : 'var(--pos-text-secondary)' 
              }}
            ></i>
            <span 
              className="font-medium"
              style={{ 
                color: paymentMethod === 'tarjeta' 
                  ? 'var(--pos-bg-secondary)' 
                  : 'var(--pos-text-primary)',
                fontSize: '0.9rem'
              }}
            >
              Tarjeta
            </span>
          </button>

          <button
            className="flex-1 flex flex-column align-items-center p-4 cursor-pointer transition-all transition-duration-200 border-none"
            style={{
              backgroundColor: paymentMethod === 'mixto'
                ? 'var(--pos-text-primary)'
                : 'var(--pos-bg-tertiary)',
              borderRadius: '14px',
            }}
            onClick={() => selectPaymentMethod('mixto')}
          >
            <i
              className="pi pi-wallet text-2xl mb-2"
              style={{
                color: paymentMethod === 'mixto'
                  ? 'var(--pos-bg-secondary)'
                  : 'var(--pos-text-secondary)',
              }}
            ></i>
            <span
              className="font-medium"
              style={{
                color: paymentMethod === 'mixto'
                  ? 'var(--pos-bg-secondary)'
                  : 'var(--pos-text-primary)',
                fontSize: '0.9rem',
              }}
            >
              Mixto
            </span>
          </button>
        </div>
      </div>

      <div 
        className="mb-5"
        style={{ height: '1px', backgroundColor: 'var(--pos-border)' }} 
      />

      {/* Cash Payment */}
      {paymentMethod === 'efectivo' && (
        <div className="mb-5">
          <p 
            className="text-xs mb-3"
            style={{ 
              color: 'var(--pos-text-muted)',
              textTransform: 'uppercase',
              letterSpacing: '0.1em'
            }}
          >
            Monto recibido
          </p>
          
          <InputNumber
            value={cashAmount}
            onValueChange={(e) => setCashAmount(e.value || 0)}
            mode="currency"
            currency="COP"
            locale="es-CO"
            minFractionDigits={0}
            maxFractionDigits={0}
            className="w-full mb-4"
            inputStyle={{
              width: '100%',
              fontSize: '1.75rem',
              fontWeight: '600',
              textAlign: 'center',
              backgroundColor: 'var(--pos-bg-tertiary)',
              border: '1.5px solid var(--pos-border)',
              borderRadius: '12px',
              color: 'var(--pos-text-primary)',
              padding: '1rem'
            }}
          />

          <div className="flex flex-wrap gap-2 mb-4">
            {quickAmounts.map((amount) => (
              <button
                key={amount}
                className="flex-1 border-none cursor-pointer py-3"
                style={{
                  minWidth: '70px',
                  borderRadius: '10px',
                  backgroundColor: 'var(--pos-bg-tertiary)',
                  color: 'var(--pos-text-primary)',
                  fontWeight: '500',
                  fontSize: '0.9rem'
                }}
                onClick={() => setCashAmount(amount)}
              >
                {formatCOP(amount)}
              </button>
            ))}
            <button
              className="border-none cursor-pointer py-3 px-4"
              style={{
                borderRadius: '10px',
                backgroundColor: 'var(--pos-success)',
                color: 'white',
                fontWeight: '500',
                fontSize: '0.9rem'
              }}
              onClick={() => setCashAmount(Math.ceil(total))}
            >
              Exacto
            </button>
          </div>

          {cashAmount >= total && (
            <div 
              className="flex justify-content-between align-items-center p-4 animate-slide-up"
              style={{
                backgroundColor: 'rgba(45, 106, 79, 0.08)',
                borderRadius: '12px',
                border: '1px solid rgba(45, 106, 79, 0.2)'
              }}
            >
              <span style={{ color: 'var(--pos-text-secondary)' }}>Cambio a devolver</span>
              <span 
                className="font-display font-semibold"
                style={{ color: 'var(--pos-success)', fontSize: '1.5rem' }}
              >
                {formatCOP(change)}
              </span>
            </div>
          )}
        </div>
      )}

      {/* Card Payment */}
      {paymentMethod === 'tarjeta' && (
        <div className="mb-5">
          <p 
            className="text-xs mb-3"
            style={{ 
              color: 'var(--pos-text-muted)',
              textTransform: 'uppercase',
              letterSpacing: '0.1em'
            }}
          >
            Ultimos 4 digitos
          </p>
          
          <div 
            className="flex align-items-center gap-3 p-4"
            style={{
              backgroundColor: 'var(--pos-bg-tertiary)',
              borderRadius: '12px'
            }}
          >
            <i className="pi pi-credit-card text-xl" style={{ color: 'var(--pos-text-muted)' }}></i>
            <span style={{ color: 'var(--pos-text-muted)', letterSpacing: '0.2em' }}>
              **** **** ****
            </span>
            <input
              type="text"
              value={cardLastFour}
              onChange={(e) => setCardLastFour(e.target.value.replace(/\D/g, '').slice(0, 4))}
              maxLength={4}
              placeholder="0000"
              className="border-none outline-none font-semibold"
              style={{
                width: '70px',
                backgroundColor: 'transparent',
                color: 'var(--pos-text-primary)',
                fontSize: '1.25rem',
                letterSpacing: '0.15em'
              }}
            />
          </div>
          
          <p 
            className="text-xs mt-3 flex align-items-center gap-2"
            style={{ color: 'var(--pos-text-muted)' }}
          >
            <i className="pi pi-info-circle"></i>
            Ingrese los ultimos 4 digitos para el registro
          </p>
        </div>
      )}

      {paymentMethod === 'mixto' && (
        <div className="mb-5 flex flex-column gap-4">
          <div>
            <p
              className="text-xs mb-3"
              style={{
                color: 'var(--pos-text-muted)',
                textTransform: 'uppercase',
                letterSpacing: '0.1em',
              }}
            >
              Monto en efectivo
            </p>

            <InputNumber
              value={cashAmount}
              onValueChange={(e) => setCashAmount(e.value || 0)}
            mode="currency"
            currency="COP"
            locale="es-CO"
            minFractionDigits={0}
            maxFractionDigits={0}
            className="w-full"
              inputStyle={{
                width: '100%',
                fontSize: '1.25rem',
                fontWeight: '600',
                textAlign: 'center',
                backgroundColor: 'var(--pos-bg-tertiary)',
                border: '1.5px solid var(--pos-border)',
                borderRadius: '12px',
                color: 'var(--pos-text-primary)',
                padding: '1rem',
              }}
            />

            <div className="flex flex-wrap gap-2 mt-3">
              {quickAmounts.map((amount) => (
                <button
                  key={amount}
                  className="flex-1 border-none cursor-pointer py-2"
                  style={{
                    minWidth: '70px',
                    borderRadius: '10px',
                    backgroundColor: 'var(--pos-bg-tertiary)',
                    color: 'var(--pos-text-primary)',
                    fontWeight: '500',
                    fontSize: '0.85rem',
                  }}
                  onClick={() => setCashAmount(Math.min(amount, total - 1))}
                >
                  {formatCOP(amount)}
                </button>
              ))}
            </div>
          </div>

          <div
            className="p-4"
            style={{
              backgroundColor: 'var(--pos-bg-tertiary)',
              borderRadius: '12px',
              border: '1.5px solid var(--pos-border)',
            }}
          >
            <div className="flex justify-content-between mb-2">
              <span style={{ color: 'var(--pos-text-secondary)' }}>Monto en tarjeta</span>
              <span className="font-semibold" style={{ color: 'var(--pos-text-primary)' }}>
                {formatCOP(mixedCardAmount)}
              </span>
            </div>
            <p className="m-0 text-xs" style={{ color: 'var(--pos-text-muted)' }}>
              Calculado automaticamente para completar el total.
            </p>
          </div>

          <div>
            <p
              className="text-xs mb-3"
              style={{
                color: 'var(--pos-text-muted)',
                textTransform: 'uppercase',
                letterSpacing: '0.1em',
              }}
            >
              Ultimos 4 digitos de tarjeta
            </p>
            <input
              type="text"
              value={cardLastFour}
              onChange={(e) => setCardLastFour(e.target.value.replace(/\D/g, '').slice(0, 4))}
              maxLength={4}
              placeholder="0000"
              className="border-none outline-none font-semibold w-full"
              style={{
                backgroundColor: 'var(--pos-bg-tertiary)',
                borderRadius: '12px',
                color: 'var(--pos-text-primary)',
                fontSize: '1.25rem',
                letterSpacing: '0.15em',
                padding: '1rem',
              }}
            />
          </div>
        </div>
      )}

      {/* Action Buttons */}
      <div className="flex gap-3">
        <Button
          label="Cancelar"
          className="p-button-outlined flex-1"
          style={{
            height: '52px',
            borderRadius: '12px',
            borderColor: 'var(--pos-border)',
            color: 'var(--pos-text-primary)',
            fontWeight: '500'
          }}
          onClick={handleCloseDialog}
          disabled={isProcessing}
        />
        
        <Button
          label={isProcessing ? 'Procesando...' : 'Confirmar Pago'}
          icon={isProcessing ? 'pi pi-spin pi-spinner' : 'pi pi-check'}
          className="flex-1"
          style={{
            height: '52px',
            borderRadius: '12px',
            backgroundColor: isValidPayment() ? 'var(--pos-text-primary)' : 'var(--pos-bg-tertiary)',
            color: isValidPayment() ? 'var(--pos-bg-secondary)' : 'var(--pos-text-muted)',
            border: 'none',
            fontWeight: '500'
          }}
          onClick={() => {
            if (!isValidPayment()) {
              handleValidationError()
            } else {
              handlePayment()
            }
          }}
          disabled={!isValidPayment() || isProcessing}
        />
      </div>
    </Dialog>
  )
}
