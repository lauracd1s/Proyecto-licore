import React, { useState } from 'react';
import { CreditCard, Plus, Minus, ShoppingCart, Tag, AlertTriangle } from 'lucide-react';
import type { ProductDisplay, SaleItemDisplay, OfferDisplay, CustomerDisplay } from '../types';

const POS: React.FC = () => {

  // Estado para productos, ofertas y clientes
  const [products, setProducts] = useState<ProductDisplay[]>([]);
  const [offers, setOffers] = useState<OfferDisplay[]>([]);
  const [customers, setCustomers] = useState<CustomerDisplay[]>([]);

  // Cargar productos, ofertas y clientes desde el backend
  React.useEffect(() => {
    const fetchData = async () => {
      try {
        const [productsRes, offersRes, customersRes, caducidadRes] = await Promise.all([
          fetch('http://localhost:3001/api/productos'),
          fetch('http://localhost:3001/api/ofertas'),
          fetch('http://localhost:3001/api/clientes'),
          fetch('http://localhost:3001/api/ofertas-caducidad')
        ]);
        const productsData = await productsRes.json();
        const offersData = await offersRes.json();
        const customersData = await customersRes.json();
        const caducidadData = await caducidadRes.json();

        // Normalizar productos
        const productsNorm: ProductDisplay[] = productsData.map((p: any) => ({
          id: p.id.toString(),
          name: p.producto || p.nombre,
          category: p.categoria || '',
          brand: p.marca || '',
          price: Number(p.precio),
          cost: Number(p.precio_costo_unitario) || 0,
          stock: Number(p.stock) || 0,
          minStock: Number(p.stock_minimo) || 0,
          image: '',
          unidadMedida: '',
          description: p.descripcion || '',
          alcoholContent: p.graduacion_alcoholica || 0,
          volume: p.contenido || 0,
          barcode: p.codigo_barras || '',
          isActive: p.estado === 'activo',
          createdAt: new Date(),
          expirationDate: p.fecha_vencimiento ? p.fecha_vencimiento : undefined
        }));
        setProducts(productsNorm);

        // Normalizar ofertas
        const offersNorm: OfferDisplay[] = offersData.map((o: any) => ({
          id: o.id_oferta?.toString() || o.id?.toString(),
          title: o.nombre || o.title,
          description: o.descripcion || '',
          type: o.tipo_oferta || 'descuento',
          discount: o.descuento_porcentaje || o.discount || 0,
          discountType: o.descuento_porcentaje ? 'percentage' : 'fixed',
          discountValue: o.descuento_porcentaje || o.descuento_valor_fijo || 0,
          productIds: o.aplicaciones?.map((a: any) => a.id_producto?.toString()).filter(Boolean) || [],
          startDate: o.fecha_inicio ? new Date(o.fecha_inicio) : new Date(),
          endDate: o.fecha_fin ? new Date(o.fecha_fin) : new Date(),
          isActive: o.estado === 'activa',
          image: '',
          terms: '',
          conditions: '',
          targetAudience: 'general',
          maxRedemptions: undefined,
          currentRedemptions: 0,
          createdAt: new Date()
        }));

        // Ofertas automáticas por caducidad
        const caducidadOffers: OfferDisplay[] = caducidadData.map((c: any) => ({
          id: `caducidad-${c.id_producto}`,
          title: `Oferta por caducidad - ${c.nombre}`,
          description: `Descuento por vencimiento (${c.descuento_porcentaje}%)`,
          type: 'automatico',
          discount: c.descuento_porcentaje,
          discountType: 'percentage',
          discountValue: c.descuento_porcentaje,
          productIds: [c.id_producto.toString()],
          startDate: new Date(),
          endDate: c.fecha_vencimiento ? new Date(c.fecha_vencimiento) : new Date(),
          isActive: true,
          image: '',
          terms: '',
          conditions: '',
          targetAudience: 'general',
          maxRedemptions: undefined,
          currentRedemptions: 0,
          createdAt: new Date()
        }));

        setOffers([...offersNorm, ...caducidadOffers]);
        setCustomers(customersData.map((c: any) => ({
          id: c.id?.toString(),
          name: c.nombre + (c.apellido ? ' ' + c.apellido : ''),
          email: '',
          phone: '',
          address: '',
          loyaltyPoints: 0,
          totalPurchases: 0,
          membershipLevel: 'bronce',
          isVip: false,
          registrationDate: new Date(),
          createdAt: new Date()
        })));
      } catch (err) {
        setProducts([]);
        setOffers([]);
        setCustomers([]);
      }
    };
    fetchData();
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
      } 
      // Eliminar comparación directa con 'automatico' para evitar error de tipos
      // Usar solo el título para identificar ofertas de caducidad
      else if (offer.title?.includes('caducidad')) {
        // Ofertas por caducidad (detectadas por el título)
        if (offer.discountType === 'percentage') {
          discount = (product.price * offer.discount) / 100;
          unitPrice = product.price - discount;
          offerLabel = `${offer.discount}% OFF por vencimiento`;
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
      total
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

  // Procesar venta: enviar al backend y actualizar stock
  const processSale = async () => {
    if (cartItems.length === 0) return;

    // Construir datos para la API
    const venta = {
      customerId: selectedCustomer || null,
      items: cartItems.map(item => ({
        productId: item.productId,
        quantity: item.quantity,
        unitPrice: item.unitPrice,
        discount: item.discount,
        total: item.total
      })),
      subtotal,
      discount: totalDiscounts,
      tax,
      total,
      paymentMethod,
      status: 'completada',
      completedAt: new Date(),
      cashierId: 'cashier1',
      createdAt: new Date()
    };

    try {
      // Enviar venta al backend (puedes crear un endpoint /api/ventas)
      const res = await fetch('http://localhost:3001/api/ventas', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(venta)
      });
      if (res.ok) {
        // Actualizar productos (recargar desde backend)
        const productsRes = await fetch('http://localhost:3001/api/productos');
        const productsData = await productsRes.json();
        const productsNorm: ProductDisplay[] = productsData.map((p: any) => ({
          id: p.id.toString(),
          name: p.producto || p.nombre,
          category: p.categoria || '',
          brand: p.marca || '',
          price: Number(p.precio),
          cost: Number(p.precio_costo_unitario) || 0,
          stock: Number(p.stock) || 0,
          minStock: Number(p.stock_minimo) || 0,
          image: '',
          unidadMedida: '',
          description: p.descripcion || '',
          alcoholContent: p.graduacion_alcoholica || 0,
          volume: p.contenido || 0,
          barcode: p.codigo_barras || '',
          isActive: p.estado === 'activo',
          createdAt: new Date(),
          expirationDate: p.fecha_vencimiento ? p.fecha_vencimiento : undefined
        }));
        setProducts(productsNorm);
        setCartItems([]);
        setSelectedCustomer('');
        alert('Venta procesada exitosamente');
      } else {
        alert('Error al procesar la venta');
      }
    } catch (err) {
      alert('Error de conexión al procesar la venta');
    }
  };

  // Función para verificar si un producto tiene oferta activa (para mostrar en la lista)
  const hasActiveOffer = (productId: string) => {
    return !!getActiveOfferForProduct(productId);
  };

  // Función para verificar si la oferta es de caducidad
  const getOfferDisplayInfo = (productId: string) => {
    const offer = getActiveOfferForProduct(productId);
    if (!offer) return null;
    return {
      ...offer,
      isCaducidad: offer.title?.includes('caducidad') || false
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
                      ? (offerInfo?.isCaducidad ? '2px solid #ff6b35' : '2px solid #28a745') 
                      : '2px solid #E0E0E0',
                    borderRadius: '8px',
                    cursor: 'pointer',
                    transition: 'all 0.2s ease',
                    position: 'relative',
                    backgroundColor: hasOffer 
                      ? (offerInfo?.isCaducidad ? '#fff7f5' : '#f8fff9') 
                      : 'white'
                  }}
                  onMouseOver={e => (e.currentTarget.style.borderColor = hasOffer 
                    ? (offerInfo?.isCaducidad ? '#e55722' : '#1e7e34') 
                    : '#8B4513')}
                  onMouseOut={e => (e.currentTarget.style.borderColor = hasOffer 
                    ? (offerInfo?.isCaducidad ? '#ff6b35' : '#28a745') 
                    : '#E0E0E0')}
                >
                  {/* Badge visual de oferta */}
                  {hasOffer && offerInfo && (
                    <div style={{
                      position: 'absolute',
                      top: '8px',
                      left: '8px',
                      backgroundColor: offerInfo.isCaducidad ? '#ff6b35' : '#28a745',
                      color: 'white',
                      borderRadius: '12px',
                      padding: '2px 10px',
                      fontWeight: 'bold',
                      fontSize: '0.8rem',
                      zIndex: 2,
                      boxShadow: '0 2px 8px rgba(0,0,0,0.08)'
                    }}>
                      {offerInfo.isCaducidad ? (
                        <>
                          <AlertTriangle size={10} style={{ marginRight: '2px' }} />
                          {`${offerInfo.discount}% OFF por vencimiento`}
                        </>
                      ) : (
                        <>
                          <Tag size={10} style={{ marginRight: '2px' }} />
                          {offerInfo.type === 'descuento'
                            ? `${offerInfo.discount}${offerInfo.discountType === 'percentage' ? '%' : '$'} OFF`
                            : offerInfo.type === 'precio_especial'
                            ? `Precio especial $${offerInfo.discount}`
                            : offerInfo.type.replace('_', ' ').toUpperCase()}
                        </>
                      )}
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
                      color: offerInfo.isCaducidad ? '#ff6b35' : '#28a745',
                      fontWeight: 'bold',
                      marginBottom: '0.5rem',
                      padding: '2px 6px',
                      backgroundColor: offerInfo.isCaducidad ? '#fff0eb' : '#d4edda',
                      borderRadius: '4px',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '2px'
                    }}>
                      {offerInfo.isCaducidad ? (
                        <>
                          <AlertTriangle size={10} />
                          {`${offerInfo.discount}% OFF por vencimiento`}
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
                const isCaducidad = item.offerLabel?.includes('vencimiento');
                return (
                  <div key={item.productId} style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    padding: '1rem',
                    border: item.offerLabel 
                      ? (isCaducidad ? '2px solid #ff6b35' : '2px solid #28a745') 
                      : '1px solid #E0E0E0',
                    borderRadius: '8px',
                    marginBottom: '0.5rem',
                    backgroundColor: item.offerLabel 
                      ? (isCaducidad ? '#fff7f5' : '#f8fff9') 
                      : 'white'
                  }}>
                    <div style={{ flex: 1 }}>
                      <div style={{ fontWeight: '600', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        {item.product.name}
                        {item.offerLabel && (
                          <span style={{
                            fontSize: '0.7rem',
                            backgroundColor: isCaducidad ? '#ff6b35' : '#28a745',
                            color: 'white',
                            padding: '2px 8px',
                            borderRadius: '12px',
                            fontWeight: 'bold',
                            marginLeft: '0.5rem',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '2px'
                          }}>
                            {isCaducidad ? (
                              <>
                                <AlertTriangle size={12} />
                                {item.offerLabel}
                              </>
                            ) : (
                              <>
                                <Tag size={12} />
                                {item.offerLabel}
                              </>
                            )}
                          </span>
                        )}
                      </div>
                      <div style={{ fontSize: '0.8rem', color: '#666' }}>
                        Precio original: ${item.product.price.toFixed(2)}
                        {item.offerLabel && item.unitPrice !== item.product.price && (
                          <span style={{ 
                            marginLeft: '0.5rem', 
                            color: isCaducidad ? '#ff6b35' : '#28a745', 
                            fontWeight: 'bold' 
                          }}>
                            → ${item.unitPrice.toFixed(2)} c/u
                          </span>
                        )}
                      </div>
                      {item.discount > 0 && (
                        <div style={{ 
                          fontSize: '0.75rem', 
                          color: isCaducidad ? '#ff6b35' : '#28a745', 
                          fontWeight: 'bold' 
                        }}>
                          {isCaducidad && <AlertTriangle size={12} style={{ marginRight: '2px' }} />}
                          Ahorro total: -${item.discount.toFixed(2)}
                          {isCaducidad && ' (Por vencimiento)'}
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