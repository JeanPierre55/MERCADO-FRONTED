import { usePOSStore } from '../../store/posStore'
import { format } from 'date-fns'
import { es } from 'date-fns/locale'
import { useEffect, useState } from 'react'
import { formatCOP } from '../../lib/money'

export default function Header() {
  const { getCartCount, transactions } = usePOSStore()
  const [currentTime, setCurrentTime] = useState(new Date())
  const [isOnline, setIsOnline] = useState(
    typeof navigator !== 'undefined' ? navigator.onLine : true
  )

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentTime(new Date())
    }, 1000)
    return () => clearInterval(interval)
  }, [])

  useEffect(() => {
    const handleOnline = () => setIsOnline(true)
    const handleOffline = () => setIsOnline(false)
    window.addEventListener('online', handleOnline)
    window.addEventListener('offline', handleOffline)

    return () => {
      window.removeEventListener('online', handleOnline)
      window.removeEventListener('offline', handleOffline)
    }
  }, [])

  const todaySales = transactions
    .filter(t => {
      const today = new Date()
      return t.timestamp.toDateString() === today.toDateString()
    })
    .reduce((sum, t) => sum + t.total, 0)

  const cartCount = getCartCount()

  return (
    <header 
      className="flex align-items-center justify-content-between px-5 py-3"
      style={{ 
        backgroundColor: 'var(--pos-bg-secondary)',
        borderBottom: '1px solid var(--pos-border)',
        minHeight: '80px'
      }}
    >
      {/* Logo y Marca */}
      <div className="flex align-items-center gap-4">
        <div className="flex align-items-center gap-3">
          <h1 
            className="font-display m-0"
            style={{ 
              fontSize: '2rem',
              fontWeight: '600',
              color: 'var(--pos-text-primary)',
              letterSpacing: '-0.02em'
            }}
          >
            MERCATO
          </h1>
          <span 
            className="pos-tag"
            style={{
              backgroundColor: 'var(--pos-bg-tertiary)',
              color: 'var(--pos-text-secondary)',
              fontSize: '0.65rem',
              textTransform: 'uppercase',
              letterSpacing: '0.1em'
            }}
          >
            POS
          </span>
        </div>
      </div>

      {/* Info Central */}
      <div className="flex align-items-center gap-6">
        <div className="flex flex-column align-items-center">
          <span 
            className="text-xs mb-1"
            style={{ 
              color: 'var(--pos-text-muted)', 
              textTransform: 'uppercase',
              letterSpacing: '0.1em',
              fontSize: '0.65rem'
            }}
          >
            Fecha
          </span>
          <span 
            className="font-medium"
            style={{ color: 'var(--pos-text-primary)', fontSize: '0.9rem' }}
          >
            {format(currentTime, "dd MMM yyyy", { locale: es })}
          </span>
        </div>

        <div 
          style={{ 
            width: '1px', 
            height: '32px', 
            backgroundColor: 'var(--pos-border)' 
          }} 
        />

        <div className="flex flex-column align-items-center">
          <span 
            className="text-xs mb-1"
            style={{ 
              color: 'var(--pos-text-muted)', 
              textTransform: 'uppercase',
              letterSpacing: '0.1em',
              fontSize: '0.65rem'
            }}
          >
            Hora
          </span>
          <span 
            className="font-medium"
            style={{ 
              color: 'var(--pos-text-primary)', 
              fontSize: '0.9rem',
              fontVariantNumeric: 'tabular-nums'
            }}
          >
            {format(currentTime, 'HH:mm:ss')}
          </span>
        </div>

        <div 
          style={{ 
            width: '1px', 
            height: '32px', 
            backgroundColor: 'var(--pos-border)' 
          }} 
        />

        <div className="flex flex-column align-items-center">
          <span 
            className="text-xs mb-1"
            style={{ 
              color: 'var(--pos-text-muted)', 
              textTransform: 'uppercase',
              letterSpacing: '0.1em',
              fontSize: '0.65rem'
            }}
          >
            Ventas Hoy
          </span>
          <span 
            className="font-semibold"
            style={{ color: 'var(--pos-success)', fontSize: '0.9rem' }}
          >
            {formatCOP(todaySales)}
          </span>
        </div>
      </div>

      {/* Usuario y Carrito */}
      <div className="flex align-items-center gap-4">
        <span
          className="pos-tag"
          style={{
            backgroundColor: isOnline ? 'rgba(45, 106, 79, 0.14)' : 'rgba(155, 34, 38, 0.14)',
            color: isOnline ? 'var(--pos-success)' : 'var(--pos-danger)',
            minWidth: '110px',
            justifyContent: 'center',
          }}
        >
          {isOnline ? 'En linea' : 'Modo offline'}
        </span>

        <div 
          className="flex align-items-center gap-3 px-4 py-2"
          style={{
            backgroundColor: 'var(--pos-bg-tertiary)',
            borderRadius: '100px'
          }}
        >
          <div 
            className="flex align-items-center justify-content-center"
            style={{
              width: '32px',
              height: '32px',
              borderRadius: '50%',
              backgroundColor: 'var(--pos-bg-secondary)',
              border: '2px solid var(--pos-border)'
            }}
          >
            <i className="pi pi-user text-sm" style={{ color: 'var(--pos-text-secondary)' }}></i>
          </div>
          <div className="flex flex-column">
            <span 
              className="text-xs"
              style={{ color: 'var(--pos-text-muted)', fontSize: '0.65rem' }}
            >
              Cajero
            </span>
            <span 
              className="font-medium"
              style={{ color: 'var(--pos-text-primary)', fontSize: '0.85rem' }}
            >
              Maria G.
            </span>
          </div>
        </div>

        <div 
          className="flex align-items-center justify-content-center relative"
          style={{
            width: '44px',
            height: '44px',
            borderRadius: '12px',
            backgroundColor: 'var(--pos-text-primary)',
            cursor: 'pointer',
            transition: 'transform 0.2s ease'
          }}
        >
          <i className="pi pi-shopping-bag text-lg" style={{ color: 'var(--pos-bg-secondary)' }}></i>
          {cartCount > 0 && (
            <span 
              className="absolute flex align-items-center justify-content-center"
              style={{
                top: '-6px',
                right: '-6px',
                width: '20px',
                height: '20px',
                borderRadius: '50%',
                backgroundColor: 'var(--pos-accent)',
                color: 'white',
                fontSize: '0.7rem',
                fontWeight: '600'
              }}
            >
              {cartCount}
            </span>
          )}
        </div>
      </div>
    </header>
  )
}
