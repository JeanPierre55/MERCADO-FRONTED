/**
 * Componente raíz de la aplicación POS MERCATO.
 *
 * Integra el módulo de Productos & Ventas (API Gateway) junto con el
 * sistema POS existente (ProductCatalog, ShoppingCart, CheckoutDialog).
 * El panel de API se muestra como un panel flotante accesible desde
 * un botón en la esquina inferior derecha.
 *
 * Requirements: 7.3, 7.4
 */

import { Toast } from 'primereact/toast'
import { useRef, useState, useEffect, useCallback } from 'react'
import Header from './components/layout/Header'
import ProductCatalog from './components/products/ProductCatalog'
import ShoppingCart from './components/cart/ShoppingCart'
import CheckoutDialog from './components/checkout/CheckoutDialog'
import ReceiptDialog from './components/receipt/ReceiptDialog'
import { usePOSStore } from './store/posStore'
import { getProductos, Producto } from './services/productosService'
import { registrarVenta, ProductoSeleccionado } from './services/ventasService'

// ── Tipos locales ─────────────────────────────────────────────────────────────

interface ProductoEnVenta extends ProductoSeleccionado {
  nombre: string
  precio: number
}

function esElementoEditable(target: EventTarget | null): boolean {
  if (!(target instanceof HTMLElement)) return false
  const tag = target.tagName
  return target.isContentEditable || tag === 'INPUT' || tag === 'TEXTAREA' || tag === 'SELECT'
}

// ── Componente principal ──────────────────────────────────────────────────────

