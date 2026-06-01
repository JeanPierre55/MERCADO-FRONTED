/**
 * Componente para gestionar la selección de productos y el registro de ventas.
 * Usa useState para selectedProducts, submitting, successMessage, errorMessage.
 * Llama a registrarVenta() con async/await y try/catch.
 * Muestra mensajes de éxito (verde) y error (rojo).
 *
 * Requirements: 3.1, 3.5, 3.6, 4.1, 4.2, 4.3, 4.4, 5.1, 5.2, 5.3, 5.4, 5.5, 8.3, 8.4
 */

import { useState } from 'react'
import { registrarVenta, ProductoSeleccionado } from '../services/ventasService'

export default function VentaForm() {
  const [selectedProducts, setSelectedProducts] = useState<(ProductoSeleccionado & { nombre: string; precio: number })[]>([])
  const [submitting, setSubmitting] = useState<boolean>(false)
  const [successMessage, setSuccessMessage] = useState<string | null>(null)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)

  const quitarProducto = (id: string) => {
    setSelectedProducts(prev => prev.filter(p => p.id !== id))
  }

  const cambiarCantidad = (id: string, delta: number) => {
    setSelectedProducts(prev => {
      return prev
        .map(p => p.id === id ? { ...p, cantidad: p.cantidad + delta } : p)
        .filter(p => p.cantidad > 0)
    })
  }

  const calcularTotal = (): number => {
    return selectedProducts.reduce((sum, p) => sum + p.precio * p.cantidad, 0)
  }

  const formatearPrecio = (precio: number): string => {
    return new Intl.NumberFormat('es-MX', {
      style: 'currency',
      currency: 'MXN',
    }).format(precio)
  }

  const handleConfirmarVenta = async () => {
    if (selectedProducts.length === 0 || submitting) return

    setSubmitting(true)
    setSuccessMessage(null)
    setErrorMessage(null)

    try {
      const ventaRequest = {
        productos: selectedProducts.map(p => ({ id: p.id, cantidad: p.cantidad })),
      }

      const respuesta = await registrarVenta(ventaRequest)
      setSuccessMessage(respuesta.message)
      setSelectedProducts([]) // Limpiar selección tras éxito
    } catch (err) {
      setErrorMessage(err instanceof Error ? err.message : 'Error al registrar la venta. Intente nuevamente.')
      // Mantener selectedProducts intactos para que el cajero pueda reintentar
    } finally {
      setSubmitting(false)
    }
  }

  const botonDeshabilitado = selectedProducts.length === 0 || submitting

  return (
    <section style={styles.container}>
      <header style={styles.header}>
        <h2 style={styles.titulo}>Venta en Curso</h2>
        {selectedProducts.length > 0 && (
          <span style={styles.badge}>{selectedProducts.length} producto{selectedProducts.length !== 1 ? 's' : ''}</span>
        )}
      </header>

      {/* Mensaje de éxito */}
      {successMessage && (
        <div style={styles.mensajeExito} role="status" aria-live="polite">
          <span style={styles.mensajeIcono}>✅</span>
          <p style={styles.mensajeTexto}>{successMessage}</p>
        </div>
      )}

      {/* Mensaje de error */}
      {errorMessage && (
        <div style={styles.mensajeError} role="alert">
          <span style={styles.mensajeIcono}>❌</span>
          <p style={styles.mensajeTexto}>{errorMessage}</p>
        </div>
      )}

      {/* Lista vacía */}
      {selectedProducts.length === 0 && !successMessage && (
        <div style={styles.listaVacia}>
          <p style={styles.listaVaciaTexto}>Selecciona productos del catálogo para iniciar una venta.</p>
        </div>
      )}

      {/* Productos seleccionados */}
      {selectedProducts.length > 0 && (
        <ul style={styles.lista} aria-label="Productos seleccionados para la venta">
          {selectedProducts.map(producto => (
            <li key={producto.id} style={styles.item}>
              <div style={styles.itemInfo}>
                <span style={styles.itemNombre}>{producto.nombre}</span>
                <span style={styles.itemPrecioUnit}>{formatearPrecio(producto.precio)} c/u</span>
              </div>

              <div style={styles.itemControles}>
                <div style={styles.cantidadControles}>
                  <button
                    style={styles.botonCantidad}
                    onClick={() => cambiarCantidad(producto.id, -1)}
                    aria-label={`Reducir cantidad de ${producto.nombre}`}
                    disabled={submitting}
                  >
                    −
                  </button>
                  <span style={styles.cantidad}>{producto.cantidad}</span>
                  <button
                    style={styles.botonCantidad}
                    onClick={() => cambiarCantidad(producto.id, 1)}
                    aria-label={`Aumentar cantidad de ${producto.nombre}`}
                    disabled={submitting}
                  >
                    +
                  </button>
                </div>

                <span style={styles.itemSubtotal}>
                  {formatearPrecio(producto.precio * producto.cantidad)}
                </span>

                <button
                  style={styles.botonQuitar}
                  onClick={() => quitarProducto(producto.id)}
                  aria-label={`Quitar ${producto.nombre} de la venta`}
                  disabled={submitting}
                >
                  ✕
                </button>
              </div>
            </li>
          ))}
        </ul>
      )}

      {/* Total y botón de confirmar */}
      {selectedProducts.length > 0 && (
        <footer style={styles.footer}>
          <div style={styles.totalRow}>
            <span style={styles.totalLabel}>Total</span>
            <span style={styles.totalValor}>{formatearPrecio(calcularTotal())}</span>
          </div>

          <button
            style={{
              ...styles.botonConfirmar,
              ...(botonDeshabilitado ? styles.botonDeshabilitado : {}),
            }}
            onClick={handleConfirmarVenta}
            disabled={botonDeshabilitado}
            aria-label="Confirmar y registrar venta"
          >
            {submitting ? (
              <span style={styles.botonContenido}>
                <span style={styles.spinnerPequeno} aria-hidden="true" />
                Registrando...
              </span>
            ) : (
              'Confirmar Venta'
            )}
          </button>
        </footer>
      )}
    </section>
  )
}

