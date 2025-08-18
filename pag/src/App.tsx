import { BrowserRouter as Router, Routes, Route, Link, useLocation } from 'react-router-dom';
import { 
  Home, 
  Package, 
  Users, 
  BarChart3, 
  Tag,
  Calendar,
  AlertTriangle,
  CreditCard
} from 'lucide-react';

// Importar páginas
import Dashboard from './pages/Dashboard.tsx';
import OffersManagement from './pages/OffersManagement.tsx';
import OfferForm from './pages/OfferForm.tsx';
import PromotionCalendar from './pages/PromotionCalendar.tsx';
import ProductCatalog from './pages/ProductCatalog.tsx';
import ProductForm from './pages/ProductForm.tsx';
import InventoryControl from './pages/InventoryControl.tsx';
import StockAlerts from './pages/StockAlerts.tsx';
import POS from './pages/POS.tsx';
import CustomerManagement from './pages/CustomerManagement.tsx';
import LoyaltyProgram from './pages/LoyaltyProgram.tsx';
import SalesReports from './pages/SalesReports.tsx';
import OfferAnalytics from './pages/OfferAnalytics.tsx';

import './App.css';

const Navigation = () => {
  const location = useLocation();
  
  const menuItems = [
    { path: '/', icon: Home, label: 'Dashboard Principal' },
    { 
      label: 'Ofertas y Promociones',
      items: [
        { path: '/offers', icon: Tag, label: 'Gestión Ofertas' },
        { path: '/calendar', icon: Calendar, label: 'Calendario Promocional' },
      ]
    },
    {
      label: 'Productos e Inventario', 
      items: [
        { path: '/products', icon: Package, label: 'Catálogo Productos' },
        { path: '/inventory', icon: Package, label: 'Control Inventario' },
        { path: '/alerts', icon: AlertTriangle, label: 'Alertas Stock' },
      ]
    },
    {
      label: 'Ventas y Clientes',
      items: [
        { path: '/pos', icon: CreditCard, label: 'Punto de Venta (POS)' },
        { path: '/customers', icon: Users, label: 'Gestión Clientes' },
        { path: '/loyalty', icon: Users, label: 'Programa Fidelización' },
      ]
    },
    {
      label: 'Reportes y Analíticas',
      items: [
        { path: '/reports/sales', icon: BarChart3, label: 'Reportes Ventas' },
        { path: '/reports/offers', icon: BarChart3, label: 'Análisis Ofertas' },
      ]
    }
  ];

  return (
    <nav className="sidebar">
      <div className="sidebar-header">
        <img src="/logo.png" alt="Logo" />
      </div>
      <div className="sidebar-menu">
        {menuItems.map((item, index) => (
          <div key={index}>
            {item.path ? (
              <Link 
                to={item.path} 
                className={`menu-item ${location.pathname === item.path ? 'active' : ''}`}
              >
                <item.icon size={20} />
                <span>{item.label}</span>
              </Link>
            ) : (
              <div className="menu-section">
                <div className="menu-section-title">{item.label}</div>
                {item.items?.map((subItem, subIndex) => (
                  <Link 
                    key={subIndex}
                    to={subItem.path} 
                    className={`menu-item sub-item ${location.pathname === subItem.path ? 'active' : ''}`}
                  >
                    <subItem.icon size={18} />
                    <span>{subItem.label}</span>
                  </Link>
                ))}
              </div>
            )}
          </div>
        ))}
      </div>
    </nav>
  );
};

function App() {
  return (
    <Router>
      <div className="app">
        <Navigation />
        <main className="main-content">
          <Routes>
            <Route path="/" element={<Dashboard />} />
            
            {/* Ofertas y Promociones */}
            <Route path="/offers" element={<OffersManagement />} />
            <Route path="/offers/new" element={<OfferForm />} />
            <Route path="/offers/edit/:id" element={<OfferForm />} />
            <Route path="/calendar" element={<PromotionCalendar />} />
            
            {/* Productos e Inventario */}
            <Route path="/products" element={<ProductCatalog />} />
            <Route path="/products/new" element={<ProductForm />} />
            <Route path="/products/edit/:id" element={<ProductForm />} />
            <Route path="/inventory" element={<InventoryControl />} />
            <Route path="/alerts" element={<StockAlerts />} />
            
            {/* Ventas y Clientes */}
            <Route path="/pos" element={<POS />} />
            <Route path="/customers" element={<CustomerManagement />} />
            <Route path="/loyalty" element={<LoyaltyProgram />} />
            
            {/* Reportes y Analíticas */}
            <Route path="/reports/sales" element={<SalesReports />} />
            <Route path="/reports/offers" element={<OfferAnalytics />} />
          </Routes>
        </main>
      </div>
    </Router>
  );
}

export default App;
