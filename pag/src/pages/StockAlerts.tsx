import React from 'react';
import { AlertTriangle, Package, TrendingDown } from 'lucide-react';

const StockAlerts: React.FC = () => {
  // Leer productos desde el backend
  const [products, setProducts] = React.useState<any[]>([]);

  React.useEffect(() => {
    fetch('http://localhost:3001/api/productos')
      .then(res => res.json())
      .then(data => setProducts(data))
      .catch(() => setProducts([]));
  }, []);

  const alerts = products
    .filter(p => Number(p.stock) <= Number(p.stock_minimo || 0))
    .map(product => ({
      id: product.id,
      product,
      type: Number(product.stock) === 0 ? 'sin_stock' : 'stock_bajo',
      priority: Number(product.stock) === 0 ? 'alta' : 'media',
      message: Number(product.stock) === 0 
        ? `${product.producto} está agotado`
        : `${product.producto} tiene stock bajo (${product.stock} unidades)`
    }));

  return (
    <div className="stock-alerts">
      <div className="page-header">
        <h1 className="page-title">
          <AlertTriangle size={28} />
          Alertas de Stock Bajo
        </h1>
      </div>

      <div className="stats-grid" style={{ gridTemplateColumns: 'repeat(3, 1fr)' }}>
        <div className="stat-card">
          <div className="stat-value">{alerts.length}</div>
          <div className="stat-label">Total Alertas</div>
        </div>
        <div className="stat-card">
          <div className="stat-value">{alerts.filter(a => a.type === 'sin_stock').length}</div>
          <div className="stat-label">Sin Stock</div>
          <div className="stat-growth negative">
            <AlertTriangle size={16} />
            Prioridad alta
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-value">{alerts.filter(a => a.type === 'stock_bajo').length}</div>
          <div className="stat-label">Stock Bajo</div>
          <div className="stat-growth negative">
            <TrendingDown size={16} />
            Prioridad media
          </div>
        </div>
      </div>

      <div className="card">
        <div className="card-header">
          <h3 className="card-title">Productos que Requieren Atención</h3>
        </div>

        {alerts.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '3rem' }}>
            <Package size={64} color="#28a745" />
            <h3 style={{ color: '#28a745', marginTop: '1rem' }}>¡Todo está bien!</h3>
            <p style={{ color: '#666' }}>No hay alertas de stock en este momento</p>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            {alerts.map(alert => (
              <div key={alert.id} style={{
                padding: '1.5rem',
                border: `2px solid ${alert.type === 'sin_stock' ? '#dc3545' : '#ffc107'}`,
                borderRadius: '8px',
                backgroundColor: alert.type === 'sin_stock' ? '#fff5f5' : '#fffbf0'
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                  <div>
                    {alert.type === 'sin_stock' ? (
                      <AlertTriangle size={24} color="#dc3545" />
                    ) : (
                      <TrendingDown size={24} color="#ffc107" />
                    )}
                  </div>
                  
                  <div style={{ flex: 1 }}>
                    <div style={{ 
                      display: 'flex', 
                      justifyContent: 'space-between', 
                      alignItems: 'center',
                      marginBottom: '0.5rem'
                    }}>
                      <h4 style={{ 
                        color: alert.type === 'sin_stock' ? '#dc3545' : '#8B4513',
                        marginBottom: 0
                      }}>
                        {alert.product.producto}
                      </h4>
                      <span className={`badge badge-${alert.type === 'sin_stock' ? 'danger' : 'warning'}`}>
                        {alert.type === 'sin_stock' ? 'Sin Stock' : 'Stock Bajo'}
                      </span>
                    </div>
                    
                    <p style={{ 
                      color: '#666', 
                      marginBottom: '0.5rem',
                      fontSize: '0.9rem'
                    }}>
                      {alert.message}
                    </p>
                    
                    <div style={{ 
                      display: 'grid', 
                      gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', 
                      gap: '1rem',
                      fontSize: '0.8rem'
                    }}>
                      <div>
                        {/* <strong>Marca:</strong> {alert.product.marca} */}
                      </div>
                      <div>
                        <strong>Categoría:</strong> {alert.product.categoria}
                      </div>
                      <div>
                        <strong>Stock actual:</strong> {alert.product.stock} unidades
                      </div>
                      <div>
                        <strong>Stock mínimo:</strong> {alert.product.stock_minimo ?? '-'} unidades
                      </div>
                      <div>
                        <strong>Precio:</strong> ${Number(alert.product.precio).toFixed(2)}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default StockAlerts;
