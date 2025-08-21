import React from 'react';
import { Link } from 'react-router-dom';
import { XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, LineChart, Line } from 'recharts';
import { 
  TrendingUp, 
  Package, 
  AlertTriangle, 
  Tag, 
  Users, 
  ShoppingCart,
  Star,
  BarChart3
} from 'lucide-react';


const Dashboard: React.FC = () => {
  const [dashboardMetrics, setDashboardMetrics] = React.useState<any>(null);
  const COLORS = ['#272727', '#D4AA7D', '#EFD09F', '#666666', '#999999', '#CCCCCC'];

  React.useEffect(() => {
    fetch('http://localhost:3001/api/dashboard')
      .then(res => res.json())
      .then(data => setDashboardMetrics(data));
  }, []);

  if (!dashboardMetrics) {
    return <div className="dashboard"><div className="page-header"><h1 className="page-title"><BarChart3 size={28} />Dashboard Principal</h1></div><p>Cargando métricas...</p></div>;
  }

  return (
    <div className="dashboard">
      <div className="page-header">
        <h1 className="page-title">
          <BarChart3 size={28} />
          Dashboard Principal
        </h1>
      </div>

      {/* Métricas principales */}
      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-value">${dashboardMetrics.totalSales.toLocaleString()}</div>
          <div className="stat-label">Ventas del Mes</div>
          <div className={`stat-growth ${dashboardMetrics.salesGrowth > 0 ? 'positive' : 'negative'}`}>
            <TrendingUp size={16} />
            {dashboardMetrics.salesGrowth > 0 ? '+' : ''}{dashboardMetrics.salesGrowth}% vs mes anterior
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-value">{dashboardMetrics.totalProducts}</div>
          <div className="stat-label">Productos en Catálogo</div>
          <div className="stat-growth">
            <Package size={16} />
            Inventario actualizado
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-value">{dashboardMetrics.lowStockAlerts}</div>
          <div className="stat-label">Alertas de Stock</div>
          <div className="stat-growth negative">
            <AlertTriangle size={16} />
            Requieren atención
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-value">{dashboardMetrics.activeOffers}</div>
          <div className="stat-label">Ofertas Activas</div>
          <div className="stat-growth positive">
            <Tag size={16} />
            Promociones vigentes
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-value">{dashboardMetrics.totalCustomers}</div>
          <div className="stat-label">Clientes Registrados</div>
          <div className="stat-growth">
            <Users size={16} />
            Base de clientes
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-value">{dashboardMetrics.loyaltyMembers}</div>
          <div className="stat-label">Miembros Lealtad</div>
          <div className="stat-growth positive">
            <Star size={16} />
            Programa fidelización
          </div>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '2rem', marginBottom: '2rem' }}>
        {/* Ingresos mensuales */}
        <div className="card">
          <div className="card-header">
            <h3 className="card-title">Ingresos Mensuales</h3>
          </div>
          {Array.isArray(dashboardMetrics.monthlyRevenue) && dashboardMetrics.monthlyRevenue.length > 0 ? (
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={dashboardMetrics.monthlyRevenue}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis />
                <Tooltip formatter={(value) => [`$${value}`, 'Ingresos']} />
                <Line 
                  type="monotone" 
                  dataKey="revenue" 
                  stroke="#8B4513" 
                  strokeWidth={3}
                  dot={{ fill: '#DAA520', strokeWidth: 2, r: 6 }}
                />
              </LineChart>
            </ResponsiveContainer>
          ) : (
            <div style={{ padding: '2rem', textAlign: 'center', color: '#999' }}>
              No hay datos de ingresos mensuales disponibles.
            </div>
          )}
        </div>

        {/* Ventas por categoría */}
        <div className="card">
          <div className="card-header">
            <h3 className="card-title">Ventas por Categoría</h3>
          </div>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={dashboardMetrics.salesByCategory}
                cx="50%"
                cy="50%"
                outerRadius={80}
                fill="#8884d8"
                dataKey="amount"
                label={(entry) => `${entry.category} ${entry.percentage}%`}
              >
                {dashboardMetrics.salesByCategory.map((_entry: { category: string; amount: number; percentage: string }, index: number) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip formatter={(value) => `$${value}`} />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Productos más vendidos */}
      <div className="card">
        <div className="card-header">
          <h3 className="card-title">Productos Más Vendidos</h3>
        </div>
        <div className="table-container">
          <table className="table">
            <thead>
              <tr>
                <th>Producto</th>
                <th>Categoría</th>
                <th>Cantidad Vendida</th>
                <th>Ingresos</th>
                <th>% del Total</th>
              </tr>
            </thead>
            <tbody>
              {dashboardMetrics.topSellingProducts.map((item: { product: { id: number; name: string; brand: string; category: string }; quantity: number; revenue: number }, index: number) => (
                <tr key={item.product.id}>
                  <td>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                      <span style={{ 
                        display: 'flex', 
                        alignItems: 'center', 
                        justifyContent: 'center',
                        width: '24px', 
                        height: '24px', 
                        backgroundColor: '#8B4513', 
                        color: 'white', 
                        borderRadius: '50%',
                        fontSize: '0.8rem',
                        fontWeight: 'bold'
                      }}>
                        {index + 1}
                      </span>
                      <div>
                        <div style={{ fontWeight: '600' }}>{item.product.name}</div>
                        <div style={{ fontSize: '0.8rem', color: '#666' }}>{item.product.brand}</div>
                      </div>
                    </div>
                  </td>
                  <td>
                    <span className={`badge badge-$${
                      item.product.category === 'cerveza' ? 'warning' : 
                      item.product.category === 'whisky' ? 'success' : 'info'
                    }`}>
                      {item.product.category}
                    </span>
                  </td>
                  <td>{item.quantity} unidades</td>
                  <td style={{ fontWeight: '600' }}>${item.revenue.toFixed(2)}</td>
                  <td>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                      <div style={{
                        width: '60px',
                        height: '8px',
                        backgroundColor: '#E0E0E0',
                        borderRadius: '4px',
                        overflow: 'hidden'
                      }}>
                        <div style={{
                          width: `${dashboardMetrics.topSellingProducts[0].revenue > 0 ? (item.revenue / dashboardMetrics.topSellingProducts[0].revenue) * 100 : 0}%`,
                          height: '100%',
                          backgroundColor: '#8B4513'
                        }} />
                      </div>
                      {dashboardMetrics.totalSales > 0 ? ((item.revenue / dashboardMetrics.totalSales) * 100).toFixed(1) : 0}%
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Enlaces rápidos */}
      <div style={{ marginTop: '2rem' }}>
        <h3 style={{ marginBottom: '1rem', color: '#8B4513' }}>Accesos Rápidos</h3>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem' }}>
          <Link to="/pos" className="btn btn-primary">
            <ShoppingCart size={20} />
            Punto de Venta
          </Link>
          <Link to="/offers/new" className="btn btn-secondary">
            <Tag size={20} />
            Crear Oferta
          </Link>
          <Link to="/products/new" className="btn btn-success">
            <Package size={20} />
            Agregar Producto
          </Link>
          <Link to="/reports/sales" className="btn btn-outline">
            <BarChart3 size={20} />
            Ver Reportes
          </Link>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
