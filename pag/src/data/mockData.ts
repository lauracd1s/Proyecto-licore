import type { ProductDisplay, Product, CustomerDisplay, Sale, OfferDisplay, DashboardMetrics } from '../types';

// Crear un producto mock compatible para las ventas
const createMockProduct = (productDisplay: ProductDisplay): Product => ({
  id_producto: parseInt(productDisplay.id),
  id_categoria: 1,
  nombre: productDisplay.name,
  marca: productDisplay.brand,
  precio_venta: productDisplay.price,
  pais_origen: 'Colombia',
  descripcion: productDisplay.description,
  fecha_creacion: productDisplay.createdAt,
  estado: 'activo',
  stock: productDisplay.stock,
  minStock: productDisplay.minStock,
  image: productDisplay.image,
  alcoholContent: productDisplay.alcoholContent,
  volume: productDisplay.volume
});

// Productos de ejemplo
export const mockProducts: ProductDisplay[] = [
  {
    id: '1',
    name: 'Johnnie Walker Black Label',
    category: 'whisky',
    brand: 'Johnnie Walker',
    price: 65.99,
    cost: 45.00,
    stock: 25,
    minStock: 10,
    image: '/images/johnnie-black.jpg',
    description: 'Whisky escocés de 12 años, sabor suave y complejo',
    alcoholContent: 40,
    volume: 750,
    barcode: '1234567890123',
    isActive: true,
    createdAt: new Date('2024-01-15')
  },
  {
    id: '2',
    name: 'Absolut Vodka',
    category: 'vodka',
    brand: 'Absolut',
    price: 28.99,
    cost: 20.00,
    stock: 8,
    minStock: 15,
    image: '/images/absolut.jpg',
    description: 'Vodka sueco premium, destilado de trigo de invierno',
    alcoholContent: 40,
    volume: 750,
    barcode: '1234567890124',
    isActive: true,
    createdAt: new Date('2024-01-10')
  },
  {
    id: '3',
    name: 'Bacardi Superior',
    category: 'ron',
    brand: 'Bacardi',
    price: 22.50,
    cost: 16.00,
    stock: 32,
    minStock: 12,
    image: '/images/bacardi.jpg',
    description: 'Ron blanco envejecido, perfecto para cocteles',
    alcoholContent: 37.5,
    volume: 750,
    barcode: '1234567890125',
    isActive: true,
    createdAt: new Date('2024-01-20')
  },
  {
    id: '4',
    name: 'Tanqueray Gin',
    category: 'gin',
    brand: 'Tanqueray',
    price: 35.99,
    cost: 25.00,
    stock: 18,
    minStock: 10,
    image: '/images/tanqueray.jpg',
    description: 'Gin London Dry con botánicos perfectamente equilibrados',
    alcoholContent: 47.3,
    volume: 750,
    barcode: '1234567890126',
    isActive: true,
    createdAt: new Date('2024-02-01')
  },
  {
    id: '5',
    name: 'Corona Extra',
    category: 'cerveza',
    brand: 'Corona',
    price: 2.50,
    cost: 1.80,
    stock: 120,
    minStock: 50,
    image: '/images/corona.jpg',
    description: 'Cerveza mexicana ligera y refrescante',
    alcoholContent: 4.5,
    volume: 355,
    barcode: '1234567890127',
    isActive: true,
    createdAt: new Date('2024-01-05')
  },
  {
    id: '6',
    name: 'Casillero del Diablo Reserva',
    category: 'vino',
    brand: 'Concha y Toro',
    price: 18.99,
    cost: 12.00,
    stock: 24,
    minStock: 15,
    image: '/images/casillero.jpg',
    description: 'Vino tinto chileno Cabernet Sauvignon',
    alcoholContent: 13.5,
    volume: 750,
    barcode: '1234567890128',
    isActive: true,
    createdAt: new Date('2024-01-25')
  }
];

// Clientes de ejemplo
export const mockCustomers: CustomerDisplay[] = [
  {
    id: '1',
    name: 'Carlos Mendoza',
    email: 'carlos.mendoza@email.com',
    phone: '+1-234-567-8901',
    address: 'Av. Principal 123, Ciudad',
    birthDate: new Date('1985-06-15'),
    loyaltyPoints: 1250,
    totalPurchases: 2340.50,
    membershipLevel: 'oro',
    isVip: true,
    registrationDate: new Date('2023-05-10'),
    createdAt: new Date('2023-05-10'),
    lastPurchase: new Date('2024-08-05')
  },
  {
    id: '2',
    name: 'María González',
    email: 'maria.gonzalez@email.com',
    phone: '+1-234-567-8902',
    address: 'Calle Secundaria 456, Ciudad',
    birthDate: new Date('1990-03-22'),
    loyaltyPoints: 680,
    totalPurchases: 890.25,
    membershipLevel: 'plata',
    isVip: false,
    registrationDate: new Date('2023-08-15'),
    createdAt: new Date('2023-08-15'),
    lastPurchase: new Date('2024-08-03')
  },
  {
    id: '3',
    name: 'Roberto Silva',
    email: 'roberto.silva@email.com',
    phone: '+1-234-567-8903',
    address: 'Urbanización Norte 789, Ciudad',
    loyaltyPoints: 2100,
    totalPurchases: 4250.75,
    membershipLevel: 'premium',
    isVip: true,
    registrationDate: new Date('2023-01-20'),
    createdAt: new Date('2023-01-20'),
    lastPurchase: new Date('2024-08-06')
  }
];

