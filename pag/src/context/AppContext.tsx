import React, { createContext, useContext, useState } from 'react';
import type { ReactNode } from 'react';
import type { ProductDisplay, Customer, Sale, SaleDisplay, Offer, OfferDisplay, DashboardMetrics } from '../types';
import { mockProducts, mockCustomers, mockSales, mockOffers, mockDashboardMetrics } from '../data/mockData';



interface AppState {
  // Productos
  products: ProductDisplay[];
  addProduct: (product: Omit<ProductDisplay, 'id' | 'createdAt' | 'updatedAt'>) => void;
  updateProduct: (id: string, product: Partial<ProductDisplay>) => void;
  deleteProduct: (id: string) => void;
  
  // Clientes
  customers: Customer[];
  addCustomer: (customer: Omit<Customer, 'id' | 'createdAt'>) => void;
  updateCustomer: (id: string, customer: Partial<Customer>) => void;
  
  // Ofertas
  offers: OfferDisplay[];
  addOffer: (offer: Omit<OfferDisplay, 'id' | 'createdAt'>) => void;
  updateOffer: (id: string, offer: Partial<OfferDisplay>) => void;
  deleteOffer: (id: string) => void;
  
  // Ventas
  sales: Sale[];
  addSale: (sale: Omit<Sale, 'id' | 'createdAt'>) => void;
  addSaleDisplay: (sale: Omit<SaleDisplay, 'id' | 'createdAt'>) => void;
  
  // Métricas
  dashboardMetrics: DashboardMetrics;
  refreshMetrics: () => void;
  
  // Carrito de compras
  cart: Array<{ product: ProductDisplay; quantity: number }>;
  addToCart: (product: ProductDisplay, quantity: number) => void;
  removeFromCart: (productId: string) => void;
  updateCartQuantity: (productId: string, quantity: number) => void;
  clearCart: () => void;
}

const AppContext = createContext<AppState | undefined>(undefined);

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
};

interface AppProviderProps {
  children: ReactNode;
}

export const AppProvider: React.FC<AppProviderProps> = ({ children }) => {
  const [products, setProducts] = useState<ProductDisplay[]>(mockProducts);
  const [customers, setCustomers] = useState<Customer[]>(mockCustomers);
  const [offers, setOffers] = useState<OfferDisplay[]>(mockOffers);
  const [sales, setSales] = useState<Sale[]>(mockSales);
  const [dashboardMetrics, setDashboardMetrics] = useState<DashboardMetrics>(mockDashboardMetrics);
  const [cart, setCart] = useState<Array<{ product: ProductDisplay; quantity: number }>>([]);

  // Funciones para productos
  const addProduct = (productData: Omit<ProductDisplay, 'id' | 'createdAt'>) => {
    const newProduct: ProductDisplay = {
      ...productData,
      id: Date.now().toString(),
      createdAt: new Date()
    };
    setProducts(prev => [...prev, newProduct]);
  };

  const updateProduct = (id: string, productData: Partial<ProductDisplay>) => {
    setProducts(prev =>
      prev.map(product =>
        product.id === id
          ? { ...product, ...productData }
          : product
      )
    );
  };

  const deleteProduct = (id: string) => {
    setProducts(prev => prev.filter(product => product.id !== id));
  };

  // Funciones para clientes
  const addCustomer = (customerData: Omit<Customer, 'id' | 'createdAt'>) => {
    const newCustomer: Customer = {
      ...customerData,
      id: Date.now().toString(),
      createdAt: new Date()
    };
    setCustomers(prev => [...prev, newCustomer]);
  };

  const updateCustomer = (id: string, customerData: Partial<Customer>) => {
    setCustomers(prev =>
      prev.map(customer =>
        customer.id === id ? { ...customer, ...customerData } : customer
      )
    );
  };

  // Funciones para ofertas
  const addOffer = (offerData: Omit<Offer, 'id' | 'createdAt'>) => {
    const newOffer: Offer = {
      ...offerData,
      id: Date.now().toString(),
      createdAt: new Date()
    };
    setOffers(prev => [...prev, newOffer]);
  };

  const updateOffer = (id: string, offerData: Partial<Offer>) => {
    setOffers(prev =>
      prev.map(offer => (offer.id === id ? { ...offer, ...offerData } : offer))
    );
  };

  const deleteOffer = (id: string) => {
    setOffers(prev => prev.filter(offer => offer.id !== id));
  };

  // Funciones para ventas
  const addSale = (saleData: Omit<Sale, 'id' | 'createdAt'>) => {
    const newSale: Sale = {
      ...saleData,
      id: Date.now().toString(),
      createdAt: new Date()
    };
    setSales(prev => [...prev, newSale]);
    
    // Actualizar stock de productos
    saleData.items.forEach(item => {
      updateProduct(item.productId, {
        stock: products.find(p => p.id === item.productId)!.stock - item.quantity
      });
    });
  };

  const addSaleDisplay = (saleData: Omit<SaleDisplay, 'id' | 'createdAt'>) => {
    // Para el POS, simplemente simulamos agregar la venta sin actualizar la base de datos
    console.log('Venta procesada:', saleData);
  };

  // Funciones para el carrito
  const addToCart = (product: ProductDisplay, quantity: number) => {
    setCart(prev => {
      const existingItem = prev.find(item => item.product.id === product.id);
      if (existingItem) {
        return prev.map(item =>
          item.product.id === product.id
            ? { ...item, quantity: item.quantity + quantity }
            : item
        );
      }
      return [...prev, { product, quantity }];
    });
  };

  const removeFromCart = (productId: string) => {
    setCart(prev => prev.filter(item => item.product.id !== productId));
  };

  const updateCartQuantity = (productId: string, quantity: number) => {
    setCart(prev =>
      prev.map(item =>
        item.product.id === productId ? { ...item, quantity } : item
      )
    );
  };

  const clearCart = () => {
    setCart([]);
  };

  // Función para actualizar métricas
  const refreshMetrics = () => {
    // Aquí se calcularían las métricas reales basadas en los datos actuales
    // Por ahora mantenemos los datos mock
    setDashboardMetrics(mockDashboardMetrics);
  };

  const value: AppState = {
    products,
    addProduct,
    updateProduct,
    deleteProduct,
    customers,
    addCustomer,
    updateCustomer,
    offers,
    addOffer,
    updateOffer,
    deleteOffer,
    sales,
    addSale,
    addSaleDisplay,
    dashboardMetrics,
    refreshMetrics,
    cart,
    addToCart,
    removeFromCart,
    updateCartQuantity,
    clearCart
  };

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
};
