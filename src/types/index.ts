export interface Product {
  id: string
  name: string
  barcode: string
  price: number
  category: ProductCategory
  image: string
  stock: number
  unit: 'unidad' | 'kg' | 'litro'
  taxRate: number
}

export type ProductCategory = 
  | 'frutas-verduras'
  | 'lacteos'
  | 'carnes'
  | 'panaderia'
  | 'bebidas'
  | 'limpieza'
  | 'snacks'
  | 'congelados'

export interface CartItem {
  product: Product
  quantity: number
  subtotal: number
  discount: number
}

export interface Discount {
  id: string
  name: string
  type: 'percentage' | 'fixed'
  value: number
  code?: string
}

export interface Transaction {
  id: string
  items: CartItem[]
  subtotal: number
  taxTotal: number
  discountTotal: number
  total: number
  paymentMethod: PaymentMethod
  paymentDetails: PaymentDetails
  cashier: string
  timestamp: Date
  receiptNumber: string
}

export type PaymentMethod = 'efectivo' | 'tarjeta' | 'mixto'

export interface PaymentDetails {
  method: PaymentMethod
  amountPaid: number
  change?: number
  cardLastFour?: string
  cashAmount?: number
  cardAmount?: number
}

export interface CategoryInfo {
  id: ProductCategory
  name: string
  icon: string
  color: string
}