// Ofertas de ejemplo
export const mockOffers: OfferDisplay[] = [
  {
    id: '1',
    title: 'Happy Hour Whisky',
    description: '25% de descuento en todos los whiskys',
    type: 'descuento',
    discount: 25,
    discountType: 'percentage',
    discountValue: 25,
    productIds: ['1'],
    startDate: new Date('2024-08-01'),
    endDate: new Date('2024-08-31'),
    isActive: true,
    image: '/images/happy-hour-whisky.jpg',
    terms: 'Válido de lunes a viernes de 5PM a 8PM',
    conditions: 'Compra mínima de $50',
    targetAudience: 'general',
    maxRedemptions: 100,
    currentRedemptions: 45,
    createdAt: new Date('2024-07-28')
  },
  {
    id: '2',
    title: 'Combo Fiesta',
    description: 'Lleva 1 botella de vodka + 1 six pack de cerveza',
    type: 'combo',
    discount: 15,
    discountType: 'percentage',
    discountValue: 15,
    productIds: ['2', '5'],
    startDate: new Date('2024-08-01'),
    endDate: new Date('2024-08-15'),
    isActive: true,
    image: '/images/combo-fiesta.jpg',
    terms: 'Combo limitado, sujeto a disponibilidad',
    conditions: 'Solo fines de semana',
    targetAudience: 'general',
    maxRedemptions: 50,
    currentRedemptions: 23,
    createdAt: new Date('2024-07-30')
  },
  {
    id: '3',
    title: '2x1 en Vinos',
    description: 'Lleva 2 botellas de vino por el precio de 1',
    type: '2x1',
    discount: 50,
    discountType: 'percentage',
    discountValue: 50,
    productIds: ['6'],
    startDate: new Date('2024-08-10'),
    endDate: new Date('2024-08-20'),
    isActive: true,
    image: '/images/2x1-vinos.jpg',
    terms: 'Aplica solo para vinos de la misma referencia',
    conditions: 'Máximo 2 botellas por cliente',
    targetAudience: 'premium',
    maxRedemptions: 30,
    currentRedemptions: 18,
    createdAt: new Date('2024-08-05')
  }
];

// Ventas de ejemplo
export const mockSales: Sale[] = [
  {
    id: '1',
    customerId: '1',
    items: [
      {
        productId: '1',
        product: createMockProduct(mockProducts[0]),
        quantity: 1,
        unitPrice: 65.99,
        discount: 0,
        total: 65.99
      }
    ],
    subtotal: 65.99,
    discount: 0,
    tax: 10.56,
    total: 76.55,
    paymentMethod: 'tarjeta',
    status: 'completada',
    createdAt: new Date('2024-08-07T10:30:00'),
    completedAt: new Date('2024-08-07T10:32:00'),
    cashierId: 'cashier1'
  },
  {
    id: '2',
    customerId: '2',
    items: [
      {
        productId: '5',
        product: createMockProduct(mockProducts[4]),
        quantity: 6,
        unitPrice: 2.50,
        discount: 0,
        total: 15.00
      }
    ],
    subtotal: 15.00,
    discount: 0,
    tax: 2.40,
    total: 17.40,
    paymentMethod: 'efectivo',
    status: 'completada',
    createdAt: new Date('2024-08-07T14:15:00'),
    completedAt: new Date('2024-08-07T14:17:00'),
    cashierId: 'cashier1'
  }
];

// Métricas del dashboard
export const mockDashboardMetrics: DashboardMetrics = {
  totalSales: 15420.50,
  salesGrowth: 12.5,
  totalProducts: 150,
  lowStockAlerts: 5,
  activeOffers: 3,
  totalCustomers: 245,
  loyaltyMembers: 89,
  topSellingProducts: [
    {
      product: mockProducts[4], // Corona
      quantity: 245,
      revenue: 612.50
    },
    {
      product: mockProducts[0], // Johnnie Walker
      quantity: 18,
      revenue: 1187.82
    },
    {
      product: mockProducts[2], // Bacardi
      quantity: 35,
      revenue: 787.50
    }
  ],
  salesByCategory: [
    { category: 'cerveza', amount: 8420.30, percentage: 35.2 },
    { category: 'whisky', amount: 5280.75, percentage: 22.1 },
    { category: 'vodka', amount: 3150.20, percentage: 13.2 },
    { category: 'ron', amount: 2890.15, percentage: 12.1 },
    { category: 'vino', amount: 2420.80, percentage: 10.1 },
    { category: 'gin', amount: 1759.30, percentage: 7.3 }
  ],
  monthlyRevenue: [
    { month: 'Ene', revenue: 12540.20, sales: 89 },
    { month: 'Feb', revenue: 13820.75, sales: 95 },
    { month: 'Mar', revenue: 15230.40, sales: 108 },
    { month: 'Abr', revenue: 14650.80, sales: 102 },
    { month: 'May', revenue: 16420.25, sales: 115 },
    { month: 'Jun', revenue: 18750.30, sales: 128 },
    { month: 'Jul', revenue: 17890.45, sales: 122 },
    { month: 'Ago', revenue: 15420.50, sales: 98 }
  ]
};
