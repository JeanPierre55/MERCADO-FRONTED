/**
 * Componente que muestra el catálogo de productos obtenidos desde la API Gateway.
 * Usa useState para gestionar productos, loading y error.
 * Usa useEffect para disparar la consulta al montar el componente.
 * Usa HTML5 semántico y CSS con Flexbox.
 *
 * Requirements: 1.5, 1.6, 1.7, 2.1, 2.2, 2.3, 2.4, 2.5, 2.6, 2.7, 8.1, 8.2
 */

import { useState, useEffect } from 'react'
import { getProductos, Producto } from '../services/productosService'

interface ProductosListProps {
  onProductoSeleccionado: (producto: Producto) => void
}

export default function ProductosList({ onProductoSeleccionado }: ProductosListProps) {
  const [productos, setProductos] = useState<Producto[]>([])
  const [loading, setLoading] = useState<boolean>(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    let cancelled = false

    async function cargarProductos() {
      setLoading(true)
      setError(null)

      try {
        const data = await getProductos()
        if (!cancelled) {
          setProductos(data)
        }
      } catch (err) {
        if (!cancelled) {
          setError(err instanceof Error ? err.message : 'Error al cargar productos.')
        }
      } finally {
        if (!cancelled) {
          setLoading(false)
        }
      }
    }

    cargarProductos()

    return () => {
      cancelled = true
    }
  }, [])

  const formatearPrecio = (precio: number): string => {
    return new Intl.NumberFormat('es-MX', {
      style: 'currency',
      currency: 'MXN',
    }).format(precio)
  }

  return (
    <section style={styles.container}>
      <header style={styles.header}>
        <h2 style={styles.titulo}>Catálogo de Productos</h2>
        <p style={styles.subtitulo}>Selecciona los productos para agregar a la venta</p>
      </header>

      {/* Estado de carga */}
      {loading && (
        <div style={styles.estadoContainer} role="status" aria-live="polite">
          <div style={styles.spinner} aria-hidden="true" />
          <p style={styles.estadoTexto}>Cargando productos...</p>
        </div>
      )}

      {/* Estado de error */}
      {!loading && error && (
        <div style={styles.errorContainer} role="alert">
          <span style={styles.errorIcono}>⚠️</span>
          <p style={styles.errorTexto}>{error}</p>
          <button
            style={styles.botonReintentar}
            onClick={() => {
              setError(null)
              setLoading(true)
              getProductos()
                .then(setProductos)
                .catch(err => setError(err instanceof Error ? err.message : 'Error al cargar productos.'))
                .finally(() => setLoading(false))
            }}
          >
            Reintentar
          </button>
        </div>
      )}

      {/* Lista vacía */}
      {!loading && !error && productos.length === 0 && (
        <div style={styles.estadoContainer} role="status">
          <p style={styles.estadoTexto}>No hay productos disponibles.</p>
        </div>
      )}

      {/* Lista de productos */}
      {!loading && !error && productos.length > 0 && (
        <ul style={styles.lista} aria-label="Lista de productos disponibles">
          {productos.map((producto) => (
            <li key={producto.id} style={styles.tarjeta}>
              <div style={styles.tarjetaInfo}>
                <span style={styles.productoNombre}>{producto.nombre}</span>
                <span style={styles.productoPrecio}>{formatearPrecio(producto.precio)}</span>
              </div>
              <button
                style={styles.botonSeleccionar}
                onClick={() => onProductoSeleccionado(producto)}
                aria-label={`Agregar ${producto.nombre} a la venta`}
                onMouseEnter={e => {
                  const btn = e.currentTarget
                  btn.style.backgroundColor = 'var(--pos-accent-hover)'
                  btn.style.transform = 'scale(1.02)'
                }}
                onMouseLeave={e => {
                  const btn = e.currentTarget
                  btn.style.backgroundColor = 'var(--pos-accent)'
                  btn.style.transform = 'scale(1)'
                }}
              >
                + Agregar
              </button>
            </li>
          ))}
        </ul>
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
    backgroundColor: 'var(--pos-bg-primary)',
    height: '100%',
    overflowY: 'auto',
  },
  header: {
    borderBottom: '1px solid var(--pos-border)',
    paddingBottom: '1rem',
  },
  titulo: {
    fontSize: '1.25rem',
    fontWeight: '700',
    color: 'var(--pos-text-primary)',
    margin: 0,
  },
  subtitulo: {
    fontSize: '0.875rem',
    color: 'var(--pos-text-secondary)',
    marginTop: '0.25rem',
  },
  estadoContainer: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '3rem 1rem',
    gap: '1rem',
  },
  spinner: {
    width: '40px',
    height: '40px',
    border: '3px solid var(--pos-border)',
    borderTop: '3px solid var(--pos-accent)',
    borderRadius: '50%',
    animation: 'spin 0.8s linear infinite',
  },
  estadoTexto: {
    color: 'var(--pos-text-secondary)',
    fontSize: '0.9375rem',
  },
  errorContainer: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: '0.75rem',
    padding: '2rem',
    backgroundColor: 'rgba(155, 34, 38, 0.06)',
    borderRadius: '12px',
    border: '1px solid rgba(155, 34, 38, 0.2)',
  },
  errorIcono: {
    fontSize: '2rem',
  },
  errorTexto: {
    color: 'var(--pos-danger)',
    fontWeight: '500',
    textAlign: 'center',
  },
  botonReintentar: {
    padding: '0.5rem 1.25rem',
    backgroundColor: 'var(--pos-danger)',
    color: '#fff',
    border: 'none',
    borderRadius: '8px',
    cursor: 'pointer',
    fontWeight: '500',
    fontSize: '0.875rem',
  },
  lista: {
    listStyle: 'none',
    padding: 0,
    margin: 0,
    display: 'flex',
    flexDirection: 'column',
    gap: '0.75rem',
  },
  tarjeta: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: '1rem 1.25rem',
    backgroundColor: 'var(--pos-bg-secondary)',
    border: '1px solid var(--pos-border)',
    borderRadius: '12px',
    transition: 'box-shadow 0.2s ease',
  },
  tarjetaInfo: {
    display: 'flex',
    flexDirection: 'column',
    gap: '0.25rem',
  },
  productoNombre: {
    fontWeight: '600',
    color: 'var(--pos-text-primary)',
    fontSize: '0.9375rem',
  },
  productoPrecio: {
    color: 'var(--pos-accent)',
    fontWeight: '700',
    fontSize: '1rem',
  },
  botonSeleccionar: {
    padding: '0.5rem 1.25rem',
    backgroundColor: 'var(--pos-accent)',
    color: '#fff',
    border: 'none',
    borderRadius: '8px',
    cursor: 'pointer',
    fontWeight: '600',
    fontSize: '0.875rem',
    transition: 'background-color 0.2s ease, transform 0.15s ease',
    whiteSpace: 'nowrap',
  },
}
