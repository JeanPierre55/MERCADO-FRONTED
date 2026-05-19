import { create } from 'zustand'
import { CartItem, Product, PaymentMethod, PaymentDetails, Transaction, Discount } from '../types'
import { v4 as uuidv4 } from 'uuid'
import { createJSONStorage, persist } from 'zustand/middleware'

interface POSState {
  // Cart
  cart: CartItem[]
  addToCart: (product: Product, quantity?: number) => void
  removeFromCart: (productId: string) => void
  updateQuantity: (productId: string, quantity: number) => void
  clearCart: () => void
  
  // Discount
  appliedDiscount: Discount | null
  applyDiscount: (discount: Discount) => void
  removeDiscount: () => void
  
  // Checkout
  isCheckoutOpen: boolean
  openCheckout: () => void
  closeCheckout: () => void
  processPayment: (method: PaymentMethod, details: PaymentDetails) => Transaction
  
  // Transaction history
  transactions: Transaction[]
  currentReceipt: Transaction | null
  setCurrentReceipt: (transaction: Transaction | null) => void
  
  // Computed
  getSubtotal: () => number
  getTaxTotal: () => number
  getDiscountTotal: () => number
  getTotal: () => number
  getCartCount: () => number
}

const rehydrateTransactions = (transactions: Transaction[] = []): Transaction[] => {
  return transactions.map((transaction) => ({
    ...transaction,
    timestamp: new Date(transaction.timestamp),
  }))
}

export const usePOSStore = create<POSState>()(
  persist(
    (set, get) => ({
      // Cart State
      cart: [],

      addToCart: (product: Product, quantity: number = 1) => {
        set((state) => {
          const existingItem = state.cart.find(item => item.product.id === product.id)

          if (existingItem) {
            return {
              cart: state.cart.map(item =>
                item.product.id === product.id
                  ? {
                      ...item,
                      quantity: item.quantity + quantity,
                      subtotal: (item.quantity + quantity) * item.product.price,
                    }
                  : item
              ),
            }
          }

          return {
            cart: [
              ...state.cart,
              {
                product,
                quantity,
                subtotal: quantity * product.price,
                discount: 0,
              },
            ],
          }
        })
      },

      removeFromCart: (productId: string) => {
        set((state) => ({
          cart: state.cart.filter(item => item.product.id !== productId),
        }))
      },

      updateQuantity: (productId: string, quantity: number) => {
        if (quantity <= 0) {
          get().removeFromCart(productId)
          return
        }

        set((state) => ({
          cart: state.cart.map(item =>
            item.product.id === productId
              ? {
                  ...item,
                  quantity,
                  subtotal: quantity * item.product.price,
                }
              : item
          ),
        }))
      },

      clearCart: () => set({ cart: [], appliedDiscount: null }),

      // Discount State
      appliedDiscount: null,

      applyDiscount: (discount: Discount) => set({ appliedDiscount: discount }),

      removeDiscount: () => set({ appliedDiscount: null }),

      // Checkout State
      isCheckoutOpen: false,

      openCheckout: () => set({ isCheckoutOpen: true }),

      closeCheckout: () => set({ isCheckoutOpen: false }),

      processPayment: (method: PaymentMethod, details: PaymentDetails): Transaction => {
        const state = get()
        const transaction: Transaction = {
          id: uuidv4(),
          items: [...state.cart],
          subtotal: state.getSubtotal(),
          taxTotal: state.getTaxTotal(),
          discountTotal: state.getDiscountTotal(),
          total: state.getTotal(),
          paymentMethod: method,
          paymentDetails: details,
          cashier: 'Cajero 1',
          timestamp: new Date(),
          receiptNumber: `REC-${Date.now().toString().slice(-8)}`,
        }

        set((store) => ({
          transactions: [...store.transactions, transaction],
          currentReceipt: transaction,
          cart: [],
          appliedDiscount: null,
          isCheckoutOpen: false,
        }))

        return transaction
      },

      // Transaction History
      transactions: [],
      currentReceipt: null,
      setCurrentReceipt: (transaction) => set({ currentReceipt: transaction }),

      // Computed Values
      getSubtotal: () => {
        return get().cart.reduce((sum, item) => sum + item.subtotal, 0)
      },

      getTaxTotal: () => {
        return get().cart.reduce((sum, item) => {
          return sum + (item.subtotal * item.product.taxRate)
        }, 0)
      },

      getDiscountTotal: () => {
        const { appliedDiscount, getSubtotal } = get()
        if (!appliedDiscount) return 0

        if (appliedDiscount.type === 'percentage') {
          return getSubtotal() * (appliedDiscount.value / 100)
        }
        return appliedDiscount.value
      },

      getTotal: () => {
        const { getSubtotal, getTaxTotal, getDiscountTotal } = get()
        return getSubtotal() + getTaxTotal() - getDiscountTotal()
      },

      getCartCount: () => {
        return get().cart.reduce((sum, item) => sum + item.quantity, 0)
      },
    }),
    {
      name: 'mercato-pos-store',
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({
        cart: state.cart,
        appliedDiscount: state.appliedDiscount,
        transactions: state.transactions,
      }),
      merge: (persistedState, currentState) => {
        const persisted = persistedState as Partial<POSState>
        return {
          ...currentState,
          ...persisted,
          transactions: rehydrateTransactions(persisted.transactions || []),
        }
      },
    }
  )
)
