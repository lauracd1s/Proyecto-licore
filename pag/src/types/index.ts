// Tipos actualizados basados en el modelo de base de datos

// =====================================================
// ENTIDADES PRINCIPALES
// =====================================================

export interface Persona {
  id_persona: number;
  nombre: string;
  apellido: string;
  cedula: string;
  fecha_nacimiento?: Date;
  telefono?: string;
  email?: string;
  direccion?: string;
  fecha_registro: Date;
  estado: 'activo' | 'inactivo';
}

export interface CategoriaProducto {
  id_categoria: number;
  nombre: string;
  descripcion?: string;
  estado: 'activa' | 'inactiva';
  fecha_creacion: Date;
}

export interface Product {
  id_producto: number;
  id_categoria: number;
  categoria?: CategoriaProducto;
  codigo_barras?: string;
  nombre: string;
  marca?: string;
  precio_venta: number;
  pais_origen?: string;
  descripcion?: string;
  fecha_creacion: Date;
  estado: 'activo' | 'inactivo';
  // Campos adicionales para compatibilidad con el sistema actual
  stock?: number;
  minStock?: number;
  image?: string;
  alcoholContent?: number;
  volume?: number;
}

export interface Proveedor {
  id_proveedor: number;
  id_persona: number;
  persona?: Persona;
  codigo_proveedor: string;
  razon_social: string;
  fecha_registro: Date;
  estado: 'activo' | 'inactivo' | 'suspendido';
}

export interface Lote {
  id_lote: number;
  id_producto: number;
  id_proveedor: number;
  numero_lote: string;
  fecha_produccion?: Date;
  fecha_vencimiento?: Date;
  fecha_ingreso: Date;
  cantidad_inicial: number;
  precio_costo_unitario: number;
  precio_venta_sugerido?: number;
  observaciones?: string;
  estado: 'activo' | 'agotado' | 'vencido' | 'retirado';
}

export interface Cliente {
  id_cliente: number;
  id_persona: number;
  persona?: Persona;
  es_vip: boolean;
  limite_credito: number;
  fecha_registro: Date;
  estado: 'activo' | 'inactivo' | 'suspendido';
  // Campos adicionales para compatibilidad
  loyaltyPoints?: number;
  totalPurchases?: number;
  membershipLevel?: 'bronce' | 'plata' | 'oro' | 'premium';
}

export interface Empleado {
  id_empleado: number;
  id_persona: number;
  id_cargo: number;
  persona?: Persona;
  cargo?: Cargo;
  estado: 'activo' | 'inactivo' | 'vacaciones' | 'licencia' | 'despedido';
}

export interface Cargo {
  id_cargo: number;
  nombre: string;
  descripcion?: string;
  salario_base?: number;
  puede_manejar_inventario: boolean;
  puede_crear_ofertas: boolean;
  puede_ver_reportes: boolean;
  nivel_acceso: 1 | 2 | 3 | 4; // 1=básico, 2=intermedio, 3=avanzado, 4=administrador
  estado: 'activo' | 'inactivo';
  fecha_creacion: Date;
}

export interface Usuario {
  id_usuario: number;
  id_empleado: number;
  nombre_usuario: string;
  password_hash: string;
  estado: 'activo' | 'inactivo' | 'bloqueado' | 'suspendido';
  fecha_creacion: Date;
}

// =====================================================
// VENTAS Y FACTURACIÓN
// =====================================================

export interface FormaPago {
  id_forma_pago: number;
  nombre: string;
  descuento_aplicable: number;
  requiere_autorizacion: boolean;
  estado: 'activa' | 'inactiva';
}

export interface Factura {
  id_factura: number;
  id_cliente?: number;
  id_empleado: number;
  id_forma_pago: number;
  numero_factura: string;
  fecha_factura: Date;
  subtotal: number;
  total_descuentos: number;
  impuesto: number;
  total_factura: number;
  observaciones?: string;
  estado: 'pendiente' | 'pagada' | 'anulada' | 'credito';
  // Relaciones
  cliente?: Cliente;
  empleado?: Empleado;
  forma_pago?: FormaPago;
  detalles?: DetalleFactura[];
}

export interface DetalleFactura {
  id_factura: number;
  id_producto: number;
  cantidad: number;
  precio_unitario: number;
  costo_unitario: number;
  descuento_unitario: number;
  subtotal_linea: number;
  // Relaciones
  producto?: Product;
}

// =====================================================
// OFERTAS Y PROMOCIONES
// =====================================================

