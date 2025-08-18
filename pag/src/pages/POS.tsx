import React, { useState } from 'react';
import { CreditCard, Plus, Minus, ShoppingCart, Tag, Percent, Clock, AlertTriangle } from 'lucide-react';
import { useApp } from '../context/AppContext';
import type { ProductDisplay, SaleItemDisplay } from '../types';

const POS: React.FC = () => {
  // Leer productos desde localStorage
  const [products, setProducts] = useState<ProductDisplay[]>([]);
  // Leer ofertas desde localStorage (incluye automáticas)
  const [offers, setOffers] = useState<any[]>([]);
  const { customers, addSaleDisplay } = useApp();

  React.useEffect(() => {
    // Cargar productos
    let parsedProducts: ProductDisplay[] = [];
    try {
      const storedProducts = localStorage.getItem('products');
      if (storedProducts) {
        const arr = JSON.parse(storedProducts);
        if (Array.isArray(arr)) {
          parsedProducts = arr.map((p: any) => ({
            ...p,
            createdAt: p.createdAt ? new Date(p.createdAt) : undefined,
            expirationDate: p.expirationDate ? new Date(p.expirationDate) : undefined
          }));
        }
      }
    } catch (e) {
      parsedProducts = [];
    }
    setProducts(parsedProducts);
    console.log('Productos cargados:', parsedProducts);

    // Cargar ofertas manuales
    let parsedOffers: any[] = [];
    try {
      const storedOffers = localStorage.getItem('offers');
      if (storedOffers) {
        const arr = JSON.parse(storedOffers);
        if (Array.isArray(arr)) {
          parsedOffers = arr.map((o: any) => {
            let startDate = o.startDate;
            let endDate = o.endDate;
            if (typeof startDate === 'string') startDate = new Date(startDate);
            if (typeof endDate === 'string') endDate = new Date(endDate);
            return {
              ...o,
              startDate,
              endDate
            };
          });
        }
      }
    } catch (e) {
      parsedOffers = [];
    }

    // Generar ofertas automáticas por vencimiento
    let autoOffers: any[] = [];
    if (parsedProducts.length > 0) {
      const today = new Date();
      parsedProducts.forEach((product: any) => {
        if (product.expirationDate) {
          const expDate = new Date(product.expirationDate);
          const diffDays = Math.ceil((expDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
          if (diffDays > 0 && diffDays <= 20) {
            let discount = 10 + ((20 - diffDays) * 2);
            let priceWithDiscount = product.price * (1 - discount / 100);
            if (priceWithDiscount < product.cost) {
              discount = Math.round((1 - (product.cost / product.price)) * 100);
            }
            if (discount > 0 && product.isActive) {
              autoOffers.push({
                id: `auto-${product.id}`,
                title: `¡Oferta por vencimiento! ${product.name}`,
                description: `Descuento especial porque este producto vence en ${diffDays} días.`,
                type: 'automatico',
                discount,
                discountType: 'percentage',
                discountValue: discount,
                productIds: [product.id],
                startDate: today,
                endDate: expDate,
                isActive: true,
                image: product.image || '',
                terms: 'Oferta automática por vencimiento',
                conditions: 'Válido hasta agotar existencias o fecha de vencimiento',
                targetAudience: 'general',
                currentRedemptions: 0,
                createdAt: today,
                daysUntilExpiry: diffDays,
                isAutomatic: true
              });
            }
          }
        }
      });
    }

    // Mezclar ofertas manuales y automáticas
    const allOffers = [...parsedOffers, ...autoOffers];
    setOffers(allOffers);
    console.log('Todas las ofertas cargadas:', allOffers);
  }, []);

  const [cartItems, setCartItems] = useState<SaleItemDisplay[]>([]);
  const [selectedCustomer, setSelectedCustomer] = useState('');
  const [paymentMethod, setPaymentMethod] = useState<'efectivo' | 'tarjeta' | 'transferencia'>('efectivo');

  // Función mejorada para verificar si un producto tiene oferta activa
  const getActiveOfferForProduct = (productId: string) => {
    const now = new Date();
    const activeOffer = offers.find(offer => 
      offer.isActive && 
      offer.productIds && 
      offer.productIds.includes(productId) &&
      new Date(offer.startDate) <= now && 
      new Date(offer.endDate) >= now
    );
    
    console.log(`Buscando oferta para producto ${productId}:`, activeOffer);
    return activeOffer;
  };

  // Aplica oferta y descuento para un producto y cantidad
  const getOfferForProduct = (product: ProductDisplay, quantity: number) => {
    const offer = getActiveOfferForProduct(product.id);
    let discount = 0;
    let unitPrice = product.price;
    let offerType: string | undefined = undefined;
    let offerLabel: string | undefined = undefined;
    let specialTotal = undefined;

    if (offer) {
      console.log(`Aplicando oferta ${offer.type} al producto ${product.name}`);
      offerType = offer.type;
      
      if (offer.type === 'descuento') {
        if (offer.discountType === 'percentage') {
          discount = (product.price * offer.discount) / 100;
          unitPrice = product.price - discount;
          offerLabel = `${offer.discount}% OFF`;
        } else if (offer.discountType === 'fixed') {
          discount = offer.discount;
          unitPrice = Math.max(0, product.price - discount);
          offerLabel = `$${offer.discount} OFF`;
        }
      } else if (offer.type === 'automatico') {
        // Ofertas automáticas por vencimiento
        if (offer.discountType === 'percentage') {
          discount = (product.price * offer.discount) / 100;
          unitPrice = product.price - discount;
          offerLabel = `${offer.discount}% OFF - Vence en ${offer.daysUntilExpiry || 0} días`;
        }
      } else if (offer.type === 'precio_especial') {
        unitPrice = offer.discount;
        discount = product.price - unitPrice;
        offerLabel = `Precio especial $${offer.discount}`;
      } else if (offer.type === '2x1') {
        const sets = Math.floor(quantity / 2);
        const remainder = quantity % 2;
        specialTotal = (sets + remainder) * product.price;
        discount = (quantity * product.price) - specialTotal;
        offerLabel = '2x1';
      } else if (offer.type === '3x2') {
        const sets = Math.floor(quantity / 3);
        const remainder = quantity % 3;
        specialTotal = (sets * 2 * product.price) + (remainder * product.price);
        discount = (quantity * product.price) - specialTotal;
        offerLabel = '3x2';
      }
      
      // Asegurar que no haya precios negativos
      if (unitPrice < 0) unitPrice = 0;
    }

    const total = specialTotal !== undefined ? specialTotal : unitPrice * quantity;
    const totalDiscount = (product.price * quantity) - total;

    return { 
      unitPrice, 
      discount: totalDiscount, 
      offerType, 
      offerLabel, 
      total,
      isAutomatic: offer?.isAutomatic || false
    };
  };

  // Agregar producto al carrito y aplicar oferta
  const addProductToCart = (product: ProductDisplay) => {
    const existingItem = cartItems.find(item => item.productId === product.id);
    const newQuantity = existingItem ? existingItem.quantity + 1 : 1;
    const offerData = getOfferForProduct(product, newQuantity);

    console.log(`Agregando ${product.name} al carrito:`, offerData);

    if (existingItem) {
      setCartItems(prev => 
        prev.map(item => {
          if (item.productId === product.id) {
            return { ...item, quantity: newQuantity, ...offerData };
          }
          return item;
        })
      );
    } else {
      setCartItems(prev => [...prev, {
        productId: product.id,
        product,
        quantity: 1,
        ...offerData
      }]);
    }
  };

  // Actualizar cantidad y recalcular oferta
  const updateQuantity = (productId: string, newQuantity: number) => {
    if (newQuantity <= 0) {
      setCartItems(prev => prev.filter(item => item.productId !== productId));
    } else {
      setCartItems(prev => prev.map(item => {
        if (item.productId === productId) {
          const offerData = getOfferForProduct(item.product, newQuantity);
          return { ...item, quantity: newQuantity, ...offerData };
        }
        return item;
      }));
    }
  };

  // Calcular subtotal considerando descuentos
  const subtotal = cartItems.reduce((sum, item) => sum + item.total, 0);
  const totalDiscounts = cartItems.reduce((sum, item) => sum + item.discount, 0);
  const tax = subtotal * 0.16; // 16% IVA
  const total = subtotal + tax;

  const processSale = () => {
    if (cartItems.length === 0) return;

    const saleData = {
      id: Date.now().toString(),
      customerId: selectedCustomer || undefined,
      items: cartItems,
      subtotal,
      discount: totalDiscounts,
      tax,
      total,
      paymentMethod,
      status: 'completada' as const,
      completedAt: new Date(),
      cashierId: 'cashier1',
      createdAt: new Date()
    };

    // Guardar la venta en localStorage
    const storedSales = localStorage.getItem('sales');
    let salesArr = [];
    if (storedSales) {
      try {
        salesArr = JSON.parse(storedSales);
      } catch (e) {
        salesArr = [];
      }
    }
    salesArr.push(saleData);
    localStorage.setItem('sales', JSON.stringify(salesArr));

    // Restar la cantidad vendida al stock de cada producto
    const storedProducts = localStorage.getItem('products');
    let productsArr = [];
    if (storedProducts) {
      try {
        productsArr = JSON.parse(storedProducts);
      } catch (e) {
        productsArr = [];
      }
    }
    saleData.items.forEach(saleItem => {
      const prodIndex = productsArr.findIndex((p: any) => p.id === saleItem.productId);
      if (prodIndex !== -1) {
        productsArr[prodIndex].stock = Math.max(0, (productsArr[prodIndex].stock || 0) - saleItem.quantity);
      }
    });
    localStorage.setItem('products', JSON.stringify(productsArr));
    setProducts(productsArr);

    addSaleDisplay(saleData);
    setCartItems([]);
    setSelectedCustomer('');
    alert('Venta procesada exitosamente');
  };

  // Función para verificar si un producto tiene oferta activa (para mostrar en la lista)
  const hasActiveOffer = (productId: string) => {
    return !!getActiveOfferForProduct(productId);
  };

  // Función para verificar si la oferta es automática
  const getOfferDisplayInfo = (productId: string) => {
    const offer = getActiveOfferForProduct(productId);
    if (!offer) return null;

    return {
      ...offer,
      isAutomatic: offer.type === 'automatico',
      daysUntilExpiry: offer.daysUntilExpiry || 0
    };
  };

  return (
    <div className="pos">
      <div className="page-header">
        <h1 className="page-title">
          <CreditCard size={28} />
          Punto de Venta (POS)
        </h1>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 400px', gap: '2rem' }}>
        {/* Productos disponibles */}
        <div className="card">
          <div className="card-header">
            <h3 className="card-title">Productos Disponibles</h3>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: '1rem' }}>
            {products.filter(p => p.stock > 0).map(product => {
              const hasOffer = hasActiveOffer(product.id);
              const offerInfo = hasOffer ? getOfferDisplayInfo(product.id) : null;
              
              return (
                <div
                  key={product.id}
                  onClick={() => addProductToCart(product)}
                  style={{
                    padding: '1rem',
                    border: hasOffer 
                      ? (offerInfo?.isAutomatic ? '2px solid #ff6b35' : '2px solid #28a745') 
                      : '2px solid #E0E0E0',
                    borderRadius: '8px',
                    cursor: 'pointer',
                    transition: 'all 0.2s ease',
                    position: 'relative',
                    backgroundColor: hasOffer 
                      ? (offerInfo?.isAutomatic ? '#fff7f5' : '#f8fff9') 
                      : 'white'
                  }}
                  onMouseOver={e => (e.currentTarget.style.borderColor = hasOffer 
                    ? (offerInfo?.isAutomatic ? '#e55722' : '#1e7e34') 
                    : '#8B4513')}
                  onMouseOut={e => (e.currentTarget.style.borderColor = hasOffer 
                    ? (offerInfo?.isAutomatic ? '#ff6b35' : '#28a745') 
                    : '#E0E0E0')}
                >
                  {hasOffer && (
                    <div style={{
                      position: 'absolute',
                      top: '-8px',
                      right: '-8px',
                      backgroundColor: offerInfo?.isAutomatic ? '#ff6b35' : '#28a745',
                      color: 'white',
                      borderRadius: '50%',
                      width: '24px',
                      height: '24px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontSize: '12px'
                    }}>
                      {offerInfo?.isAutomatic ? <Clock size={12} /> : <Percent size={12} />}
                    </div>
                  )}
                  
                  <h4 style={{ fontSize: '1rem', marginBottom: '0.5rem', fontWeight: 'bold' }}>
                    {product.name}
                  </h4>
                  <p style={{ fontSize: '0.8rem', color: '#666', marginBottom: '0.5rem' }}>
                    {product.brand}
                  </p>
                  
                  {hasOffer && offerInfo && (
                    <div style={{
                      fontSize: '0.75rem',
                      color: offerInfo.isAutomatic ? '#ff6b35' : '#28a745',
                      fontWeight: 'bold',
                      marginBottom: '0.5rem',
                      padding: '2px 6px',
                      backgroundColor: offerInfo.isAutomatic ? '#fff0eb' : '#d4edda',
                      borderRadius: '4px',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '2px'
                    }}>
                      {offerInfo.isAutomatic ? (
                        <>
                          <AlertTriangle size={10} />
                          {`${offerInfo.discount}% OFF - Vence en ${offerInfo.daysUntilExpiry} días`}
                        </>
                      ) : (
                        <>
                          <Tag size={10} />
                          {offerInfo.type === 'descuento'
                            ? `${offerInfo.discount}${offerInfo.discountType === 'percentage' ? '%' : '$'} OFF`
                            : offerInfo.type === 'precio_especial'
                            ? `Precio especial $${offerInfo.discount}`
                            : offerInfo.type.replace('_', ' ').toUpperCase()}
                        </>
                      )}
                    </div>
                  )}
                  
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span style={{ fontWeight: '700', color: '#8B4513', fontSize: '1.1rem' }}>
                      ${product.price.toFixed(2)}
                    </span>
                    <span style={{ fontSize: '0.8rem', color: '#666' }}>
                      Stock: {product.stock}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Carrito de venta */}
        <div className="card">
          <div className="card-header">
            <h3 className="card-title">Carrito de Venta</h3>
          </div>

          {/* Selección de cliente */}
          <div className="form-group">
            <label className="form-label">Cliente (opcional)</label>
            <select 
              className="form-select"
              value={selectedCustomer}
              onChange={(e) => setSelectedCustomer(e.target.value)}
            >
              <option value="">Venta al público</option>
              {customers.map(customer => (
                <option key={customer.id} value={customer.id}>
                  {customer.name}
                </option>
              ))}
            </select>
          </div>

          {/* Items del carrito */}
          <div style={{ maxHeight: '300px', overflowY: 'auto', marginBottom: '1rem' }}>
            {cartItems.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '2rem', color: '#666' }}>
                <ShoppingCart size={48} style={{ marginBottom: '1rem', opacity: 0.5 }} />
                <p>Selecciona productos para agregar al carrito</p>
              </div>
            ) : (
              cartItems.map(item => {
                const isAutomatic = item.offerType === 'automatico';
                return (
                  <div key={item.productId} style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    padding: '1rem',
                    border: item.offerLabel 
                      ? (isAutomatic ? '2px solid #ff6b35' : '2px solid #28a745') 
                      : '1px solid #E0E0E0',
                    borderRadius: '8px',
                    marginBottom: '0.5rem',
                    backgroundColor: item.offerLabel 
                      ? (isAutomatic ? '#fff7f5' : '#f8fff9') 
                      : 'white'
                  }}>
                    <div style={{ flex: 1 }}>
                      <div style={{ fontWeight: '600', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        {item.product.name}
                        {item.offerLabel && (
                          <span style={{
                            fontSize: '0.7rem',
                            backgroundColor: isAutomatic ? '#ff6b35' : '#28a745',
                            color: 'white',
                            padding: '2px 6px',
                            borderRadius: '4px',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '2px'
                          }}>
                            {isAutomatic ? <Clock size={10} /> : <Tag size={10} />}
                            {item.offerLabel}
                          </span>
                        )}
                      </div>
                      <div style={{ fontSize: '0.8rem', color: '#666' }}>
                        Precio original: ${item.product.price.toFixed(2)}
                        {item.offerLabel && item.unitPrice !== item.product.price && (
                          <span style={{ 
                            marginLeft: '0.5rem', 
                            color: isAutomatic ? '#ff6b35' : '#28a745', 
                            fontWeight: 'bold' 
                          }}>
                            → ${item.unitPrice.toFixed(2)} c/u
                          </span>
                        )}
                      </div>
                      {item.discount > 0 && (
                        <div style={{ 
                          fontSize: '0.75rem', 
                          color: isAutomatic ? '#ff6b35' : '#28a745', 
                          fontWeight: 'bold' 
                        }}>
                          {isAutomatic && <AlertTriangle size={12} style={{ marginRight: '2px' }} />}
                          Ahorro total: -${item.discount.toFixed(2)}
                          {isAutomatic && ' (Por vencimiento)'}
                        </div>
                      )}
                    </div>
                    
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                      <button 
                        onClick={() => updateQuantity(item.productId, item.quantity - 1)}
                        style={{ padding: '0.25rem' }}
                        className="btn btn-outline"
                      >
                        <Minus size={16} />
                      </button>
                      <span style={{ 
                        minWidth: '30px', 
                        textAlign: 'center', 
                        fontWeight: '600',
                        padding: '0.25rem 0.5rem'
                      }}>
                        {item.quantity}
                      </span>
                      <button 
                        onClick={() => updateQuantity(item.productId, item.quantity + 1)}
                        style={{ padding: '0.25rem' }}
                        className="btn btn-outline"
                      >
                        <Plus size={16} />
                      </button>
                    </div>
                    
                    <div style={{ 
                      minWidth: '80px', 
                      textAlign: 'right', 
                      fontWeight: '700',
                      fontSize: '1rem'
                    }}>
                      ${item.total.toFixed(2)}
                    </div>
                  </div>
                );
              })
            )}
          </div>

          {/* Total */}
          {cartItems.length > 0 && (
            <>
              <div style={{ borderTop: '2px solid #E0E0E0', paddingTop: '1rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                  <span>Subtotal:</span>
                  <span>${subtotal.toFixed(2)}</span>
                </div>
                {totalDiscounts > 0 && (
                  <div style={{ 
                    display: 'flex', 
                    justifyContent: 'space-between', 
                    marginBottom: '0.5rem', 
                    color: '#28a745',
                    fontWeight: 'bold'
                  }}>
                    <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                      <Tag size={14} />
                      Total ahorrado:
                    </span>
                    <span>-${totalDiscounts.toFixed(2)}</span>
                  </div>
                )}
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                  <span>IVA (16%):</span>
                  <span>${tax.toFixed(2)}</span>
                </div>
                <div style={{ 
                  display: 'flex', 
                  justifyContent: 'space-between', 
                  fontSize: '1.2rem',
                  fontWeight: '700',
                  borderTop: '1px solid #E0E0E0',
                  paddingTop: '0.5rem'
                }}>
                  <span>Total:</span>
                  <span>${total.toFixed(2)}</span>
                </div>
              </div>

              {/* Método de pago */}
              <div className="form-group">
                <label className="form-label">Método de Pago</label>
                <select 
                  className="form-select"
                  value={paymentMethod}
                  onChange={(e) => setPaymentMethod(e.target.value as typeof paymentMethod)}
                >
                  <option value="efectivo">Efectivo</option>
                  <option value="tarjeta">Tarjeta</option>
                  <option value="transferencia">Transferencia</option>
                </select>
              </div>

              {/* Botón de venta */}
              <button 
                onClick={processSale}
                className="btn btn-primary"
                style={{ width: '100%', marginTop: '1rem' }}
              >
                <CreditCard size={20} />
                Procesar Venta - ${total.toFixed(2)}
                {totalDiscounts > 0 && (
                  <span style={{ fontSize: '0.8rem', marginLeft: '0.5rem' }}>
                    (Ahorras ${totalDiscounts.toFixed(2)})
                  </span>
                )}
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default POS;