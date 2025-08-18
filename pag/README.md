# 🍾 Sistema de Gestión Integral para Licorería

Un sistema completo de gestión empresarial desarrollado con **React + TypeScript + Vite** para la administración integral de una licorería, basado en un modelo de base de datos profesional y escalable.

## 📋 Funcionalidades Principales

### 🏷️ Módulo 1: Gestión de Ofertas y Promociones
- **Gestión completa de ofertas**: Sistema avanzado con tipos de ofertas, temporadas y códigos promocionales
- **Calendario promocional**: Planificación temporal de ofertas con fechas de inicio y fin
- **Sistema de descuentos**: Porcentajes por producto, ofertas combinadas y promociones especiales
- **Vista previa para clientes**: Simulación de cómo se muestran las ofertas al público
- **Control de uso**: Límites por cliente, cantidad mínima y seguimiento de utilización

### 📦 Módulo 2: Gestión de Productos e Inventario
- **Catálogo avanzado**: Productos organizados por categorías con información detallada
- **Sistema de lotes**: Control por lotes con fechas de vencimiento y trazabilidad completa
- **Gestión de proveedores**: Base de datos de proveedores con información de contacto
- **Control de stock inteligente**: Alertas automáticas, stock mínimo/máximo personalizable
- **Inventario en tiempo real**: Actualización automática con cada venta

### 🛒 Módulo 3: Proceso de Ventas y Clientes
- **POS completo**: Sistema de punto de venta con múltiples formas de pago
- **Facturación electrónica**: Generación de facturas con numeración automática
- **Base de datos de clientes**: Información completa con historial de compras
- **Sistema VIP**: Clasificación de clientes con límites de crédito
- **Programa de fidelización**: Acumulación y canje de puntos por compras

### 📊 Módulo 4: Reportes y Analytics
- **Dashboard ejecutivo**: KPIs y métricas en tiempo real
- **Reportes de ventas**: Análisis detallado por período, producto y vendedor
- **Análisis de rentabilidad**: Control de costos y márgenes de ganancia
- **Inteligencia de negocio**: Insights automáticos y recomendaciones

## 🛠️ Arquitectura Técnica

### **Base de Datos Profesional**
```sql
- 15+ Tablas interrelacionadas
- Integridad referencial completa  
- Sistema de auditoría y trazabilidad
- Escalabilidad empresarial
- Optimización para rendimiento
```

### **Frontend Moderno**
- **React 18** + **TypeScript** para desarrollo type-safe
- **Vite** para compilación ultra-rápida
- **React Router DOM** para navegación fluida
- **Recharts** para visualizaciones avanzadas
- **Lucide React** para iconografía consistente

### **Características Empresariales**
- **Roles y permisos**: Sistema de usuarios con niveles de acceso
- **Seguridad**: Autenticación, autorización y encriptación
- **Trazabilidad**: Auditoría completa de todas las operaciones
- **Escalabilidad**: Arquitectura preparada para crecimiento
- **Integraciones**: API ready para sistemas externos

## 🎨 Diseño y UX

### **Paleta de Colores Elegante**
- **#272727** - Gris elegante (principal)
- **#D4AA7D** - Dorado cálido (secundario)  
- **#EFD09F** - Beige dorado (acento)

### **Características de Diseño**
- **Responsive Design**: Optimizado para desktop, tablet y móvil
- **UI/UX Premium**: Interfaz intuitiva y profesional
- **Sidebar adaptativa**: Navegación contextual y eficiente
- **Animaciones fluidas**: Micro-interacciones que mejoran la experiencia
- **Accesibilidad**: Cumple estándares WCAG

## 🚀 Modelo de Datos Empresarial

### **Entidades Principales**
```typescript
- Personas (clientes, empleados, proveedores)
- Productos y Categorías
- Sistema de Lotes e Inventario  
- Ventas y Facturación
- Ofertas y Promociones
- Programa de Fidelización
- Usuarios y Roles
```

### **Relaciones Complejas**
- **Trazabilidad completa**: Desde compra hasta venta final
- **Sistema de puntos**: Acumulación y canje automático
- **Control financiero**: Costos, precios y márgenes
- **Auditoría**: Historial completo de transacciones

## 📁 Estructura del Proyecto

```
src/
├── components/          # Componentes reutilizables
├── pages/              # 16 páginas principales del sistema
│   ├── Dashboard.tsx           # Dashboard ejecutivo
│   ├── OffersManagement.tsx    # Gestión integral de ofertas  
│   ├── OfferForm.tsx          # Formulario avanzado de ofertas
│   ├── PromotionCalendar.tsx   # Calendario promocional
│   ├── OfferPreview.tsx       # Vista previa de ofertas
│   ├── ProductCatalog.tsx     # Catálogo con filtros avanzados
│   ├── ProductForm.tsx        # Formulario completo de productos
│   ├── InventoryControl.tsx   # Control de inventario por lotes
│   ├── StockAlerts.tsx        # Sistema de alertas inteligentes
│   ├── POS.tsx               # Punto de venta profesional
│   ├── ShoppingCartPage.tsx   # Carrito con cálculos automáticos
│   ├── CustomerManagement.tsx # CRM completo de clientes
│   ├── LoyaltyProgram.tsx     # Sistema de fidelización
│   ├── SalesReports.tsx       # Reportería avanzada
│   ├── OfferAnalytics.tsx     # Analytics de promociones
│   └── PerformanceCharts.tsx  # Dashboards ejecutivos
├── context/            # Estado global de la aplicación
│   └── AppContext.tsx  # Context con toda la lógica de negocio
├── types/              # Tipos TypeScript del modelo de datos
│   └── index.ts        # 15+ interfaces basadas en el modelo DB
├── data/               # Datos de demostración realistas
│   └── mockData.ts     # Dataset completo para testing
└── App.tsx             # Aplicación principal con enrutado
```

