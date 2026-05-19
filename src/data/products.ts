import { Product, CategoryInfo } from '../types'
import { COLOMBIA_GENERAL_VAT_RATE } from '../lib/money'

const IVA_EXCLUIDO = 0
const IVA_GENERAL = COLOMBIA_GENERAL_VAT_RATE

export const categories: CategoryInfo[] = [
  { id: 'frutas-verduras', name: 'Frutas y Verduras', icon: 'pi pi-sun', color: '#22c55e' },
  { id: 'lacteos', name: 'Lacteos', icon: 'pi pi-box', color: '#3b82f6' },
  { id: 'carnes', name: 'Carnes', icon: 'pi pi-heart', color: '#ef4444' },
  { id: 'panaderia', name: 'Panaderia', icon: 'pi pi-star', color: '#f59e0b' },
  { id: 'bebidas', name: 'Bebidas', icon: 'pi pi-bolt', color: '#06b6d4' },
  { id: 'limpieza', name: 'Limpieza', icon: 'pi pi-sparkles', color: '#8b5cf6' },
  { id: 'snacks', name: 'Snacks', icon: 'pi pi-gift', color: '#ec4899' },
  { id: 'congelados', name: 'Congelados', icon: 'pi pi-cloud', color: '#64748b' },
]

export const products: Product[] = [
  // Frutas y Verduras
  { id: '1', name: 'Manzana Roja', barcode: '7501234567890', price: 9500, category: 'frutas-verduras', image: 'https://images.unsplash.com/photo-1560806887-1e4cd0b6cbd6?w=200', stock: 150, unit: 'kg', taxRate: IVA_EXCLUIDO },
  { id: '2', name: 'Banana', barcode: '7501234567891', price: 5200, category: 'frutas-verduras', image: 'https://images.unsplash.com/photo-1571771894821-ce9b6c11b08e?w=200', stock: 200, unit: 'kg', taxRate: IVA_EXCLUIDO },
  { id: '3', name: 'Tomate', barcode: '7501234567892', price: 4800, category: 'frutas-verduras', image: 'https://images.unsplash.com/photo-1546470427-227c7369a9a9?w=200', stock: 100, unit: 'kg', taxRate: IVA_EXCLUIDO },
  { id: '4', name: 'Lechuga', barcode: '7501234567893', price: 3800, category: 'frutas-verduras', image: 'https://images.unsplash.com/photo-1622206151226-18ca2c9ab4a1?w=200', stock: 80, unit: 'unidad', taxRate: IVA_EXCLUIDO },
  { id: '5', name: 'Zanahoria', barcode: '7501234567894', price: 3600, category: 'frutas-verduras', image: 'https://images.unsplash.com/photo-1598170845058-32b9d6a5da37?w=200', stock: 120, unit: 'kg', taxRate: IVA_EXCLUIDO },
  
  // Lacteos
  { id: '6', name: 'Leche Entera 1L', barcode: '7501234567895', price: 4200, category: 'lacteos', image: 'https://images.unsplash.com/photo-1563636619-e9143da7973b?w=200', stock: 200, unit: 'unidad', taxRate: IVA_EXCLUIDO },
  { id: '7', name: 'Yogurt Natural', barcode: '7501234567896', price: 5400, category: 'lacteos', image: 'https://images.unsplash.com/photo-1488477181946-6428a0291777?w=200', stock: 150, unit: 'unidad', taxRate: IVA_EXCLUIDO },
  { id: '8', name: 'Queso Fresco', barcode: '7501234567897', price: 12500, category: 'lacteos', image: 'https://images.unsplash.com/photo-1486297678162-eb2a19b0a32d?w=200', stock: 60, unit: 'unidad', taxRate: IVA_EXCLUIDO },
  { id: '9', name: 'Mantequilla', barcode: '7501234567898', price: 8900, category: 'lacteos', image: 'https://images.unsplash.com/photo-1589985270826-4b7bb135bc9d?w=200', stock: 80, unit: 'unidad', taxRate: IVA_EXCLUIDO },
  { id: '10', name: 'Crema 500ml', barcode: '7501234567899', price: 7600, category: 'lacteos', image: 'https://images.unsplash.com/photo-1587657426428-0d476051c7fc?w=200', stock: 50, unit: 'unidad', taxRate: IVA_EXCLUIDO },
  
  // Carnes
  { id: '11', name: 'Pechuga de Pollo', barcode: '7501234567900', price: 24000, category: 'carnes', image: 'https://images.unsplash.com/photo-1604503468506-a8da13d82791?w=200', stock: 40, unit: 'kg', taxRate: IVA_EXCLUIDO },
  { id: '12', name: 'Carne Molida', barcode: '7501234567901', price: 23000, category: 'carnes', image: 'https://images.unsplash.com/photo-1602470520998-f4a52199a3d6?w=200', stock: 35, unit: 'kg', taxRate: IVA_EXCLUIDO },
  { id: '13', name: 'Costillas de Cerdo', barcode: '7501234567902', price: 28000, category: 'carnes', image: 'https://images.unsplash.com/photo-1544025162-d76694265947?w=200', stock: 25, unit: 'kg', taxRate: IVA_EXCLUIDO },
  { id: '14', name: 'Salmon Fresco', barcode: '7501234567903', price: 48000, category: 'carnes', image: 'https://images.unsplash.com/photo-1574781330855-d0db8cc6a79c?w=200', stock: 20, unit: 'kg', taxRate: IVA_EXCLUIDO },
  
  // Panaderia
  { id: '15', name: 'Pan Blanco', barcode: '7501234567904', price: 4200, category: 'panaderia', image: 'https://images.unsplash.com/photo-1509440159596-0249088772ff?w=200', stock: 100, unit: 'unidad', taxRate: IVA_EXCLUIDO },
  { id: '16', name: 'Pan Integral', barcode: '7501234567905', price: 5500, category: 'panaderia', image: 'https://images.unsplash.com/photo-1586444248902-2f64eddc13df?w=200', stock: 80, unit: 'unidad', taxRate: IVA_EXCLUIDO },
  { id: '17', name: 'Croissant', barcode: '7501234567906', price: 3800, category: 'panaderia', image: 'https://images.unsplash.com/photo-1555507036-ab1f4038808a?w=200', stock: 60, unit: 'unidad', taxRate: IVA_EXCLUIDO },
  { id: '18', name: 'Dona Chocolate', barcode: '7501234567907', price: 4200, category: 'panaderia', image: 'https://images.unsplash.com/photo-1551024601-bec78aea704b?w=200', stock: 50, unit: 'unidad', taxRate: IVA_EXCLUIDO },
  
  // Bebidas
  { id: '19', name: 'Coca-Cola 2L', barcode: '7501234567908', price: 11000, category: 'bebidas', image: 'https://images.unsplash.com/photo-1629203851122-3726ecdf080e?w=200', stock: 200, unit: 'unidad', taxRate: IVA_GENERAL },
  { id: '20', name: 'Agua Mineral 1L', barcode: '7501234567909', price: 2800, category: 'bebidas', image: 'https://images.unsplash.com/photo-1564419320461-6870880221ad?w=200', stock: 300, unit: 'unidad', taxRate: IVA_GENERAL },
  { id: '21', name: 'Jugo de Naranja 1L', barcode: '7501234567910', price: 7800, category: 'bebidas', image: 'https://images.unsplash.com/photo-1621506289937-a8e4df240d0b?w=200', stock: 100, unit: 'unidad', taxRate: IVA_GENERAL },
  { id: '22', name: 'Cerveza 6-pack', barcode: '7501234567911', price: 18000, category: 'bebidas', image: 'https://images.unsplash.com/photo-1608270586620-248524c67de9?w=200', stock: 80, unit: 'unidad', taxRate: IVA_GENERAL },
  
  // Limpieza
  { id: '23', name: 'Detergente 3L', barcode: '7501234567912', price: 28900, category: 'limpieza', image: 'https://images.unsplash.com/photo-1585441695325-21557e93cd46?w=200', stock: 60, unit: 'unidad', taxRate: IVA_GENERAL },
  { id: '24', name: 'Jabon Liquido', barcode: '7501234567913', price: 13900, category: 'limpieza', image: 'https://images.unsplash.com/photo-1584305574647-0cc949a2bb9f?w=200', stock: 80, unit: 'unidad', taxRate: IVA_GENERAL },
  { id: '25', name: 'Papel Higienico 12pk', barcode: '7501234567914', price: 32900, category: 'limpieza', image: 'https://images.unsplash.com/photo-1584556812952-905ffd0c611a?w=200', stock: 100, unit: 'unidad', taxRate: IVA_GENERAL },
  
  // Snacks
  { id: '26', name: 'Papas Fritas', barcode: '7501234567915', price: 6200, category: 'snacks', image: 'https://images.unsplash.com/photo-1566478989037-eec170784d0b?w=200', stock: 150, unit: 'unidad', taxRate: IVA_GENERAL },
  { id: '27', name: 'Chocolate Barra', barcode: '7501234567916', price: 4500, category: 'snacks', image: 'https://images.unsplash.com/photo-1548907040-4baa42d10919?w=200', stock: 200, unit: 'unidad', taxRate: IVA_GENERAL },
  { id: '28', name: 'Galletas Oreo', barcode: '7501234567917', price: 5500, category: 'snacks', image: 'https://images.unsplash.com/photo-1558961363-fa8fdf82db35?w=200', stock: 120, unit: 'unidad', taxRate: IVA_GENERAL },
  
  // Congelados
  { id: '29', name: 'Pizza Congelada', barcode: '7501234567918', price: 18500, category: 'congelados', image: 'https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?w=200', stock: 40, unit: 'unidad', taxRate: IVA_GENERAL },
  { id: '30', name: 'Helado 1L', barcode: '7501234567919', price: 14900, category: 'congelados', image: 'https://images.unsplash.com/photo-1497034825429-c343d7c6a68f?w=200', stock: 50, unit: 'unidad', taxRate: IVA_GENERAL },
  { id: '31', name: 'Nuggets de Pollo', barcode: '7501234567920', price: 16900, category: 'congelados', image: 'https://images.unsplash.com/photo-1562967914-608f82629710?w=200', stock: 45, unit: 'unidad', taxRate: IVA_GENERAL },
]