export interface TipoOferta {
  id_tipo_oferta: number;
  nombre: string;
  descripcion?: string;
  estado: 'activo' | 'inactivo';
}

export interface Temporada {
  id_temporada: number;
  nombre: string;
  descripcion?: string;
  fecha_inicio: Date;
  fecha_fin: Date;
  estado: 'activa' | 'inactiva';
}

export interface Oferta {
  id_oferta: number;
  id_tipo_oferta: number;
  id_temporada?: number;
  id_empleado_creador: number;
  nombre: string;
  descripcion?: string;
  fecha_inicio: Date;
  fecha_fin: Date;
  porcentaje_descuento?: number;
  cantidad_minima: number;
  limite_usos_por_cliente?: number;
  requiere_codigo: boolean;
  codigo_promocional?: string;
  estado: 'activa' | 'pausada' | 'vencida' | 'agotada';
  // Relaciones
  tipo_oferta?: TipoOferta;
  temporada?: Temporada;
  empleado_creador?: Empleado;
  productos?: OfertaProducto[];
  // Campos adicionales para compatibilidad
  title?: string;
  image?: string;
  terms?: string;
}

export interface OfertaProducto {
  id_oferta: number;
  id_producto: number;
  descuento_especifico?: number;
}

// =====================================================
// FIDELIZACIÓN
// =====================================================

export interface ProgramaFidelizacion {
  id_programa: number;
  nombre: string;
  descripcion?: string;
  puntos_por_peso: number;
  pesos_por_punto: number;
  fecha_inicio: Date;
  fecha_fin?: Date;
  estado: 'activo' | 'pausado' | 'finalizado';
}

export interface PuntosCliente {
  id_cliente: number;
  id_programa: number;
  puntos_acumulados: number;
  puntos_canjeados: number;
  fecha_ultima_acumulacion?: Date;
  fecha_ultima_utilizacion?: Date;
  estado: 'activo' | 'suspendido' | 'cancelado';
}

export interface TransaccionPuntos {
  id_transaccion: number;
  id_cliente: number;
  id_programa: number;
  id_factura?: number;
  id_empleado: number;
  tipo_transaccion: 'acumulacion' | 'canje' | 'expiracion' | 'ajuste' | 'bonificacion';
  puntos: number;
  descripcion?: string;
  fecha_transaccion: Date;
  fecha_expiracion?: Date;
  usuario_responsable?: string;
}

// =====================================================
// INVENTARIO
// =====================================================

export interface ConfiguracionInventario {
  id_producto: number;
  stock_minimo: number;
  stock_maximo: number;
  requiere_refrigeracion: boolean;
  dias_alerta_vencimiento: number;
  fecha_configuracion: Date;
}

export interface LoteInventario {
  id_lote: number;
  stock_actual: number;
  ubicacion_fisica?: string;
  estado_stock: 'disponible' | 'reservado' | 'agotado' | 'bloqueado';
  fecha_ultima_actualizacion: Date;
}

// =====================================================
// TIPOS ADICIONALES PARA COMPATIBILIDAD
// =====================================================

export interface InventoryAlert {
  id: string;
  productId: string;
  product: Product;
  type: 'stock_bajo' | 'sin_stock' | 'vencimiento_proximo';
  message: string;
  priority: 'alta' | 'media' | 'baja';
  isResolved: boolean;
  createdAt: Date;
}

export interface SaleItemDisplay {
  productId: string;
  product: ProductDisplay;
  quantity: number;
  unitPrice: number;
  discount: number;
  total: number;
  offerType?: string;
  offerLabel?: string;
}

export interface SaleItem {
  productId: string;
  product: Product;
  quantity: number;
  unitPrice: number;
  discount: number;
  total: number;
}

export interface SaleDisplay {
  id: string;
  customerId?: string;
  items: SaleItemDisplay[];
  subtotal: number;
  discount: number;
  tax: number;
  total: number;
  paymentMethod: 'efectivo' | 'tarjeta' | 'transferencia';
  status: 'pendiente' | 'completada' | 'cancelada' | 'devuelta';
  createdAt: Date;
  completedAt?: Date;
  cancelledAt?: Date;
  cashierId: string;
}

export interface Sale {
  id: string;
  customerId?: string;
  items: SaleItem[];
  subtotal: number;
  discount: number;
  tax: number;
  total: number;
  paymentMethod: 'efectivo' | 'tarjeta' | 'transferencia';
  status: 'completada' | 'cancelada' | 'pendiente';
  createdAt: Date;
  completedAt?: Date;
  cashierId: string;
}