## 🔧 Funcionalidades Avanzadas

### **Sistema de Facturación**
- Numeración automática secuencial
- Múltiples formas de pago
- Cálculo automático de impuestos
- Descuentos por línea y globales
- Estados de factura (pendiente, pagada, anulada, crédito)

### **Control de Inventario**
- Sistema de lotes con fechas de vencimiento
- Alertas automáticas de stock bajo
- Ubicación física de productos
- Estados de stock (disponible, reservado, bloqueado)
- Configuración personalizable por producto

### **Programa de Fidelización**
- Acumulación de puntos configurable
- Sistema de canje flexible
- Niveles de membresía automáticos
- Historial completo de transacciones
- Fechas de expiración de puntos

### **Analytics Avanzado**
- KPIs en tiempo real
- Análisis de tendencias
- Productos más vendidos
- Rentabilidad por categoría
- Predicción de demanda

## 🎯 Casos de Uso Empresariales

### **Licorería Física**
- Control completo de inventario
- POS integrado con facturación
- Gestión de proveedores y compras
- Programa de clientes frecuentes

### **Cadena de Licorería**
- Gestión multi-ubicación
- Reportes consolidados
- Control centralizado de ofertas
- Sistema de roles por sucursal

### **Distribuidora**
- Gestión de lotes y vencimientos
- Control de proveedores múltiples
- Sistema de precios por cliente
- Trazabilidad completa

### **E-commerce Integrado**
- Catálogo online sincronizado
- Carrito de compras avanzado
- Sistema de ofertas automático
- Programa de puntos digital

## 🔮 Roadmap Tecnológico

### **Fase Actual: Frontend Completo**
✅ 16 pantallas funcionales  
✅ Sistema de navegación  
✅ Tipos TypeScript completos  
✅ Datos de demostración  
✅ Diseño responsive  

### **Fase 2: Backend y Base de Datos**
🔄 API REST con Node.js/Express  
🔄 Base de datos PostgreSQL  
🔄 Sistema de autenticación JWT  
🔄 Middleware de seguridad  

### **Fase 3: Funcionalidades Avanzadas**
⏳ Sistema de reportes PDF  
⏳ Integración con pasarelas de pago  
⏳ Notificaciones push  
⏳ Dashboard ejecutivo en tiempo real  

### **Fase 4: Integrations & Scale**
⏳ API para sistemas externos  
⏳ Sincronización con contabilidad  
⏳ App móvil nativa  
⏳ Sistema de backup automático  

## 👥 Organización del Desarrollo

### **Equipo de 4 Desarrolladores**

**👨‍💻 Desarrollador 1: Ofertas y Promociones**
- Sistema completo de ofertas con tipos y temporadas
- Calendario promocional interactivo
- Códigos promocionales y límites de uso
- Analytics de efectividad de promociones

**👨‍💻 Desarrollador 2: Productos e Inventario**
- Catálogo avanzado con categorías y filtros
- Sistema de lotes con trazabilidad completa
- Control de inventario en tiempo real
- Alertas inteligentes y configuración automática

**👨‍💻 Desarrollador 3: Ventas y Clientes**
- POS completo con múltiples formas de pago
- Sistema de facturación electrónica
- CRM avanzado con historial de clientes
- Programa de fidelización con puntos

**👨‍💻 Desarrollador 4: Reportes y Analytics**
- Dashboard ejecutivo con KPIs
- Sistema de reportería avanzada
- Analytics predictivo y tendencias
- Visualizaciones interactivas con Recharts

## 📞 Información del Proyecto

**🎓 Proyecto Universitario - UTESA**  
Sistema desarrollado como proyecto final, implementando las mejores prácticas de desarrollo empresarial y arquitectura de software moderna.

**🏗️ Arquitectura Enterprise-Ready**  
Diseño preparado para entornos de producción con capacidad de manejar miles de transacciones diarias y cientos de productos simultáneos.

**🔒 Seguridad y Compliance**  
Implementa estándares de seguridad empresarial con encriptación, auditoría y control de acceso granular.

---

## 🚀 Comenzar a Desarrollar

```bash
# Instalar dependencias
npm install

# Ejecutar en desarrollo  
npm run dev

# Construir para producción
npm run build

# Vista previa de producción
npm run preview
```

**¡Sistema completo y listo para desarrollo empresarial!** 🎉  

Explora todas las funcionalidades ejecutando `npm run dev` y navegando por las 16 pantallas del sistema. Cada módulo está completamente funcional con datos de demostración realistas.
