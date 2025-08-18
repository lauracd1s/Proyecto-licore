import React from 'react';
import { Package, TrendingDown, AlertTriangle } from 'lucide-react';

const InventoryControl: React.FC = () => {
  // Leer productos desde el backend
  const [products, setProducts] = React.useState<any[]>([]);

  React.useEffect(() => {
    fetch('http://localhost:3001/api/productos')
      .then(res => res.json())
      .then(data => setProducts(data))
      .catch(() => setProducts([]));
  }, []);

  const lowStockProducts = products.filter(p => Number(p.stock) <= Number(p.stock_minimo || 0) && Number(p.stock) > 0);
  const outOfStockProducts = products.filter(p => Number(p.stock) === 0);
  const totalInventoryValue = products.reduce((total, p) => total + (Number(p.stock) * (Number(p.precio) || 0)), 0);

  return (
    <div className="inventory-control">
      <div className="page-header">
        <h1 className="page-title">
          <Package size={28} />
          Control de Inventario
        </h1>
      </div>

      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-value">${totalInventoryValue.toFixed(2)}</div>
          <div className="stat-label">Valor Total del Inventario</div>
        </div>
        <div className="stat-card">
          <div className="stat-value">{products.reduce((total, p) => total + p.stock, 0)}</div>
          <div className="stat-label">Total Unidades en Stock</div>
        </div>
        <div className="stat-card">
          <div className="stat-value">{lowStockProducts.length}</div>
          <div className="stat-label">Productos con Stock Bajo</div>
          <div className="stat-growth negative">
            <TrendingDown size={16} />
            Requieren reabastecimiento
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-value">{outOfStockProducts.length}</div>
          <div className="stat-label">Productos Sin Stock</div>
          <div className="stat-growth negative">
            <AlertTriangle size={16} />
            Atención inmediata
          </div>
        </div>
      </div>

      <div className="card">
        <div className="card-header">
          <h3 className="card-title">Estado del Inventario por Producto</h3>
        </div>
        <div className="table-container">
          <table className="table">
            <thead>
              <tr>
                <th>Producto</th>
                <th>Stock Actual</th>
                <th>Stock Mínimo</th>
                <th>Estado</th>
                <th>Valor en Stock</th>
              </tr>
            </thead>
            <tbody>
              {products.map(product => {
                const isLowStock = Number(product.stock) <= Number(product.stock_minimo || 0) && Number(product.stock) > 0;
                const isOutOfStock = Number(product.stock) === 0;
                return (
                  <tr key={product.id}>
                    <td>
                      <div>
                        <div style={{ fontWeight: '600' }}>{product.producto}</div>
                        <div style={{ fontSize: '0.8rem', color: '#666' }}>
                          {product.categoria}
                        </div>
                      </div>
                    </td>
                    <td style={{ fontWeight: '600' }}>
                      {product.stock} unidades
                    </td>
                    <td>{product.stock_minimo ?? '-'} unidades</td>
                    <td>
                      {isOutOfStock ? (
                        <span className="badge badge-danger">Sin Stock</span>
                      ) : isLowStock ? (
                        <span className="badge badge-warning">Stock Bajo</span>
                      ) : (
                        <span className="badge badge-success">Stock OK</span>
                      )}
                    </td>
                    <td style={{ fontWeight: '600' }}>
                      ${(Number(product.stock) * (Number(product.precio) || 0)).toFixed(2)}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default InventoryControl;