function App() {
  const toast = useRef<Toast>(null)
  const searchInputRef = useRef<HTMLInputElement>(null)
  const { currentReceipt, setCurrentReceipt, clearCart, isCheckoutOpen, closeCheckout } = usePOSStore()

  // Visibilidad del panel flotante de API
  const [panelVisible, setPanelVisible] = useState<boolean>(false)

  // Estado del catálogo desde API
  const [productos, setProductos] = useState<Producto[]>([])
  const [loadingProductos, setLoadingProductos] = useState<boolean>(false)
  const [errorProductos, setErrorProductos] = useState<string | null>(null)

  // Estado de la venta en curso
  const [productosEnVenta, setProductosEnVenta] = useState<ProductoEnVenta[]>([])
  const [productoSeleccionadoId, setProductoSeleccionadoId] = useState<string | null>(null)
  const [submitting, setSubmitting] = useState<boolean>(false)
  const [mensajeExito, setMensajeExito] = useState<string | null>(null)
  const [mensajeError, setMensajeError] = useState<string | null>(null)

  // Cargar productos cuando se abre el panel
  const cargarProductos = useCallback(async () => {
    setLoadingProductos(true)
    setErrorProductos(null)
    try {
      const data = await getProductos()
      setProductos(data)
    } catch (err) {
      setErrorProductos(
        err instanceof Error ? err.message : 'Error al cargar productos.'
      )
    } finally {
      setLoadingProductos(false)
    }
  }, [])

  useEffect(() => {
    if (panelVisible && productos.length === 0 && !loadingProductos) {
      cargarProductos()
    }
  }, [panelVisible, productos.length, loadingProductos, cargarProductos])

  useEffect(() => {
    setProductoSeleccionadoId(prev => {
      if (productosEnVenta.length === 0) return null
      if (prev && productosEnVenta.some(p => p.id === prev)) return prev
      return productosEnVenta[0].id
    })
  }, [productosEnVenta])

  // Agregar producto a la venta
  function handleAgregarProducto(producto: Producto) {
    setMensajeExito(null)
    setMensajeError(null)
    setProductoSeleccionadoId(producto.id)
    setProductosEnVenta(prev => {
      const existente = prev.find(p => p.id === producto.id)
      if (existente) {
        return prev.map(p =>
          p.id === producto.id ? { ...p, cantidad: p.cantidad + 1 } : p
        )
      }
      return [...prev, { id: producto.id, cantidad: 1, nombre: producto.nombre, precio: producto.precio }]
    })
  }

  // Cambiar cantidad de un producto en la venta
  function handleCambiarCantidad(id: string, delta: number) {
    setProductosEnVenta(prev =>
      prev
        .map(p => p.id === id ? { ...p, cantidad: p.cantidad + delta } : p)
        .filter(p => p.cantidad > 0)
    )
  }

  // Quitar producto de la venta
  function handleQuitarProducto(id: string) {
    setProductosEnVenta(prev => prev.filter(p => p.id !== id))
  }

  // Confirmar y registrar la venta
  async function handleConfirmarVenta() {
    if (productosEnVenta.length === 0 || submitting) return

    setSubmitting(true)
    setMensajeExito(null)
    setMensajeError(null)

    try {
      const respuesta = await registrarVenta({
        productos: productosEnVenta.map(p => ({ id: p.id, cantidad: p.cantidad })),
      })
      setMensajeExito(respuesta.message)
      setProductosEnVenta([]) // Limpiar selección tras éxito
    } catch (err) {
      setMensajeError(
        err instanceof Error ? err.message : 'Error al registrar la venta. Intente nuevamente.'
      )
      // Mantener productosEnVenta para que el cajero pueda reintentar
    } finally {
      setSubmitting(false)
    }
  }

  const total = productosEnVenta.reduce((sum, p) => sum + p.precio * p.cantidad, 0)
  const botonVentaDeshabilitado = productosEnVenta.length === 0 || submitting

  // ── Atajos de teclado ───────────────────────────────────────────────────────
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      // Shift + Q/W/E/R/T
      if (e.shiftKey) {
        switch (e.key.toLowerCase()) {
          case 'q':
            e.preventDefault()
            searchInputRef.current?.focus()
            searchInputRef.current?.select()
            return

          case 'w':
            e.preventDefault()
            setPanelVisible(true)
            return

          case 'e':
            e.preventDefault()
            if (searchInputRef.current) {
              searchInputRef.current.value = ''
              searchInputRef.current.dispatchEvent(new Event('input', { bubbles: true }))
            }
            return

          case 'r':
            e.preventDefault()
            clearCart()
            toast.current?.show({
              severity: 'info',
              summary: 'Carrito vaciado',
              detail: 'Se eliminaron todos los productos del carrito',
              life: 2000,
            })
            return

          case 't':
            e.preventDefault()
            setProductos([])
            cargarProductos().then(() => {
              toast.current?.show({
                severity: 'success',
                summary: 'Productos actualizados',
                detail: 'Catálogo sincronizado con AWS',
                life: 2000,
              })
            })
            return
        }
      }

      // Esc → Cerrar modal/panel
      if (e.key === 'Escape') {
        let cerraronAlgo = false

        if (panelVisible) {
          setPanelVisible(false)
          cerraronAlgo = true
        }
        if (isCheckoutOpen) {
          closeCheckout()
          cerraronAlgo = true
        }
        if (currentReceipt) {
          setCurrentReceipt(null)
          cerraronAlgo = true
        }
        if (cerraronAlgo) {
          e.preventDefault()
        }
        return
      }

      // Evitar choque con escritura en inputs/textarea/select
      if (esElementoEditable(e.target)) return

      // Atajos de venta aplican cuando el panel API está abierto
      if (!panelVisible || productosEnVenta.length === 0) return

      const idSeleccionado =
        productoSeleccionadoId && productosEnVenta.some(p => p.id === productoSeleccionadoId)
          ? productoSeleccionadoId
          : productosEnVenta[0]?.id

      if (!idSeleccionado) return

      if (e.key === 'Enter') {
        if (!botonVentaDeshabilitado) {
          e.preventDefault()
          void handleConfirmarVenta()
        }
        return
      }

      if (e.key === '+' || e.code === 'NumpadAdd') {
        e.preventDefault()
        handleCambiarCantidad(idSeleccionado, 1)
        return
      }

      if (e.key === '-' || e.code === 'NumpadSubtract') {
        e.preventDefault()
        handleCambiarCantidad(idSeleccionado, -1)
        return
      }

      if (e.key === 'Delete') {
        e.preventDefault()
        handleQuitarProducto(idSeleccionado)
      }
    }

    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [
    botonVentaDeshabilitado,
    cargarProductos,
    clearCart,
    closeCheckout,
    currentReceipt,
    handleConfirmarVenta,
    isCheckoutOpen,
    panelVisible,
    productoSeleccionadoId,
    productosEnVenta,
    setCurrentReceipt,
  ])
  // ── Fin atajos ──────────────────────────────────────────────────────────────

  return (
    <div
      className="flex flex-column h-full"
      style={{ backgroundColor: 'var(--pos-bg-primary)' }}
    >
      <Toast ref={toast} position="top-right" />

      <Header />

      <main className="flex flex-1 overflow-hidden">
        {/* Catálogo de productos POS — lado izquierdo */}
        <section
          className="flex-1 overflow-hidden"
          style={{ backgroundColor: 'var(--pos-bg-primary)' }}
        >
          <ProductCatalog toast={toast} searchInputRef={searchInputRef} />
        </section>

        {/* Carrito POS — lado derecho */}
        <aside
          style={{
            width: '400px',
            minWidth: '360px',
            backgroundColor: 'var(--pos-bg-secondary)',
          }}
        >
          <ShoppingCart />
        </aside>
      </main>

      {/* ── Panel flotante de Productos & Ventas (API Gateway) ── */}
      <div
        style={{
          position: 'fixed',
          bottom: '1.5rem',
          right: '1.5rem',
          zIndex: 1000,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'flex-end',
          gap: '0.75rem',
        }}
      >
        {/* Panel expandido */}
        {panelVisible && (
          <div
            role="dialog"
            aria-label="Panel de Productos y Ventas API"
            style={{
              width: '440px',
              maxHeight: '82vh',
              overflowY: 'auto',
              backgroundColor: 'var(--pos-bg-secondary)',
              border: '1px solid var(--pos-border)',
              borderRadius: '16px',
              boxShadow: '0 20px 40px -10px rgba(0,0,0,0.15)',
              display: 'flex',
              flexDirection: 'column',
              gap: 0,
            }}
          >
            {/* Encabezado del panel */}
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '1rem 1.25rem',
                borderBottom: '1px solid var(--pos-border)',
                position: 'sticky',
                top: 0,
                backgroundColor: 'var(--pos-bg-secondary)',
                zIndex: 1,
                borderRadius: '16px 16px 0 0',
              }}
            >
              <div>
                <h2 style={{ fontSize: '1rem', fontWeight: 700, color: 'var(--pos-text-primary)', margin: 0 }}>
                  Productos &amp; Ventas
                </h2>
                <p style={{ fontSize: '0.75rem', color: 'var(--pos-text-muted)', margin: '0.125rem 0 0' }}>
                  AWS API Gateway
                </p>
              </div>
              <button
                type="button"
                onClick={() => setPanelVisible(false)}
                aria-label="Cerrar panel"
                style={estilos.botonCerrar}
              >
                ✕
              </button>
            </div>

            {/* ── Sección: Catálogo desde API ── */}
            <section style={{ padding: '1rem 1.25rem', borderBottom: '1px solid var(--pos-border)' }}>
              <h3 style={estilos.seccionTitulo}>Catálogo desde API</h3>

              {loadingProductos && (
                <div style={estilos.estadoFila} aria-live="polite" aria-busy="true">
                  <span style={estilos.spinnerPequeno} role="status" aria-label="Cargando" />
                  <span style={{ color: 'var(--pos-text-secondary)', fontSize: '0.875rem' }}>
                    Cargando productos…
                  </span>
                </div>
              )}

              {!loadingProductos && errorProductos && (
                <div role="alert" style={estilos.errorBanner}>
                  <span aria-hidden="true">⚠️</span>
                  <span style={{ flex: 1 }}>{errorProductos}</span>
                  <button type="button" onClick={cargarProductos} style={estilos.botonReintentar}>
                    Reintentar
                  </button>
                </div>
              )}

              {!loadingProductos && !errorProductos && productos.length === 0 && (
                <p style={{ color: 'var(--pos-text-muted)', fontSize: '0.875rem', textAlign: 'center', padding: '0.75rem 0' }}>
                  No hay productos disponibles.
                </p>
              )}

              {!loadingProductos && !errorProductos && productos.length > 0 && (
                <ul style={estilos.listaProductos} aria-label="Productos disponibles">
                  {productos.map(producto => (
                    <li key={producto.id} style={estilos.itemProducto}>
                      <div>
                        <span style={estilos.productoNombre}>{producto.nombre}</span>
                        <span style={estilos.productoPrecio}>{formatearPrecio(producto.precio)}</span>
                      </div>
                      <button
                        type="button"
                        onClick={() => handleAgregarProducto(producto)}
                        aria-label={`Agregar ${producto.nombre} a la venta`}
                        style={estilos.botonAgregar}
                      >
                        + Agregar
                      </button>
                    </li>
                  ))}
                </ul>
              )}
            </section>

            {/* ── Sección: Venta en Curso ── */}
            <section style={{ padding: '1rem 1.25rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.75rem' }}>
                <h3 style={{ ...estilos.seccionTitulo, margin: 0 }}>Venta en Curso</h3>
                {productosEnVenta.length > 0 && (
                  <span style={estilos.badge}>
                    {productosEnVenta.length} producto{productosEnVenta.length !== 1 ? 's' : ''}
                  </span>
                )}
              </div>

              {/* Mensaje de éxito */}
              {mensajeExito && (
                <div role="status" aria-live="polite" style={estilos.mensajeExito}>
                  <span aria-hidden="true">✅</span>
                  <span>{mensajeExito}</span>
                </div>
              )}

              {/* Mensaje de error */}
              {mensajeError && (
                <div role="alert" style={estilos.mensajeError}>
                  <span aria-hidden="true">❌</span>
                  <span>{mensajeError}</span>
                </div>
              )}

              {/* Lista vacía */}
              {productosEnVenta.length === 0 && !mensajeExito && (
                <p style={{ color: 'var(--pos-text-muted)', fontSize: '0.875rem', textAlign: 'center', padding: '1rem 0' }}>
                  Selecciona productos del catálogo para iniciar una venta.
                </p>
              )}

              {/* Productos seleccionados */}
              {productosEnVenta.length > 0 && (
                <ul style={estilos.listaVenta} aria-label="Productos seleccionados para la venta">
                  {productosEnVenta.map(p => (
                    <li
                      key={p.id}
                      onClick={() => setProductoSeleccionadoId(p.id)}
                      style={{
                        ...estilos.itemVenta,
                        ...(productoSeleccionadoId === p.id ? estilos.itemVentaSeleccionado : {}),
                      }}
                    >
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <span style={estilos.ventaNombre}>{p.nombre}</span>
                        <span style={estilos.ventaPrecioUnit}>{formatearPrecio(p.precio)} c/u</span>
                      </div>
                      <div style={estilos.ventaControles}>
                        <div style={estilos.cantidadGroup}>
                          <button
                            type="button"
                            onClick={() => handleCambiarCantidad(p.id, -1)}
                            aria-label={`Reducir cantidad de ${p.nombre}`}
                            disabled={submitting}
                            style={estilos.botonCantidad}
                          >−</button>
                          <span style={estilos.cantidad}>{p.cantidad}</span>
                          <button
                            type="button"
                            onClick={() => handleCambiarCantidad(p.id, 1)}
                            aria-label={`Aumentar cantidad de ${p.nombre}`}
                            disabled={submitting}
                            style={estilos.botonCantidad}
                          >+</button>
                        </div>
                        <span style={estilos.ventaSubtotal}>{formatearPrecio(p.precio * p.cantidad)}</span>
                        <button
                          type="button"
                          onClick={() => handleQuitarProducto(p.id)}
                          aria-label={`Quitar ${p.nombre}`}
                          disabled={submitting}
                          style={estilos.botonQuitar}
                        >✕</button>
                      </div>
                    </li>
                  ))}
                </ul>
              )}

              {/* Total y botón confirmar */}
              {productosEnVenta.length > 0 && (
                <footer style={{ marginTop: '0.875rem', borderTop: '1px solid var(--pos-border)', paddingTop: '0.875rem' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem' }}>
                    <span style={{ fontWeight: 600, color: 'var(--pos-text-secondary)' }}>Total</span>
                    <span style={{ fontSize: '1.375rem', fontWeight: 800, color: 'var(--pos-text-primary)' }}>
                      {formatearPrecio(total)}
                    </span>
                  </div>
                  <button
                    type="button"
                    onClick={handleConfirmarVenta}
                    disabled={botonVentaDeshabilitado}
                    aria-label="Confirmar y registrar venta"
                    style={{
                      ...estilos.botonConfirmar,
                      ...(botonVentaDeshabilitado ? estilos.botonConfirmarDisabled : {}),
                    }}
                  >
                    {submitting ? (
                      <span style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem' }}>
                        <span style={estilos.spinnerPequeno} aria-hidden="true" />
                        Registrando…
                      </span>
                    ) : (
                      'Confirmar Venta'
                    )}
                  </button>
                </footer>
              )}
            </section>
          </div>
        )}

        {/* Botón flotante */}
        <button
          type="button"
          onClick={() => setPanelVisible(v => !v)}
          aria-label={panelVisible ? 'Cerrar panel de Ventas API' : 'Abrir panel de Ventas API'}
          aria-expanded={panelVisible}
          style={estilos.botonFlotante}
          onMouseEnter={e => {
            e.currentTarget.style.backgroundColor = 'var(--pos-accent-hover)'
            e.currentTarget.style.transform = 'translateY(-2px)'
          }}
          onMouseLeave={e => {
            e.currentTarget.style.backgroundColor = 'var(--pos-accent)'
            e.currentTarget.style.transform = 'translateY(0)'
          }}
        >
          <span aria-hidden="true">{panelVisible ? '✕' : '🛒'}</span>
          {panelVisible ? 'Cerrar' : 'Ventas API'}
        </button>
      </div>

      {/* Animación del spinner */}
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>

      <CheckoutDialog />

      <ReceiptDialog
        visible={currentReceipt !== null}
        transaction={currentReceipt}
        onClose={() => setCurrentReceipt(null)}
      />
    </div>
  )
}

