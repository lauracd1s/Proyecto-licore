import React, { useState, useEffect } from 'react';
import { CreditCard, Plus, Minus, ShoppingCart, Tag, Gift, Percent } from 'lucide-react';
import { useApp } from '../context/AppContext';
import type { ProductDisplay, SaleItemDisplay, OfferDisplay, CustomerDisplay } from '../types';

interface AppliedOffer {
  offerId: string;
  offer: OfferDisplay;
  applicableItems: string[]; // IDs de productos aplicables
  discountAmount: number;
  description: string;
}

const EnhancedPOS: React.FC = () => {
  const { products, customers, offers, addSaleDisplay } = useApp();
  const [cartItems, setCartItems] = useState<SaleItemDisplay[]>([]);
  const [selectedCustomer, setSelectedCustomer] = useState<CustomerDisplay | null>(null);
  const [paymentMethod, setPaymentMethod] = useState<'efectivo' | 'tarjeta' | 'transferencia'>('efectivo');
  const [appliedOffers, setAppliedOffers] = useState<AppliedOffer[]>([]);
  const [availableOffers, setAvailableOffers] = useState<OfferDisplay[]>([]);

  // ======================================
  // 1. VALIDACIÓN DE OFERTAS ACTIVAS
  // ======================================
  const isOfferActive = (offer: OfferDisplay): boolean => {
    const now = new Date();
    return (
      offer.isActive &&
      offer.startDate <= now &&
      offer.endDate >= now &&
      (offer.maxRedemptions === undefined || offer.currentRedemptions < offer.maxRedemptions)
    );
  };

  // ======================================
  // 2. ELEGIBILIDAD DE CLIENTE PARA OFERTAS
  // ======================================
  const isCustomerEligible = (offer: OfferDisplay, customer: CustomerDisplay | null): boolean => {
    if (offer.targetAudience === 'general') return true;
    if (!customer) return false; // Solo ofertas generales si no hay cliente

    switch (offer.targetAudience) {
      case 'premium':
        return customer.membershipLevel === 'premium';
      case 'loyalty':
        return customer.membershipLevel !== 'bronce' || customer.loyaltyPoints > 500;
      case 'new':
        const daysSinceRegistration = (new Date().getTime() - customer.registrationDate.getTime()) / (1000 * 60 * 60 * 24);
        return daysSinceRegistration <= 30;
      default:
        return true;
    }
  };

  // ======================================
  // 3. CÁLCULO DE DESCUENTOS POR TIPO DE OFERTA
  // ======================================
  const calculateOfferDiscount = (offer: OfferDisplay, items: SaleItemDisplay[]): AppliedOffer | null => {
    const applicableItems = items.filter(item => 
      offer.productIds.includes(item.productId)
    );

    if (applicableItems.length === 0) return null;
    if (!isCustomerEligible(offer, selectedCustomer)) return null;

    let discountAmount = 0;
    let description = '';

    switch (offer.type) {
      case 'descuento':
        // Descuento directo
        discountAmount = applicableItems.reduce((total, item) => {
          const itemDiscount = offer.discountType === 'percentage' 
            ? (item.total * offer.discountValue / 100)
            : (offer.discountValue * item.quantity);
          return total + itemDiscount;
        }, 0);
        description = `${offer.discountValue}${offer.discountType === 'percentage' ? '%' : '$'} de descuento en productos seleccionados`;
        break;

      case '2x1':
        // Por cada 2 productos, 1 gratis
        applicableItems.forEach(item => {
          const freeItems = Math.floor(item.quantity / 2);
          discountAmount += freeItems * item.unitPrice;
        });
        description = '2x1 - Por cada 2 productos, lleva 1 gratis';
        break;

      case '3x2':
        // Por cada 3 productos, 1 gratis  
        applicableItems.forEach(item => {
          const freeItems = Math.floor(item.quantity / 3);
          discountAmount += freeItems * item.unitPrice;
        });
        description = '3x2 - Por cada 3 productos, lleva 2 y paga 1 gratis';
        break;

      case 'combo':
        // Descuento cuando se compran todos los productos del combo
        const hasAllComboProducts = offer.productIds.every(productId =>
          items.some(item => item.productId === productId)
        );
        if (hasAllComboProducts) {
          const comboTotal = applicableItems.reduce((sum, item) => sum + item.total, 0);
          discountAmount = offer.discountType === 'percentage'
            ? comboTotal * offer.discountValue / 100
            : offer.discountValue;
          description = `Combo especial - ${offer.discountValue}${offer.discountType === 'percentage' ? '% descuento' : '$ descuento'} comprando todos los productos`;
        }
        break;

      case 'precio_especial':
        // Precio fijo especial para productos seleccionados
        applicableItems.forEach(item => {
          const specialPrice = offer.discountValue;
          if (specialPrice < item.unitPrice) {
            discountAmount += (item.unitPrice - specialPrice) * item.quantity;
          }
        });
        description = `Precio especial $${offer.discountValue} en productos seleccionados`;
        break;
    }

    if (discountAmount > 0) {
      return {
        offerId: offer.id,
        offer,
        applicableItems: applicableItems.map(item => item.productId),
        discountAmount,
        description
      };
    }

    return null;
  };

  // ======================================
  // 4. APLICACIÓN AUTOMÁTICA DE OFERTAS
  // ======================================
  useEffect(() => {
    const activeOffers = offers.filter(offer => isOfferActive(offer));
    setAvailableOffers(activeOffers);

    // Calcular ofertas aplicables automáticamente
    const newAppliedOffers: AppliedOffer[] = [];
    
    activeOffers.forEach(offer => {
      const appliedOffer = calculateOfferDiscount(offer, cartItems);
      if (appliedOffer) {
        // Evitar ofertas duplicadas
        const alreadyApplied = newAppliedOffers.some(ao => ao.offerId === offer.id);
        if (!alreadyApplied) {
          newAppliedOffers.push(appliedOffer);
        }
      }
    });

    setAppliedOffers(newAppliedOffers);
  }, [cartItems, offers, selectedCustomer]);

  // ======================================
  // 5. FUNCIONES DEL CARRITO CON OFERTAS
  // ======================================
  const addProductToCart = (product: ProductDisplay) => {
    const existingItem = cartItems.find(item => item.productId === product.id);
    
    if (existingItem) {
      setCartItems(prev => 
        prev.map(item => 
          item.productId === product.id 
            ? { ...item, quantity: item.quantity + 1, total: (item.quantity + 1) * product.price }
            : item
        )
      );
    } else {
      const newItem: SaleItemDisplay = {
        productId: product.id,
        product,
        quantity: 1,
        unitPrice: product.price,
        discount: 0,
        total: product.price
      };
      setCartItems(prev => [...prev, newItem]);
    }
  };

  const updateQuantity = (productId: string, newQuantity: number) => {
    if (newQuantity <= 0) {
      setCartItems(prev => prev.filter(item => item.productId !== productId));
    } else {
      setCartItems(prev => 
        prev.map(item => 
          item.productId === productId 
            ? { ...item, quantity: newQuantity, total: newQuantity * item.unitPrice }
            : item
        )
      );
    }
  };

  // ======================================
  // 6. CÁLCULOS FINALES CON DESCUENTOS
  // ======================================
  const subtotal = cartItems.reduce((sum, item) => sum + item.total, 0);
  const totalDiscount = appliedOffers.reduce((sum, offer) => sum + offer.discountAmount, 0);
  const subtotalWithDiscount = subtotal - totalDiscount;
  const tax = subtotalWithDiscount * 0.16; // 16% IVA sobre subtotal con descuento
  const total = subtotalWithDiscount + tax;

  // Aplicar descuentos VIP adicionales
  const vipDiscount = selectedCustomer?.isVip ? subtotalWithDiscount * 0.05 : 0; // 5% adicional para VIP
  const finalTotal = total - vipDiscount;

  // ======================================
  // 7. PROCESAMIENTO DE VENTA FINAL
  // ======================================
  const processSale = () => {
    if (cartItems.length === 0) return;

    // Actualizar items del carrito con descuentos aplicados
    const itemsWithDiscounts = cartItems.map(item => {
      const itemDiscounts = appliedOffers.filter(offer => 
        offer.applicableItems.includes(item.productId)
      );
      const itemDiscountAmount = itemDiscounts.reduce((sum, offer) => {
        // Proporcionar descuento según la cantidad del item
        const itemProportion = item.total / subtotal;
        return sum + (offer.discountAmount * itemProportion);
      }, 0);

      return {
        ...item,
        discount: itemDiscountAmount,
        total: item.total - itemDiscountAmount
      };
    });

    const saleData = {
      customerId: selectedCustomer?.id,
      items: itemsWithDiscounts,
      subtotal,
      discount: totalDiscount + vipDiscount,
      tax,
      total: finalTotal,
      paymentMethod,
      status: 'completada' as const,
      completedAt: new Date(),
      cashierId: 'cashier1',
      appliedOffers: appliedOffers.map(ao => ao.offerId), // Registro de ofertas aplicadas
      loyaltyPointsEarned: selectedCustomer ? Math.floor(finalTotal * 0.1) : 0 // 10% en puntos
    };

    addSaleDisplay(saleData);
    
    // Actualizar redenciones de ofertas
    appliedOffers.forEach(appliedOffer => {
      // Aquí actualizarías el contador de redenciones en la base de datos
      console.log(`Oferta ${appliedOffer.offer.title} aplicada. Redenciones: ${appliedOffer.offer.currentRedemptions + 1}`);
    });

    setCartItems([]);
    setSelectedCustomer(null);
    setAppliedOffers([]);
    alert(`Venta procesada exitosamente. Total: $${finalTotal.toFixed(2)}`);
  };

  return (
    <div className="enhanced-pos">
      <div className="page-header">
        <h1 className="page-title">
          <CreditCard size={28} />
          Punto de Venta (POS) con Ofertas
        </h1>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 450px', gap: '2rem' }}>
        {/* Productos disponibles con ofertas destacadas */}
        <div className="card">
          <div className="card-header">
            <h3 className="card-title">Productos Disponibles</h3>
            {availableOffers.length > 0 && (
              <div style={{ display: 'flex', gap: '0.5rem' }}>
                <Tag size={16} />
                <span style={{ fontSize: '0.9rem', color: '#D4AA7D' }}>
                  {availableOffers.length} ofertas activas
                </span>
              </div>
            )}
          </div>
          
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: '1rem' }}>
            {products.filter(p => p.stock > 0 && p.isActive).map(product => {
              const hasOffer = availableOffers.some(offer => offer.productIds.includes(product.id));
              return (
                <div 
                  key={product.id} 
                  onClick={() => addProductToCart(product)}
                  style={{
                    padding: '1rem',
                    border: hasOffer ? '2px solid #D4AA7D' : '2px solid #E0E0E0',
                    borderRadius: '8px',
                    cursor: 'pointer',
                    transition: 'all 0.2s ease',
                    position: 'relative',
                    backgroundColor: hasOffer ? '#FFF9F0' : 'white'
                  }}
                  onMouseOver={(e) => e.currentTarget.style.borderColor = '#272727'}
                  onMouseOut={(e) => e.currentTarget.style.borderColor = hasOffer ? '#D4AA7D' : '#E0E0E0'}
                >
                  {hasOffer && (
                    <div style={{
                      position: 'absolute',
                      top: '0.5rem',
                      right: '0.5rem',
                      backgroundColor: '#D4AA7D',
                      color: 'white',
                      padding: '0.25rem 0.5rem',
                      borderRadius: '4px',
                      fontSize: '0.7rem',
                      fontWeight: '600'
                    }}>
                      OFERTA
                    </div>
                  )}
                  <h4 style={{ fontSize: '1rem', marginBottom: '0.5rem' }}>{product.name}</h4>
                  <p style={{ fontSize: '0.8rem', color: '#666', marginBottom: '0.5rem' }}>
                    {product.brand}
                  </p>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span style={{ fontWeight: '700', color: '#272727' }}>${product.price}</span>
                    <span style={{ fontSize: '0.8rem', color: '#666' }}>Stock: {product.stock}</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Carrito de venta con ofertas */}
        <div className="card">
          <div className="card-header">
            <h3 className="card-title">Carrito de Venta</h3>
          </div>

          {/* Selección de cliente */}
          <div className="form-group">
            <label className="form-label">Cliente (opcional)</label>
            <select 
              className="form-select"
              value={selectedCustomer?.id || ''}
              onChange={(e) => {
                const customer = customers.find(c => c.id === e.target.value);
                setSelectedCustomer(customer || null);
              }}
            >
              <option value="">Venta al público</option>
              {customers.map(customer => (
                <option key={customer.id} value={customer.id}>
                  {customer.name} {customer.isVip && '⭐'}
                </option>
              ))}
            </select>
            {selectedCustomer?.isVip && (
              <small style={{ color: '#D4AA7D', fontSize: '0.8rem' }}>
                Cliente VIP - 5% descuento adicional aplicado
              </small>
            )}
          </div>

          {/* Ofertas disponibles */}
          {availableOffers.length > 0 && (
            <div style={{ 
              marginBottom: '1rem', 
              padding: '1rem', 
              backgroundColor: '#F0F8FF', 
              borderRadius: '8px',
              border: '1px solid #D4AA7D'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem' }}>
                <Gift size={16} color="#D4AA7D" />
                <span style={{ fontWeight: '600', color: '#272727' }}>Ofertas Disponibles</span>
              </div>
              {availableOffers.map(offer => (
                <div key={offer.id} style={{ fontSize: '0.8rem', color: '#666', marginBottom: '0.25rem' }}>
                  • {offer.title}
                </div>
              ))}
            </div>
          )}

          {/* Items del carrito */}
          <div style={{ maxHeight: '250px', overflowY: 'auto', marginBottom: '1rem' }}>
            {cartItems.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '2rem', color: '#666' }}>
                <ShoppingCart size={48} />
                <p>Selecciona productos para agregar al carrito</p>
              </div>
            ) : (
              cartItems.map(item => (
                <div key={item.productId} style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  padding: '1rem',
                  border: '1px solid #E0E0E0',
                  borderRadius: '8px',
                  marginBottom: '0.5rem'
                }}>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontWeight: '600' }}>{item.product.name}</div>
                    <div style={{ fontSize: '0.8rem', color: '#666' }}>
                      ${item.unitPrice} c/u
                    </div>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <button 
                      onClick={() => updateQuantity(item.productId, item.quantity - 1)}
                      className="btn btn-outline btn-sm"
                    >
                      <Minus size={16} />
                    </button>
                    <span style={{ minWidth: '30px', textAlign: 'center', fontWeight: '600' }}>
                      {item.quantity}
                    </span>
                    <button 
                      onClick={() => updateQuantity(item.productId, item.quantity + 1)}
                      className="btn btn-outline btn-sm"
                    >
                      <Plus size={16} />
                    </button>
                  </div>
                  <div style={{ minWidth: '80px', textAlign: 'right', fontWeight: '700' }}>
                    ${item.total.toFixed(2)}
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Ofertas aplicadas */}
          {appliedOffers.length > 0 && (
            <div style={{
              marginBottom: '1rem',
              padding: '1rem',
              backgroundColor: '#F0FFF0',
              borderRadius: '8px',
              border: '1px solid #28a745'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem' }}>
                <Percent size={16} color="#28a745" />
                <span style={{ fontWeight: '600', color: '#28a745' }}>Descuentos Aplicados</span>
              </div>
              {appliedOffers.map(appliedOffer => (
                <div key={appliedOffer.offerId} style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  fontSize: '0.8rem',
                  marginBottom: '0.25rem'
                }}>
                  <span>{appliedOffer.description}</span>
                  <span style={{ fontWeight: '600', color: '#28a745' }}>
                    -${appliedOffer.discountAmount.toFixed(2)}
                  </span>
                </div>
              ))}
            </div>
          )}

          {/* Total */}
          {cartItems.length > 0 && (
            <>
              <div style={{ borderTop: '1px solid #E0E0E0', paddingTop: '1rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                  <span>Subtotal:</span>
                  <span>${subtotal.toFixed(2)}</span>
                </div>
                {totalDiscount > 0 && (
                  <div style={{ 
                    display: 'flex', 
                    justifyContent: 'space-between', 
                    marginBottom: '0.5rem',
                    color: '#28a745',
                    fontWeight: '600'
                  }}>
                    <span>Descuentos por ofertas:</span>
                    <span>-${totalDiscount.toFixed(2)}</span>
                  </div>
                )}
                {vipDiscount > 0 && (
                  <div style={{ 
                    display: 'flex', 
                    justifyContent: 'space-between', 
                    marginBottom: '0.5rem',
                    color: '#D4AA7D',
                    fontWeight: '600'
                  }}>
                    <span>Descuento VIP (5%):</span>
                    <span>-${vipDiscount.toFixed(2)}</span>
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
                  paddingTop: '0.5rem',
                  color: '#272727'
                }}>
                  <span>Total:</span>
                  <span>${finalTotal.toFixed(2)}</span>
                </div>
                {(totalDiscount + vipDiscount) > 0 && (
                  <div style={{ fontSize: '0.8rem', color: '#28a745', textAlign: 'right' }}>
                    Ahorras: ${(totalDiscount + vipDiscount).toFixed(2)}
                  </div>
                )}
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
                Procesar Venta - ${finalTotal.toFixed(2)}
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default EnhancedPOS;
