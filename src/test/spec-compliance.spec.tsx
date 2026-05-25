import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest'
import { fireEvent, render, screen, cleanup } from '@testing-library/react'
import ProductCatalog from '../components/products/ProductCatalog'
import { usePOSStore } from '../store/posStore'
import { Product, Transaction } from '../types'
import { RefObject } from 'react'
import { Toast } from 'primereact/toast'
import DiscountInput from '../components/cart/DiscountInput'
import ReceiptDialog from '../components/receipt/ReceiptDialog'
import { COLOMBIA_GENERAL_VAT_RATE } from '../lib/money'

const createProduct = (overrides: Partial<Product>): Product => ({
  id: 'p-1',
  name: 'Producto Test',
  barcode: '999',
  price: 10,
  category: 'bebidas',
  image: 'https://example.com/product.jpg',
  stock: 20,
  unit: 'unidad',
  taxRate: COLOMBIA_GENERAL_VAT_RATE,
  ...overrides,
})

describe('Spec compliance checks', () => {
  afterEach(() => {
    cleanup()
  })

  beforeEach(() => {
    localStorage.clear()
    usePOSStore.setState({
      cart: [],
      appliedDiscount: null,
      isCheckoutOpen: false,
      transactions: [],
      currentReceipt: null,
    })
  })

  it('FR-01: filtra catalogo por busqueda y categoria', () => {
    const toast = { current: { show: vi.fn() } } as unknown as RefObject<Toast | null>
    render(<ProductCatalog toast={toast} />)

    expect(screen.getByText('31 productos')).toBeInTheDocument()

    const searchInput = screen.getByPlaceholderText('Buscar productos...')
    fireEvent.change(searchInput, { target: { value: 'Leche' } })
    expect(screen.getByText('1 productos')).toBeInTheDocument()

    fireEvent.change(searchInput, { target: { value: '' } })
    fireEvent.click(screen.getByRole('button', { name: 'Bebidas' }))
    expect(screen.getByText('4 productos')).toBeInTheDocument()
  })

  it('FR-02: captura manual por codigo agrega al carrito', () => {
    const toast = { current: { show: vi.fn() } } as unknown as RefObject<Toast | null>
    render(<ProductCatalog toast={toast} />)

    const barcodeInput = screen.getAllByPlaceholderText('Codigo de barras')[0]
    fireEvent.change(barcodeInput, { target: { value: '7501234567895' } })
    fireEvent.keyDown(barcodeInput, { key: 'Enter', code: 'Enter' })

    const { cart } = usePOSStore.getState()
    expect(cart).toHaveLength(1)
    expect(cart[0].product.name).toBe('Leche Entera 1L')
  })

  it('FR-05 + FR-06: calcula totales y procesa pago mixto', () => {
    const taxable = createProduct({ id: 'a', price: 10, taxRate: COLOMBIA_GENERAL_VAT_RATE, barcode: '111' })
    const nonTaxable = createProduct({
      id: 'b',
      name: 'Sin IVA',
      price: 20,
      taxRate: 0,
      category: 'frutas-verduras',
      barcode: '222',
    })

    const store = usePOSStore.getState()
    store.addToCart(taxable, 2)
    store.addToCart(nonTaxable, 1)

    const subtotal = usePOSStore.getState().getSubtotal()
    const taxTotal = usePOSStore.getState().getTaxTotal()
    const total = usePOSStore.getState().getTotal()
    expect(subtotal).toBe(40)
    expect(taxTotal).toBeCloseTo(3.8, 6)
    expect(total).toBeCloseTo(43.8, 6)

    const transaction = usePOSStore.getState().processPayment('mixto', {
      method: 'mixto',
      amountPaid: total,
      cashAmount: 10,
      cardAmount: 33.8,
      cardLastFour: '1234',
    })

    expect(transaction.paymentMethod).toBe('mixto')
    expect(transaction.paymentDetails.cashAmount).toBe(10)
    expect(transaction.paymentDetails.cardAmount).toBeCloseTo(33.8, 6)
    expect(transaction.paymentDetails.cardLastFour).toBe('1234')
    expect(usePOSStore.getState().cart).toHaveLength(0)
  })

  it('FR-04: valida codigo de descuento invalido y aplica uno valido', () => {
    render(<DiscountInput />)

    const input = screen.getByPlaceholderText('Codigo de descuento')
    fireEvent.change(input, { target: { value: 'NOEXISTE' } })
    fireEvent.click(screen.getByRole('button', { name: 'Aplicar' }))
    expect(screen.getByText('Codigo de descuento invalido')).toBeInTheDocument()

    fireEvent.change(input, { target: { value: 'DESCUENTO10' } })
    fireEvent.click(screen.getByRole('button', { name: 'Aplicar' }))
    expect(screen.getByText('10% Descuento')).toBeInTheDocument()
  })

  it('FR-07: muestra recibo con datos clave y permite imprimir', () => {
    const printSpy = vi.spyOn(window, 'print').mockImplementation(() => undefined)
    const transaction: Transaction = {
      id: 'tx-1',
      items: [
        {
          product: createProduct({ name: 'Leche Entera 1L', price: 2, barcode: '1' }),
          quantity: 2,
          subtotal: 4,
          discount: 0,
        },
      ],
      subtotal: 4,
      taxTotal: 0.76,
      discountTotal: 0,
      total: 4.76,
      paymentMethod: 'tarjeta',
      paymentDetails: {
        method: 'tarjeta',
        amountPaid: 4.76,
        cardLastFour: '4242',
      },
      cashier: 'Cajero 1',
      timestamp: new Date('2026-05-18T10:00:00.000Z'),
      receiptNumber: 'REC-00000001',
    }

    render(<ReceiptDialog visible transaction={transaction} onClose={() => {}} />)
    expect(screen.getByText('Venta Completada')).toBeInTheDocument()
    expect(screen.getByText('REC-00000001')).toBeInTheDocument()
    expect(screen.getByText('Leche Entera 1L')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Imprimir' })).toBeInTheDocument()

    fireEvent.click(screen.getByRole('button', { name: 'Imprimir' }))
    expect(printSpy).toHaveBeenCalledTimes(1)
    printSpy.mockRestore()
  })

  it('FR-08: persiste estado core offline en localStorage', () => {
    const product = createProduct({ id: 'offline-1', barcode: 'offline-1' })
    usePOSStore.getState().addToCart(product)

    const raw = localStorage.getItem('mercato-pos-store')
    expect(raw).not.toBeNull()

    const persisted = JSON.parse(raw || '{}')
    expect(persisted.state.cart).toHaveLength(1)
    expect(persisted.state.transactions).toHaveLength(0)
  })
})