// ── Helper ────────────────────────────────────────────────────────────────────

function formatearPrecio(precio: number): string {
  return new Intl.NumberFormat('es-MX', {
    style: 'currency',
    currency: 'MXN',
    minimumFractionDigits: 2,
  }).format(precio)
}

// ── Estilos ───────────────────────────────────────────────────────────────────

const estilos: Record<string, React.CSSProperties> = {
  botonCerrar: {
    width: '2rem',
    height: '2rem',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'var(--pos-bg-tertiary)',
    border: '1px solid var(--pos-border)',
    borderRadius: '8px',
    cursor: 'pointer',
    fontSize: '0.875rem',
    color: 'var(--pos-text-secondary)',
  },
  seccionTitulo: {
    fontSize: '0.75rem',
    fontWeight: 700,
    color: 'var(--pos-text-secondary)',
    textTransform: 'uppercase',
    letterSpacing: '0.06em',
    margin: '0 0 0.75rem',
  },
  estadoFila: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.5rem',
    padding: '0.5rem 0',
  },
  spinnerPequeno: {
    width: '1rem',
    height: '1rem',
    border: '2px solid var(--pos-border)',
    borderTopColor: 'var(--pos-accent)',
    borderRadius: '50%',
    animation: 'spin 0.8s linear infinite',
    display: 'inline-block',
    flexShrink: 0,
  },
  errorBanner: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.5rem',
    padding: '0.625rem 0.875rem',
    backgroundColor: 'rgba(155,34,38,0.07)',
    border: '1px solid rgba(155,34,38,0.2)',
    borderRadius: '8px',
    fontSize: '0.8125rem',
    color: 'var(--pos-danger)',
  },
  botonReintentar: {
    padding: '0.25rem 0.625rem',
    backgroundColor: 'var(--pos-danger)',
    color: '#fff',
    border: 'none',
    borderRadius: '6px',
    cursor: 'pointer',
    fontSize: '0.75rem',
    fontWeight: 600,
    flexShrink: 0,
  },
  listaProductos: {
    listStyle: 'none',
    padding: 0,
    margin: 0,
    display: 'flex',
    flexDirection: 'column',
    gap: '0.375rem',
  },
  itemProducto: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: '0.625rem 0.875rem',
    backgroundColor: 'var(--pos-bg-primary)',
    border: '1px solid var(--pos-border)',
    borderRadius: '8px',
  },
  productoNombre: {
    fontWeight: 600,
    fontSize: '0.875rem',
    color: 'var(--pos-text-primary)',
    display: 'block',
  },
  productoPrecio: {
    fontSize: '0.8125rem',
    color: 'var(--pos-accent)',
    fontWeight: 600,
    display: 'block',
  },
  botonAgregar: {
    padding: '0.35rem 0.75rem',
    backgroundColor: 'var(--pos-accent)',
    color: '#fff',
    border: 'none',
    borderRadius: '6px',
    fontSize: '0.8125rem',
    fontWeight: 600,
    cursor: 'pointer',
    flexShrink: 0,
  },
  badge: {
    backgroundColor: 'var(--pos-accent)',
    color: '#fff',
    borderRadius: '100px',
    padding: '0.15rem 0.625rem',
    fontSize: '0.75rem',
    fontWeight: 600,
  },
  mensajeExito: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.5rem',
    padding: '0.75rem 1rem',
    backgroundColor: 'rgba(45,106,79,0.08)',
    border: '1px solid rgba(45,106,79,0.25)',
    borderRadius: '8px',
    fontSize: '0.875rem',
    fontWeight: 500,
    color: 'var(--pos-success)',
    marginBottom: '0.75rem',
  },
  mensajeError: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.5rem',
    padding: '0.75rem 1rem',
    backgroundColor: 'rgba(155,34,38,0.07)',
    border: '1px solid rgba(155,34,38,0.2)',
    borderRadius: '8px',
    fontSize: '0.875rem',
    fontWeight: 500,
    color: 'var(--pos-danger)',
    marginBottom: '0.75rem',
  },
  listaVenta: {
    listStyle: 'none',
    padding: 0,
    margin: 0,
    display: 'flex',
    flexDirection: 'column',
    gap: '0.375rem',
  },
  itemVenta: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: '0.625rem 0.875rem',
    backgroundColor: 'var(--pos-bg-primary)',
    border: '1px solid var(--pos-border)',
    borderRadius: '8px',
    gap: '0.5rem',
  },
  itemVentaSeleccionado: {
    border: '1px solid var(--pos-accent)',
    boxShadow: '0 0 0 1px color-mix(in srgb, var(--pos-accent) 40%, transparent)',
  },
  ventaNombre: {
    fontWeight: 600,
    fontSize: '0.875rem',
    color: 'var(--pos-text-primary)',
    display: 'block',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    whiteSpace: 'nowrap',
  },
  ventaPrecioUnit: {
    fontSize: '0.75rem',
    color: 'var(--pos-text-secondary)',
    display: 'block',
  },
  ventaControles: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.5rem',
    flexShrink: 0,
  },
  cantidadGroup: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.25rem',
    backgroundColor: 'var(--pos-bg-secondary)',
    border: '1px solid var(--pos-border)',
    borderRadius: '6px',
    padding: '0.15rem 0.375rem',
  },
  botonCantidad: {
    width: '20px',
    height: '20px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'transparent',
    border: 'none',
    cursor: 'pointer',
    fontWeight: 700,
    fontSize: '0.875rem',
    color: 'var(--pos-text-primary)',
    borderRadius: '4px',
  },
  cantidad: {
    fontWeight: 700,
    fontSize: '0.875rem',
    minWidth: '18px',
    textAlign: 'center',
    color: 'var(--pos-text-primary)',
  },
  ventaSubtotal: {
    fontWeight: 700,
    color: 'var(--pos-accent)',
    fontSize: '0.875rem',
    minWidth: '60px',
    textAlign: 'right',
  },
  botonQuitar: {
    width: '24px',
    height: '24px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'transparent',
    border: '1px solid var(--pos-border)',
    borderRadius: '5px',
    cursor: 'pointer',
    color: 'var(--pos-text-secondary)',
    fontSize: '0.6875rem',
  },
  botonConfirmar: {
    width: '100%',
    padding: '0.75rem',
    backgroundColor: 'var(--pos-accent)',
    color: '#fff',
    border: 'none',
    borderRadius: '10px',
    cursor: 'pointer',
    fontWeight: 700,
    fontSize: '0.9375rem',
    transition: 'background-color 0.2s ease',
    letterSpacing: '0.02em',
  },
  botonConfirmarDisabled: {
    backgroundColor: 'var(--pos-border-dark)',
    cursor: 'not-allowed',
    opacity: 0.65,
  },
  botonFlotante: {
    padding: '0.75rem 1.25rem',
    backgroundColor: 'var(--pos-accent)',
    color: '#fff',
    border: 'none',
    borderRadius: '12px',
    fontSize: '0.875rem',
    fontWeight: 700,
    cursor: 'pointer',
    boxShadow: '0 8px 20px rgba(199,93,66,0.35)',
    display: 'flex',
    alignItems: 'center',
    gap: '0.5rem',
    transition: 'background-color 0.2s ease, transform 0.15s ease',
  },
}

export default App
