# 🎯 Lógica del Punto de Venta (POS) para Descuentos de Ofertas

## 📋 **Resumen Ejecutivo**

El sistema de POS con ofertas implementa una lógica completa y automatizada para:
1. **Validar ofertas activas** en tiempo real
2. **Verificar elegibilidad** de clientes para ofertas específicas
3. **Calcular descuentos** según diferentes tipos de ofertas
4. **Aplicar automáticamente** las mejores ofertas disponibles
5. **Procesar ventas** con todos los descuentos incluidos

---

## 🔍 **1. Validación de Ofertas Activas**

```typescript
const isOfferActive = (offer: OfferDisplay): boolean => {
  const now = new Date();
  return (
    offer.isActive &&                    // Oferta marcada como activa
    offer.startDate <= now &&            // Ya comenzó
    offer.endDate >= now &&              // No ha terminado
    (offer.maxRedemptions === undefined || // Sin límite o
     offer.currentRedemptions < offer.maxRedemptions) // Aún tiene usos
  );
};
```

**Criterios de Validación:**
- ✅ Estado activo (`isActive: true`)
- ✅ Dentro del rango de fechas válidas
- ✅ No ha alcanzado el límite máximo de redenciones

---

## 👤 **2. Elegibilidad de Clientes**

```typescript
const isCustomerEligible = (offer: OfferDisplay, customer: CustomerDisplay | null): boolean => {
  if (offer.targetAudience === 'general') return true;
  if (!customer) return false;

  switch (offer.targetAudience) {
    case 'premium':  return customer.membershipLevel === 'premium';
    case 'loyalty':  return customer.membershipLevel !== 'bronce' || customer.loyaltyPoints > 500;
    case 'new':      return daysSinceRegistration <= 30;
    default:         return true;
  }
};
```

**Tipos de Audiencia:**
- **General**: Todos los clientes (con o sin registro)
- **Premium**: Solo clientes nivel premium
- **Loyalty**: Clientes con nivel plata/oro/premium o +500 puntos
- **New**: Clientes registrados hace menos de 30 días

---

## 💰 **3. Tipos de Ofertas y Cálculos**

### **3.1 Descuento Directo**
```typescript
case 'descuento':
  discountAmount = applicableItems.reduce((total, item) => {
    const itemDiscount = offer.discountType === 'percentage' 
      ? (item.total * offer.discountValue / 100)      // 20% descuento
      : (offer.discountValue * item.quantity);        // $5 descuento por unidad
    return total + itemDiscount;
  }, 0);
```

### **3.2 Ofertas 2x1**
```typescript
case '2x1':
  applicableItems.forEach(item => {
    const freeItems = Math.floor(item.quantity / 2);  // Por cada 2, 1 gratis
    discountAmount += freeItems * item.unitPrice;     // Precio del item gratis
  });
```

### **3.3 Ofertas 3x2**
```typescript
case '3x2':
  applicableItems.forEach(item => {
    const freeItems = Math.floor(item.quantity / 3);  // Por cada 3, 1 gratis
    discountAmount += freeItems * item.unitPrice;
  });
```

### **3.4 Combos**
```typescript
case 'combo':
  const hasAllComboProducts = offer.productIds.every(productId =>
    items.some(item => item.productId === productId)
  );
  if (hasAllComboProducts) {
    const comboTotal = applicableItems.reduce((sum, item) => sum + item.total, 0);
    discountAmount = offer.discountType === 'percentage'
      ? comboTotal * offer.discountValue / 100
      : offer.discountValue;
  }
```

### **3.5 Precio Especial**
```typescript
case 'precio_especial':
  applicableItems.forEach(item => {
    const specialPrice = offer.discountValue;
    if (specialPrice < item.unitPrice) {
      discountAmount += (item.unitPrice - specialPrice) * item.quantity;
    }
  });
```

---

## 🚀 **4. Aplicación Automática de Ofertas**

### **4.1 Detección Automática**
```typescript
useEffect(() => {
  const activeOffers = offers.filter(offer => isOfferActive(offer));
  const newAppliedOffers: AppliedOffer[] = [];
  
  activeOffers.forEach(offer => {
    const appliedOffer = calculateOfferDiscount(offer, cartItems);
    if (appliedOffer && !alreadyApplied) {
      newAppliedOffers.push(appliedOffer);
    }
  });

  setAppliedOffers(newAppliedOffers);
}, [cartItems, offers, selectedCustomer]);
```