export interface DashboardMetrics {
  totalSales: number;
  salesGrowth: number;
  totalProducts: number;
  lowStockAlerts: number;
  activeOffers: number;
  totalCustomers: number;
  loyaltyMembers: number;
  topSellingProducts: Array<{
    product: ProductDisplay;
    quantity: number;
    revenue: number;
  }>;
  salesByCategory: Array<{
    category: string;
    amount: number;
    percentage: number;
  }>;
  monthlyRevenue: Array<{
    month: string;
    revenue: number;
    sales: number;
  }>;
}

// =====================================================
// TIPOS DE COMPATIBILIDAD PARA EL SISTEMA ACTUAL
// =====================================================

// Interfaz compatible con el sistema actual para productos
export interface ProductDisplay {
  id: string;
  name: string;
  category: string;
  brand: string;
  price: number;
  cost: number;
  stock: number;
  minStock: number;
  image: string;
  unidadMedida: string;
  description: string;
  alcoholContent: number;
  volume: number;
  barcode: string;
  isActive: boolean;
  createdAt: Date;
  updatedDate?: Date;
  expirationDate?: string;
}

export interface CustomerDisplay {
  id: string;
  name: string;
  email: string;
  phone: string;
  address: string;
  birthDate?: Date;
  loyaltyPoints: number;
  totalPurchases: number;
  membershipLevel: 'bronce' | 'plata' | 'oro' | 'premium';
  isVip: boolean;
  registrationDate: Date;
  createdAt: Date;
  lastPurchase?: Date;
}

export interface OfferDisplay {
  id: string;
  title: string;
  description: string;
  type: 'descuento' | '2x1' | '3x2' | 'combo' | 'precio_especial';
  discount: number;
  discountType: 'percentage' | 'fixed';
  discountValue: number;
  productIds: string[];
  startDate: Date;
  endDate: Date;
  isActive: boolean;
  image: string;
  terms: string;
  conditions: string;
  targetAudience: 'premium' | 'general' | 'loyalty' | 'new';
  maxRedemptions?: number;
  currentRedemptions: number;
  createdAt: Date;
}

// Alias para mantener compatibilidad completa
export type Customer = CustomerDisplay;
export type Offer = OfferDisplay;
export type ProductCompat = ProductDisplay;

export interface Promotion {
  id: string;
  name: string;
  type: 'descuento' | 'combo' | 'happy_hour';
  schedule: {
    days: string[];
    startTime: string;
    endTime: string;
  };
  isActive: boolean;
  productIds: string[];
  discountPercentage: number;
  createdAt: Date;
}

// =====================================================
// INTERFACES ADICIONALES PARA COMPLETAR MÓDULOS
// =====================================================

// TEMPORADAS PARA OFERTAS
export interface SeasonDisplay {
  id: string;
  name: string;
  description: string;
  startDate: Date;
  endDate: Date;
  isActive: boolean;
  color: string;
}

// FIDELIZACIÓN AVANZADA
export interface LoyaltyProgramDisplay {
  id: string;
  name: string;
  description: string;
  pointsPerDollar: number;
  minimumPurchase: number;
  rewardLevels: LoyaltyLevel[];
  isActive: boolean;
  createdAt: Date;
}

export interface LoyaltyLevel {
  id: string;
  name: string;
  minPoints: number;
  benefits: string[];
  discountPercentage: number;
  color: string;
}

export interface PointTransactionDisplay {
  id: string;
  customerId: string;
  type: 'earned' | 'redeemed' | 'expired';
  points: number;
  description: string;
  date: Date;
  orderId?: string;
}

// CONFIGURACIÓN DE INVENTARIO AVANZADA
export interface InventoryConfigDisplay {
  id: string;
  productId: string;
  minStock: number;
  maxStock: number;
  reorderPoint: number;
  leadTimeDays: number;
  safetyStock: number;
  autoReorder: boolean;
  supplierId?: string;
  lastUpdated: Date;
}

export interface StockMovementDisplay {
  id: string;
  productId: string;
  type: 'entrada' | 'salida' | 'ajuste' | 'merma';
  quantity: number;
  reason: string;
  date: Date;
  userId: string;
  batchNumber?: string;
  cost?: number;
}

export interface BatchDisplay {
  id: string;
  productId: string;
  batchNumber: string;
  expirationDate: Date;
  quantity: number;
  costPerUnit: number;
  supplierName: string;
  status: 'active' | 'expired' | 'sold';
  createdAt: Date;
}
