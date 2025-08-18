import React, { useState } from 'react';
import { Settings, Package, AlertTriangle, TrendingDown, TrendingUp, Plus, Search, Filter } from 'lucide-react';
import type { InventoryConfigDisplay, StockMovementDisplay, BatchDisplay, ProductDisplay } from '../types';

const AdvancedInventoryControl: React.FC = () => {
  const [inventoryConfigs] = useState<InventoryConfigDisplay[]>([
    {
      id: '1',
      productId: 'p1',
      minStock: 10,
      maxStock: 100,
      reorderPoint: 20,
      leadTimeDays: 7,
      safetyStock: 15,
      autoReorder: true,
      supplierId: 's1',
      lastUpdated: new Date('2024-08-01')
    },
    {
      id: '2',
      productId: 'p2', 
      minStock: 5,
      maxStock: 50,
      reorderPoint: 12,
      leadTimeDays: 10,
      safetyStock: 8,
      autoReorder: false,
      lastUpdated: new Date('2024-08-03')
    }
  ]);

  const [stockMovements] = useState<StockMovementDisplay[]>([
    {
      id: '1',
      productId: 'p1',
      type: 'entrada',
      quantity: 50,
      reason: 'Compra a proveedor',
      date: new Date('2024-08-05'),
      userId: 'u1',
      batchNumber: 'LOTE-001',
      cost: 15.50
    },
    {
      id: '2',
      productId: 'p2',
      type: 'salida',
      quantity: -8,
      reason: 'Venta al público',
      date: new Date('2024-08-04'),
      userId: 'u1'
    },
    {
      id: '3',
      productId: 'p1',
      type: 'ajuste',
      quantity: -2,
      reason: 'Merma por rotura',
      date: new Date('2024-08-03'),
      userId: 'u1'
    }
  ]);

  const [batches] = useState<BatchDisplay[]>([
    {
      id: '1',
      productId: 'p1',
      batchNumber: 'LOTE-001',
      expirationDate: new Date('2025-12-31'),
      quantity: 48,
      costPerUnit: 15.50,
      supplierName: 'Distribuidora Premium',
      status: 'active',
      createdAt: new Date('2024-08-01')
    },
    {
      id: '2',
      productId: 'p2',
      batchNumber: 'LOTE-002', 
      expirationDate: new Date('2024-10-15'),
      quantity: 12,
      costPerUnit: 22.00,
      supplierName: 'Importadora Elite',
      status: 'active',
      createdAt: new Date('2024-07-20')
    }
  ]);

  // Leer productos desde localStorage
  const [products, setProducts] = useState<ProductDisplay[]>([]);

  React.useEffect(() => {
    const stored = localStorage.getItem('products');
    if (stored) {
      const parsed = JSON.parse(stored).map((p: any) => ({
        ...p,
        createdAt: p.createdAt ? new Date(p.createdAt) : undefined
      }));
      setProducts(parsed);
    }
  }, []);

  const getProductName = (productId: string): string => {
    return products.find(p => p.id === productId)?.name || 'Producto';
  };

  const getStockStatus = (config: InventoryConfigDisplay): 'critical' | 'low' | 'optimal' | 'high' => {
    const product = products.find(p => p.id === config.productId);
    if (!product) return 'optimal';
    
    if (product.stock <= config.minStock) return 'critical';
    if (product.stock <= config.reorderPoint) return 'low';
    if (product.stock >= config.maxStock) return 'high';
    return 'optimal';
  };

  const getDaysUntilExpiration = (expirationDate: Date): number => {
    const today = new Date();
    const diffTime = expirationDate.getTime() - today.getTime();
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  };

  const [searchTerm, setSearchTerm] = useState<string>('');

  return (
    <div className="advanced-inventory-control">
      <div className="page-header">
        <h1 className="page-title">
          <Settings size={28} />
          Control de Inventario Avanzado
        </h1>
        <div style={{ display: 'flex', gap: '1rem' }}>
          <button className="btn btn-outline">
            <Filter size={16} />
            Filtros
          </button>
          <button className="btn btn-primary">
            <Plus size={16} />
            Nuevo Lote
          </button>
        </div>
      </div>

      {/* Estadísticas de Inventario */}
      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-value">
            {inventoryConfigs.filter(config => getStockStatus(config) === 'critical').length}
          </div>
          <div className="stat-label">Stock Crítico</div>
          <div className="stat-growth negative">
            <AlertTriangle size={16} />
            Requieren reorden
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-value">
            {batches.filter(batch => getDaysUntilExpiration(batch.expirationDate) <= 30).length}
          </div>
          <div className="stat-label">Lotes por Vencer</div>
        </div>
        <div className="stat-card">
          <div className="stat-value">
            {inventoryConfigs.filter(config => config.autoReorder).length}
          </div>
          <div className="stat-label">Reorden Automático</div>
        </div>
        <div className="stat-card">
          <div className="stat-value">
            {batches.reduce((sum, batch) => sum + batch.quantity, 0)}
          </div>
          <div className="stat-label">Unidades Totales</div>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '2rem', marginBottom: '2rem' }}>
        {/* Configuración de Productos */}
        <div className="card">
          <div className="card-header">
            <h3 className="card-title">Configuración por Producto</h3>
            <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
              <div style={{ position: 'relative' }}>
                <Search size={16} style={{ 
                  position: 'absolute', 
                  left: '8px', 
                  top: '50%', 
                  transform: 'translateY(-50%)',
                  color: '#666'
                }} />
                <input 
                  type="text"
                  placeholder="Buscar producto..."
                  className="form-control"
                  style={{ paddingLeft: '2rem', width: '200px' }}
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
            </div>
          </div>
          <div className="table-container">
            <table className="table">
              <thead>
                <tr>
                  <th>Producto</th>
                  <th>Stock Actual</th>
                  <th>Estado</th>
                  <th>Min/Máx</th>
                  <th>Punto Reorden</th>
                  <th>Auto-Reorden</th>
                </tr>
              </thead>
              <tbody>
                {inventoryConfigs.map(config => {
                  const product = products.find(p => p.id === config.productId);
                  const status = getStockStatus(config);
                  return (
                    <tr key={config.id}>
                      <td>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                          <Package size={16} color="#666" />
                          <div>
                            <div style={{ fontWeight: '600' }}>{getProductName(config.productId)}</div>
                            <div style={{ fontSize: '0.8rem', color: '#666' }}>
                              {product?.category}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td style={{ fontWeight: '600' }}>
                        {product?.stock || 0} unidades
                      </td>
                      <td>
                        <span className={`badge ${
                          status === 'critical' ? 'badge-danger' :
                          status === 'low' ? 'badge-warning' :
                          status === 'high' ? 'badge-info' : 'badge-success'
                        }`}>
                          {status === 'critical' ? 'Crítico' :
                           status === 'low' ? 'Bajo' :
                           status === 'high' ? 'Alto' : 'Óptimo'}
                        </span>
                      </td>
                      <td>
                        <span style={{ fontSize: '0.85rem' }}>
                          {config.minStock} - {config.maxStock}
                        </span>
                      </td>
                      <td>
                        <span style={{ fontSize: '0.85rem', fontWeight: '600' }}>
                          {config.reorderPoint}
                        </span>
                      </td>
                      <td>
                        <span className={`badge ${config.autoReorder ? 'badge-success' : 'badge-secondary'}`}>
                          {config.autoReorder ? 'Activo' : 'Manual'}
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>

        {/* Lotes Próximos a Vencer */}
        <div className="card">
          <div className="card-header">
            <h3 className="card-title">Lotes por Vencer</h3>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            {batches
              .filter(batch => getDaysUntilExpiration(batch.expirationDate) <= 90)
              .sort((a, b) => getDaysUntilExpiration(a.expirationDate) - getDaysUntilExpiration(b.expirationDate))
              .map(batch => {
                const daysLeft = getDaysUntilExpiration(batch.expirationDate);
                return (
                  <div key={batch.id} style={{
                    padding: '1rem',
                    border: `1px solid ${daysLeft <= 7 ? '#dc3545' : daysLeft <= 30 ? '#ffc107' : '#28a745'}`,
                    borderRadius: '8px',
                    backgroundColor: daysLeft <= 7 ? '#fff5f5' : daysLeft <= 30 ? '#fffbf0' : '#f8fff9'
                  }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start' }}>
                      <div>
                        <div style={{ fontWeight: '600', fontSize: '0.9rem' }}>
                          {getProductName(batch.productId)}
                        </div>
                        <div style={{ fontSize: '0.8rem', color: '#666' }}>
                          Lote: {batch.batchNumber}
                        </div>
                        <div style={{ fontSize: '0.8rem', color: '#666' }}>
                          {batch.quantity} unidades
                        </div>
                      </div>
                      <span className={`badge ${
                        daysLeft <= 0 ? 'badge-danger' :
                        daysLeft <= 7 ? 'badge-warning' :
                        daysLeft <= 30 ? 'badge-info' : 'badge-success'
                      }`} style={{ fontSize: '0.75rem' }}>
                        {daysLeft <= 0 ? 'Vencido' :
                         daysLeft === 1 ? '1 día' :
                         `${daysLeft} días`}
                      </span>
                    </div>
                  </div>
                );
              })}
          </div>
        </div>
      </div>

      {/* Movimientos de Stock Recientes */}
      <div className="card">
        <div className="card-header">
          <h3 className="card-title">Movimientos de Stock Recientes</h3>
        </div>
        <div className="table-container">
          <table className="table">
            <thead>
              <tr>
                <th>Fecha</th>
                <th>Producto</th>
                <th>Tipo</th>
                <th>Cantidad</th>
                <th>Motivo</th>
                <th>Lote</th>
                <th>Costo</th>
              </tr>
            </thead>
            <tbody>
              {stockMovements
                .sort((a, b) => b.date.getTime() - a.date.getTime())
                .map(movement => (
                <tr key={movement.id}>
                  <td>{new Intl.DateTimeFormat('es-ES').format(movement.date)}</td>
                  <td>{getProductName(movement.productId)}</td>
                  <td>
                    <span className={`badge ${
                      movement.type === 'entrada' ? 'badge-success' :
                      movement.type === 'salida' ? 'badge-info' :
                      movement.type === 'ajuste' ? 'badge-warning' : 'badge-danger'
                    }`}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                        {movement.type === 'entrada' && <TrendingUp size={12} />}
                        {movement.type === 'salida' && <TrendingDown size={12} />}
                        {movement.type === 'entrada' ? 'Entrada' :
                         movement.type === 'salida' ? 'Salida' :
                         movement.type === 'ajuste' ? 'Ajuste' : 'Merma'}
                      </div>
                    </span>
                  </td>
                  <td style={{ 
                    fontWeight: '600',
                    color: movement.quantity > 0 ? '#28a745' : '#dc3545'
                  }}>
                    {movement.quantity > 0 ? '+' : ''}{movement.quantity}
                  </td>
                  <td>{movement.reason}</td>
                  <td>
                    {movement.batchNumber && (
                      <span className="badge badge-outline">{movement.batchNumber}</span>
                    )}
                  </td>
                  <td>
                    {movement.cost && (
                      <span style={{ fontWeight: '600' }}>${movement.cost.toFixed(2)}</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default AdvancedInventoryControl;