**Proceso:**
1. **Filtrar ofertas activas** en tiempo real
2. **Evaluar cada oferta** contra el carrito actual
3. **Evitar duplicados** de la misma oferta
4. **Actualizar automáticamente** cuando cambia el carrito

---

## 💵 **5. Cálculos Financieros Finales**

### **5.1 Estructura de Cálculo**
```typescript
const subtotal = cartItems.reduce((sum, item) => sum + item.total, 0);
const totalDiscount = appliedOffers.reduce((sum, offer) => sum + offer.discountAmount, 0);
const subtotalWithDiscount = subtotal - totalDiscount;
const tax = subtotalWithDiscount * 0.16;  // IVA sobre precio con descuento
const vipDiscount = selectedCustomer?.isVip ? subtotalWithDiscount * 0.05 : 0;
const finalTotal = subtotalWithDiscount + tax - vipDiscount;
```

### **5.2 Orden de Aplicación**
1. **Subtotal original** de todos los productos
2. **Descuentos por ofertas** aplicados
3. **Cálculo de IVA** sobre subtotal con descuentos
4. **Descuento VIP adicional** (5% para clientes VIP)
5. **Total final** de la venta

---

## 📊 **6. Casos de Uso Prácticos**

### **Ejemplo 1: Cliente Premium con Combo**
```
Cliente: Roberto Silva (Premium, VIP)
Productos: 1 Whisky ($65.99) + 1 Vodka ($28.99)
Oferta: Combo 15% descuento comprando ambos

Cálculo:
- Subtotal: $94.98
- Descuento combo: $14.25 (15%)
- Subtotal con descuento: $80.73
- IVA (16%): $12.92
- Descuento VIP (5%): $4.04
- Total final: $89.61

Ahorro total: $18.29
```

### **Ejemplo 2: Oferta 2x1 en Cervezas**
```
Cliente: Venta al público
Productos: 6 Cervezas Corona ($2.50 c/u)
Oferta: 2x1 en cervezas

Cálculo:
- Subtotal: $15.00 (6 × $2.50)
- Descuento 2x1: $7.50 (3 gratis)
- Subtotal con descuento: $7.50
- IVA (16%): $1.20
- Total final: $8.70

Ahorro total: $7.50
```

---

## 🛡️ **7. Validaciones y Control**

### **7.1 Validaciones de Negocio**
- ✅ **Stock disponible** antes de agregar al carrito
- ✅ **Productos activos** solamente
- ✅ **Ofertas vigentes** por fecha y límites
- ✅ **Elegibilidad del cliente** según tipo de oferta

### **7.2 Control de Redenciones**
```typescript
appliedOffers.forEach(appliedOffer => {
  // Actualizar contador de redenciones
  console.log(`Oferta ${appliedOffer.offer.title} aplicada. 
              Redenciones: ${appliedOffer.offer.currentRedemptions + 1}`);
});
```

### **7.3 Registro de Auditoría**
- **Ofertas aplicadas** por venta
- **Descuentos otorgados** por tipo
- **Puntos de lealtad** generados
- **Comisiones** por cajero

---

## 🎯 **8. Beneficios del Sistema**

### **Para el Negocio:**
- 🚀 **Incremento en ventas** por ofertas automáticas
- 📈 **Mayor ticket promedio** con combos
- 🎯 **Marketing dirigido** por tipo de cliente
- 📊 **Analytics detallados** de efectividad

### **Para los Clientes:**
- 💰 **Descuentos automáticos** sin códigos
- ⭐ **Reconocimiento VIP** con beneficios adicionales
- 🎁 **Ofertas personalizadas** según historial
- 🔄 **Puntos de lealtad** acumulativos

### **Para los Cajeros:**
- 🖥️ **Interface intuitiva** con ofertas destacadas
- ⚡ **Aplicación automática** sin intervención manual
- 📋 **Información clara** de descuentos aplicados
- ✅ **Proceso de venta simplificado**

---

## 🚀 **Conclusión**

Este sistema de POS con ofertas proporciona una solución completa y automatizada que:

1. **Maximiza las ventas** aplicando automáticamente las mejores ofertas
2. **Mejora la experiencia del cliente** con descuentos transparentes
3. **Simplifica el trabajo del cajero** con validación automática
4. **Proporciona control total** sobre las promociones y su impacto

La lógica implementada es robusta, escalable y permite una gestión sofisticada de ofertas promocionales en tiempo real.

---

*💡 **Nota Técnica**: El sistema está diseñado para ser extensible, permitiendo agregar nuevos tipos de ofertas y condiciones de elegibilidad según las necesidades específicas del negocio.*