const styles: Record<string, React.CSSProperties> = {
  container: {
    display: 'flex',
    flexDirection: 'column',
    gap: '1rem',
    padding: '1.5rem',
    backgroundColor: 'var(--pos-bg-secondary)',
    height: '100%',
    overflowY: 'auto',
  },
  header: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderBottom: '1px solid var(--pos-border)',
    paddingBottom: '1rem',
  },
  titulo: {
    fontSize: '1.25rem',
    fontWeight: '700',
    color: 'var(--pos-text-primary)',
    margin: 0,
  },
  badge: {
    backgroundColor: 'var(--pos-accent)',
    color: '#fff',
    borderRadius: '100px',
    padding: '0.2rem 0.75rem',
    fontSize: '0.8125rem',
    fontWeight: '600',
  },
  mensajeExito: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.75rem',
    padding: '1rem 1.25rem',
    backgroundColor: 'rgba(45, 106, 79, 0.08)',
    border: '1px solid rgba(45, 106, 79, 0.25)',
    borderRadius: '10px',
  },
  mensajeError: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.75rem',
    padding: '1rem 1.25rem',
    backgroundColor: 'rgba(155, 34, 38, 0.06)',
    border: '1px solid rgba(155, 34, 38, 0.2)',
    borderRadius: '10px',
  },
  mensajeIcono: {
    fontSize: '1.25rem',
    flexShrink: 0,
  },
  mensajeTexto: {
    margin: 0,
    fontWeight: '500',
    fontSize: '0.9375rem',
    color: 'var(--pos-text-primary)',
  },
  listaVacia: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '3rem 1rem',
    flex: 1,
  },
  listaVaciaTexto: {
    color: 'var(--pos-text-muted)',
    textAlign: 'center',
    fontSize: '0.9375rem',
    lineHeight: '1.5',
  },
  lista: {
    listStyle: 'none',
    padding: 0,
    margin: 0,
    display: 'flex',
    flexDirection: 'column',
    gap: '0.625rem',
    flex: 1,
  },
  item: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: '0.875rem 1rem',
    backgroundColor: 'var(--pos-bg-primary)',
    border: '1px solid var(--pos-border)',
    borderRadius: '10px',
    gap: '0.75rem',
  },
  itemInfo: {
    display: 'flex',
    flexDirection: 'column',
    gap: '0.2rem',
    flex: 1,
    minWidth: 0,
  },
  itemNombre: {
    fontWeight: '600',
    color: 'var(--pos-text-primary)',
    fontSize: '0.9rem',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    whiteSpace: 'nowrap',
  },
  itemPrecioUnit: {
    fontSize: '0.8rem',
    color: 'var(--pos-text-secondary)',
  },
  itemControles: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.75rem',
    flexShrink: 0,
  },
  cantidadControles: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.5rem',
    backgroundColor: 'var(--pos-bg-secondary)',
    border: '1px solid var(--pos-border)',
    borderRadius: '8px',
    padding: '0.2rem 0.5rem',
  },
  botonCantidad: {
    width: '24px',
    height: '24px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'transparent',
    border: 'none',
    cursor: 'pointer',
    color: 'var(--pos-text-primary)',
    fontWeight: '700',
    fontSize: '1rem',
    borderRadius: '4px',
  },
  cantidad: {
    fontWeight: '700',
    fontSize: '0.9375rem',
    minWidth: '20px',
    textAlign: 'center',
    color: 'var(--pos-text-primary)',
  },
  itemSubtotal: {
    fontWeight: '700',
    color: 'var(--pos-accent)',
    fontSize: '0.9375rem',
    minWidth: '70px',
    textAlign: 'right',
  },
  botonQuitar: {
    width: '28px',
    height: '28px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'transparent',
    border: '1px solid var(--pos-border)',
    borderRadius: '6px',
    cursor: 'pointer',
    color: 'var(--pos-text-secondary)',
    fontSize: '0.75rem',
    transition: 'all 0.15s ease',
  },
  footer: {
    borderTop: '1px solid var(--pos-border)',
    paddingTop: '1rem',
    display: 'flex',
    flexDirection: 'column',
    gap: '0.875rem',
  },
  totalRow: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  totalLabel: {
    fontSize: '1rem',
    fontWeight: '600',
    color: 'var(--pos-text-secondary)',
  },
  totalValor: {
    fontSize: '1.5rem',
    fontWeight: '800',
    color: 'var(--pos-text-primary)',
  },
  botonConfirmar: {
    width: '100%',
    padding: '0.875rem',
    backgroundColor: 'var(--pos-accent)',
    color: '#fff',
    border: 'none',
    borderRadius: '10px',
    cursor: 'pointer',
    fontWeight: '700',
    fontSize: '1rem',
    transition: 'background-color 0.2s ease',
    letterSpacing: '0.025em',
  },
  botonDeshabilitado: {
    backgroundColor: 'var(--pos-border-dark)',
    cursor: 'not-allowed',
    opacity: 0.7,
  },
  botonContenido: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '0.5rem',
  },
  spinnerPequeno: {
    width: '16px',
    height: '16px',
    border: '2px solid rgba(255,255,255,0.3)',
    borderTop: '2px solid #fff',
    borderRadius: '50%',
    animation: 'spin 0.8s linear infinite',
    display: 'inline-block',
  },
}
