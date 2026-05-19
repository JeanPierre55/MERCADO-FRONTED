import { useMemo } from 'react'
import { Tooltip } from 'primereact/tooltip'
import { usePOSStore } from '../../store/posStore'
import { formatCOP } from '../../lib/money'

interface SidebarProps {
  collapsed: boolean
  onToggle: () => void
}

const Sidebar = ({ collapsed, onToggle }: SidebarProps) => {
  const { cart, transactions } = usePOSStore()

  const cartTotal = useMemo(() => 
    cart.reduce((sum, item) => sum + item.quantity, 0),
    [cart]
  )

  const dailySales = useMemo(() => {
    const today = new Date().toDateString()
    return transactions
      .filter((transaction) => transaction.timestamp.toDateString() === today)
      .reduce((sum, transaction) => sum + transaction.total, 0)
  }, [transactions])

  const menuItems = [
    { icon: 'pi-th-large', label: 'Terminal', active: true, tooltip: 'Terminal POS' },
    { icon: 'pi-box', label: 'Inventario', active: false, tooltip: 'Gestion de Inventario' },
    { icon: 'pi-chart-bar', label: 'Reportes', active: false, tooltip: 'Reportes de Ventas' },
    { icon: 'pi-users', label: 'Clientes', active: false, tooltip: 'Gestion de Clientes' },
    { icon: 'pi-cog', label: 'Ajustes', active: false, tooltip: 'Configuracion' },
  ]

  return (
    <aside 
      className="sidebar flex flex-column h-full transition-all transition-duration-300"
      style={{ 
        width: collapsed ? '72px' : '220px',
        minWidth: collapsed ? '72px' : '220px',
      }}
    >
      {/* Logo */}
      <div 
        className="flex align-items-center justify-content-center py-4 px-3 cursor-pointer"
        onClick={onToggle}
        style={{ borderBottom: '1px solid var(--pos-border)' }}
      >
        <div className="flex align-items-center gap-2">
          <div 
            className="flex align-items-center justify-content-center"
            style={{ 
              width: '40px', 
              height: '40px', 
              background: 'linear-gradient(135deg, var(--pos-accent) 0%, #ff8c5a 100%)',
              borderRadius: '10px',
            }}
          >
            <i className="pi pi-bolt text-white text-xl" />
          </div>
          {!collapsed && (
            <div className="animate-fade-in">
              <span 
                className="font-bold text-lg"
                style={{ 
                  color: 'var(--pos-text-primary)',
                  letterSpacing: '0.05em'
                }}
              >
                NEXUS
              </span>
              <span 
                className="text-xs block"
                style={{ color: 'var(--pos-text-muted)', letterSpacing: '0.15em' }}
              >
                POINT OF SALE
              </span>
            </div>
          )}
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 py-4 px-2">
        <ul className="list-none m-0 p-0 flex flex-column gap-1">
          {menuItems.map((item, index) => (
            <li key={index}>
              <Tooltip target={`.menu-item-${index}`} content={item.tooltip} position="right" />
              <div 
                className={`menu-item-${index} sidebar-item ${item.active ? 'active' : ''}`}
                style={{ justifyContent: collapsed ? 'center' : 'flex-start' }}
              >
                <i className={`pi ${item.icon} text-lg`} />
                {!collapsed && (
                  <span className="font-medium text-sm animate-fade-in">{item.label}</span>
                )}
              </div>
            </li>
          ))}
        </ul>
      </nav>

      {/* Stats */}
      <div className="p-3" style={{ borderTop: '1px solid var(--pos-border)' }}>
        {!collapsed ? (
          <div className="animate-fade-in">
            <div className="stat-card mb-2">
              <div className="flex align-items-center justify-content-between mb-2">
                <span className="text-xs font-semibold" style={{ color: 'var(--pos-text-muted)', letterSpacing: '0.1em' }}>
                  VENTAS HOY
                </span>
                <div className="data-indicator">
                  <span className="data-indicator-dot" style={{ background: 'var(--pos-success)' }} />
                </div>
              </div>
              <span className="stat-card-value neon-text">
                {formatCOP(dailySales)}
              </span>
            </div>
            <div className="stat-card">
              <div className="flex align-items-center justify-content-between mb-2">
                <span className="text-xs font-semibold" style={{ color: 'var(--pos-text-muted)', letterSpacing: '0.1em' }}>
                  EN CARRITO
                </span>
              </div>
              <span className="stat-card-value" style={{ fontSize: '1.5rem' }}>
                {cartTotal} <span className="text-sm font-normal" style={{ color: 'var(--pos-text-muted)' }}>items</span>
              </span>
            </div>
          </div>
        ) : (
          <div className="flex flex-column align-items-center gap-3">
            <Tooltip target=".stat-sales" content={`Ventas: ${formatCOP(dailySales)}`} position="right" />
            <div 
              className="stat-sales flex align-items-center justify-content-center"
              style={{ 
                width: '40px', 
                height: '40px', 
                background: 'var(--pos-bg-tertiary)', 
                borderRadius: '8px',
                border: '1px solid var(--pos-border)'
              }}
            >
              <i className="pi pi-dollar neon-text" />
            </div>
            <Tooltip target=".stat-cart" content={`${cartTotal} items en carrito`} position="right" />
            <div 
              className="stat-cart flex align-items-center justify-content-center relative"
              style={{ 
                width: '40px', 
                height: '40px', 
                background: 'var(--pos-bg-tertiary)', 
                borderRadius: '8px',
                border: '1px solid var(--pos-border)'
              }}
            >
              <i className="pi pi-shopping-cart" style={{ color: 'var(--pos-text-secondary)' }} />
              {cartTotal > 0 && (
                <span 
                  className="absolute flex align-items-center justify-content-center"
                  style={{ 
                    top: '-4px', 
                    right: '-4px', 
                    width: '18px', 
                    height: '18px',
                    background: 'var(--pos-accent)',
                    borderRadius: '50%',
                    fontSize: '0.65rem',
                    fontWeight: 700,
                    color: 'white'
                  }}
                >
                  {cartTotal}
                </span>
              )}
            </div>
          </div>
        )}
      </div>

      {/* User */}
      <div 
        className="p-3 flex align-items-center gap-3"
        style={{ borderTop: '1px solid var(--pos-border)' }}
      >
        <div 
          className="flex align-items-center justify-content-center flex-shrink-0"
          style={{ 
            width: '40px', 
            height: '40px', 
            background: 'linear-gradient(135deg, var(--pos-neon-blue) 0%, var(--pos-neon-cyan) 100%)',
            borderRadius: '10px'
          }}
        >
          <span className="font-bold text-white">MR</span>
        </div>
        {!collapsed && (
          <div className="animate-fade-in overflow-hidden">
            <span className="font-semibold text-sm block white-space-nowrap" style={{ color: 'var(--pos-text-primary)' }}>
              Maria Rodriguez
            </span>
            <span className="text-xs block" style={{ color: 'var(--pos-text-muted)' }}>
              Cajera Principal
            </span>
          </div>
        )}
      </div>
    </aside>
  )
}

export default Sidebar
